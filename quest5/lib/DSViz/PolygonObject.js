/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 * 
 * This code is provided mainly for educational purposes at Bucknell University.
 *
 * This code is licensed under the Creative Commons Attribution-NonCommerical 4.0
 * International License. To view a copy of the license, visit 
 *   https://creativecommons.org/licenses/by-nc/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * You are free to:
 *  - Share: copy and redistribute the material in any medium or format.
 *  - Adapt: remix, transform, and build upon the material.
 *
 * Under the following terms:
 *  - Attribution: You must give appropriate credit, provide a link to the license,
 *                 and indicate if changes where made.
 *  - NonCommerical: You may not use the material for commerical purposes.
 *  - No additional restrictions: You may not apply legal terms or technological 
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
 */

import SceneObject from "/lib/DSViz/SceneObject.js";
import Polygon from "/lib/DS/Polygon.js";

export default class PolygonObject extends SceneObject {
    constructor(device, canvasFormat, filename, canvas) {
        super(device, canvasFormat);
        this._polygon = new Polygon(filename);
        this._canvas = canvas;

        if (this._canvas) {
            this._initMouseTracking();
        } else {
            console.error("Canvas is undefined in PolygonObject constructor.");
        }
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
        let shaderCode = await this.loadShader("/shaders/standard2d.wgsl");
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

    // Initialize mouse tracking
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
  
      // Calculate winding number
      const windingNumber = this.calculateWindingNumber(mousePos);
      console.log(`Winding Number: ${windingNumber}`);
  
      // Check if the mouse is inside the polygon using winding number
      const isInsidePolygon = windingNumber !== 0;
      console.log(isInsidePolygon ? "inside" : "outside");
  
      // Change the cursor based on whether it's inside or outside the polygon
      if (isInsidePolygon) {
          this._canvas.style.cursor = 'pointer';  // Change to pointer if inside
      } else {
          this._canvas.style.cursor = 'default';  // Change to default if outside
      }
  }
  
  

    // Calculate the winding number for a point inside a polygon
    calculateWindingNumber(point) {
      let windingNumber = 0;
      const polygon = this._polygon._polygon;
  
      for (let i = 0; i < polygon.length - 1; i++) {
          const v1 = polygon[i];
          const v2 = polygon[i + 1];
  
          // Handle vertical edges explicitly
          if (v1[0] === v2[0]) { // vertical edge
              if (point[0] < v1[0]) { // check if point is to the left of the vertical edge
                  if ((v1[1] <= point[1] && point[1] < v2[1]) || (v2[1] <= point[1] && point[1] < v1[1])) {
                      windingNumber += (v1[1] > v2[1]) ? 1 : -1;
                  }
              }
          } else { // non-vertical edge
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
  
}
