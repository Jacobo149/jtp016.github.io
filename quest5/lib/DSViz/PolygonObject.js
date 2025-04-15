import SceneObject from "./SceneObject.js";
import Polygon from "../DS/Polygon.js";

export default class PolygonObject extends SceneObject {
    constructor(device, canvasFormat, filename, canvas, statusTextElement = null) {
        super(device, canvasFormat);
        this._polygon = new Polygon(filename);
        this._canvas = canvas;
        this._statusTextElement = statusTextElement;

        this._lastInside = false; // To detect entry
        this._effectCallback = null;

        if (this._canvas) {
            this._initMouseTracking();
        } else {
            console.error("Canvas is undefined in PolygonObject constructor.");
        }
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
            label: "Vertices Normals and More " + this.getName(),
            size: this._vertices.length * Float32Array.BYTES_PER_ELEMENT,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
            mappedAtCreation: true
        });

        new Float32Array(this._vertexBuffer.getMappedRange()).set(this._vertices);
        this._vertexBuffer.unmap();

        this._vertexBufferLayout = {
            arrayStride: this._dim * Float32Array.BYTES_PER_ELEMENT,
            attributes: [
                {
                    format: "float32x" + this._dim.toString(),
                    offset: 0,
                    shaderLocation: 0,
                },
            ]
        };
    }

    async createShaders() {
        let shaderCode = await this.loadShader("./shaders/standard2d.wgsl");
        this._shaderModule = this._device.createShaderModule({
            label: "Shader " + this.getName(),
            code: shaderCode,
        });
    }

    async createRenderPipeline() {
        this._renderPipeline = this._device.createRenderPipeline({
            label: "Render Pipeline " + this.getName(),
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

    render(pass) {
        pass.setPipeline(this._renderPipeline);
        pass.setVertexBuffer(0, this._vertexBuffer);
        pass.draw(this._numV);
    }

    async createComputePipeline() {}
    compute(pass) {}

    _initMouseTracking() {
        if (!this._canvas) {
            console.error("Canvas is undefined in _initMouseTracking.");
            return;
        }
        this._canvas.addEventListener("mousemove", (event) => this._onMouseMove(event));
    }

    _onMouseMove(event) {
        if (!this._canvas) return;

        const rect = this._canvas.getBoundingClientRect();
        const mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        const mouseY = ((event.clientY - rect.top) / rect.height) * -2 + 1;
        const mousePos = [mouseX, mouseY];

        const windingNumber = this.calculateWindingNumber(mousePos);
        const isInsidePolygon = windingNumber !== 0;

        // Update status
        if (this._statusTextElement) {
            this._statusTextElement.innerText = isInsidePolygon ? 'Mouse: Inside Polygon' : 'Mouse: Outside Polygon';
        }

        this._canvas.style.cursor = isInsidePolygon ? 'pointer' : 'default';

        // Trigger effect on entry
        if (isInsidePolygon && !this._lastInside && this._effectCallback) {
            this._effectCallback(event.clientX, event.clientY);
        }

        this._lastInside = isInsidePolygon;
    }

    calculateWindingNumber(point) {
        let windingNumber = 0;
        const polygon = this._polygon._polygon;

        for (let i = 0; i < polygon.length - 1; i++) {
            const v1 = polygon[i];
            const v2 = polygon[i + 1];

            if (v1[0] === v2[0]) {
                if (point[0] < v1[0]) {
                    if ((v1[1] <= point[1] && point[1] < v2[1]) || (v2[1] <= point[1] && point[1] < v1[1])) {
                        windingNumber += (v1[1] > v2[1]) ? 1 : -1;
                    }
                }
            } else {
                if (v1[1] <= point[1]) {
                    if (v2[1] > point[1] && this.isLeft(v1, v2, point)) {
                        windingNumber++;
                    }
                } else {
                    if (v2[1] <= point[1] && this.isLeft(v1, v2, point)) {
                        windingNumber--;
                    }
                }
            }
        }

        return windingNumber;
    }

    isLeft(p0, p1, p2) {
        return ((p1[0] - p0[0]) * (p2[1] - p0[1]) - (p2[0] - p0[0]) * (p1[1] - p0[1])) > 0;
    }
}
