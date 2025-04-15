import SceneObject from "./SceneObject.js";
import Polygon from "../DS/Polygon.js";

export default class PolygonObject extends SceneObject {
    constructor(device, canvasFormat, filename, canvas, statusTextElement = null) {
        super(device, canvasFormat);
        this._polygon = new Polygon(filename);
        this._canvas = canvas;
        this._statusTextElement = statusTextElement;

        this._gravity = -0.002;
        this._floorY = -0.8;
        this._verticesVel = [];
        this._edgePairs = [];

        this._stiffness = 0.5; // Default stiffness (0 = no constraint, 1 = strong constraint)
        
        this._lastInside = false;
        this._effectCallback = null;

        if (this._canvas) this._initMouseTracking();

        // Bind keyboard input handling
        this._initKeyboardInput();
    }

    setEffectCallback(callback) {
        this._effectCallback = callback;
    }

    async createGeometry() {
        await this._polygon.init();
        this._numV = this._polygon._numV;
        this._dim = this._polygon._dim;
        this._vertices = this._polygon._polygon.flat();

        this._vertexBuffer = this._device.createBuffer({
            label: "Vertices",
            size: this._vertices.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new Float32Array(this._vertexBuffer.getMappedRange()).set(this._vertices);
        this._vertexBuffer.unmap();

        this._vertexBufferLayout = {
            arrayStride: this._dim * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                { format: "float32x" + this._dim.toString(), offset: 0, shaderLocation: 0 },
            ]
        };

        this._initializePhysics();
    }

    _initializePhysics() {
        this._verticesVel = new Array(this._numV).fill(0).map(() => [0, 0]);

        const polygon = this._polygon._polygon;
        for (let i = 0; i < polygon.length - 1; i++) {
            const v1 = polygon[i];
            const v2 = polygon[i + 1];
            const dx = v2[0] - v1[0];
            const dy = v2[1] - v1[1];
            const restLength = Math.sqrt(dx * dx + dy * dy);
            this._edgePairs.push({ i1: i, i2: i + 1, restLength });
        }
    }

    updatePhysics() {
        const pos = this._polygon._polygon;
        const vel = this._verticesVel;

        // Apply gravity and integrate velocity
        for (let i = 0; i < pos.length; i++) {
            vel[i][1] += this._gravity;
            pos[i][0] += vel[i][0];
            pos[i][1] += vel[i][1];

            if (pos[i][1] < this._floorY) {
                pos[i][1] = this._floorY;
                vel[i][1] *= -1; // bounce damping
            }
        }

        // Apply PBD edge constraints with stiffness
        for (let iter = 0; iter < 5; iter++) {
            for (const edge of this._edgePairs) {
                const p1 = pos[edge.i1];
                const p2 = pos[edge.i2];
                let dx = p2[0] - p1[0];
                let dy = p2[1] - p1[1];
                let dist = Math.sqrt(dx * dx + dy * dy);
                if (dist === 0) continue;

                let diff = (dist - edge.restLength) / dist * this._stiffness; // Apply stiffness
                let offsetX = dx * diff;
                let offsetY = dy * diff;

                p1[0] += offsetX;
                p1[1] += offsetY;
                p2[0] -= offsetX;
                p2[1] -= offsetY;
            }
        }

        this._vertices = pos.flat();
        this._device.queue.writeBuffer(this._vertexBuffer, 0, new Float32Array(this._vertices));
    }

    render(pass) {
        this.updatePhysics();
        pass.setPipeline(this._renderPipeline);
        pass.setVertexBuffer(0, this._vertexBuffer);
        pass.draw(this._numV);
    }

    async createShaders() {
        let shaderCode = await this.loadShader("./shaders/standard2d.wgsl");
        this._shaderModule = this._device.createShaderModule({ code: shaderCode });
    }

    async createRenderPipeline() {
        this._renderPipeline = this._device.createRenderPipeline({
            layout: "auto",
            vertex: {
                module: this._shaderModule,
                entryPoint: "vertexMain",
                buffers: [this._vertexBufferLayout]
            },
            fragment: {
                module: this._shaderModule,
                entryPoint: "fragmentMain",
                targets: [{ format: this._canvasFormat }]
            },
            primitive: {
                topology: 'line-strip'
            }
        });
    }

    async createComputePipeline() {}
    compute(pass) {}

    _initMouseTracking() {
        this._canvas.addEventListener("mousemove", (event) => this._onMouseMove(event));
    }

    _onMouseMove(event) {
        const rect = this._canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = ((event.clientY - rect.top) / rect.height) * -2 + 1;
        const mousePos = [mouseX, mouseY];

        const inside = this.calculateWindingNumber(mousePos) !== 0;
        if (this._statusTextElement)
            this._statusTextElement.innerText = inside ? 'Mouse: Inside Polygon' : 'Mouse: Outside Polygon';

        this._canvas.style.cursor = inside ? 'pointer' : 'default';
        if (inside && !this._lastInside && this._effectCallback)
            this._effectCallback(event.clientX, event.clientY);

        this._lastInside = inside;
    }

    calculateWindingNumber(point) {
        let windingNumber = 0;
        const polygon = this._polygon._polygon;

        for (let i = 0; i < polygon.length - 1; i++) {
            const v1 = polygon[i];
            const v2 = polygon[i + 1];

            if (v1[1] <= point[1]) {
                if (v2[1] > point[1] && this.isLeft(v1, v2, point)) windingNumber++;
            } else {
                if (v2[1] <= point[1] && this.isLeft(v1, v2, point)) windingNumber--;
            }
        }

        return windingNumber;
    }

    isLeft(p0, p1, p2) {
        return ((p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])) > 0;
    }

    // Keyboard input handling to adjust stiffness
    _initKeyboardInput() {
        window.addEventListener("keydown", (event) => this._onKeyDown(event));
    }

    _onKeyDown(event) {
        if (event.key === "ArrowUp") {
            this._stiffness = Math.min(1, this._stiffness + 0.05);  // Increase stiffness, max = 1
            console.log("Increased stiffness: " + this._stiffness);
        } else if (event.key === "ArrowDown") {
            this._stiffness = Math.max(0, this._stiffness - 0.05);  // Decrease stiffness, min = 0
            console.log("Decreased stiffness: " + this._stiffness);
        }
    }
}
