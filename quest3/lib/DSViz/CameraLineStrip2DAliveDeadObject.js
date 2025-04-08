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

import SceneObject from "./SceneObject.js"

export default class CameraLineStrip2DAliveDeadObject extends SceneObject {
  constructor(device, canvasFormat, cameraPose, vertices) {
    super(device, canvasFormat);
    // This assume each vertex has (x, y)
    this._cameraPose = cameraPose;
    this._paused = false; // Add flag for paused state
    this._speedFactor = 1.0; // Add speed factor for simulation speed
    if (typeof this._vertices === Float32Array) this._vertices = vertices; 
    else this._vertices = new Float32Array(vertices);


    this._canvas = document.querySelector('canvas'); // Assuming you're using a canvas element
    this._cellSize = 10; // Example size of each cell in the grid
    this._gridWidth = 256; // Assuming 256 cells in width
    this._gridHeight = 256; // Assuming 256 cells in height

    // Initialize grid as dead (0 means dead, 1 means alive)
    this._grid = new Array(this._gridWidth * this._gridHeight).fill(0);

     // Event listener to toggle pause when "p" is pressed
     window.addEventListener("keydown", (event) => {
      if (event.key === "p") {
        this.togglePause(); // Toggle pause when "p" is pressed
      } else if (event.key === "t") {
        this.speedUp(); // Speed up when "q" is pressed
      } else if (event.key === "r") {
        this.slowDown(); // Slow down when "r" is pressed
      }
    });

    // Mouse click event listener
    this._canvas.addEventListener('mousedown', (event) => this.onMouseDown(event));
  }

  // Speed up the simulation (increase speed factor)
  speedUp() {
    this._speedFactor *= 1.2; // Increase speed by 20%
    console.log(`Simulation speed: ${this._speedFactor.toFixed(2)}x`);
  }

  // Slow down the simulation (decrease speed factor)
  slowDown() {
    this._speedFactor *= 0.8; // Decrease speed by 20%
    console.log(`Simulation speed: ${this._speedFactor.toFixed(2)}x`);
  }

  onMouseDown(event) {
    if (this._paused) return; // Do nothing if paused
  
    const rect = this._canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
  
    // Convert mouse position to grid coordinates
    const gridX = Math.floor(mouseX / this._cellSize);
    const gridY = Math.floor(mouseY / this._cellSize);
  
    // Make sure the click is within bounds of the grid
    if (gridX >= 0 && gridX < this._gridWidth && gridY >= 0 && gridY < this._gridHeight) {
      const index = gridY * this._gridWidth + gridX;
  
      // Set the clicked cell to alive (1)
      if (this._grid[index] === 0) {
        this._grid[index] = 1;
        console.log(`Cell at (${gridX}, ${gridY}) turned alive.`);
      }
    }
  }
  


   // Toggle the paused state
   togglePause() {
    this._paused = !this._paused;
    console.log(`Simulation ${this._paused ? 'paused' : 'resumed'}`);
  }
  
  async createGeometry() {
    // Create vertex buffer to store the vertices in GPU
    this._vertexBuffer = this._device.createBuffer({
      label: "Vertices " + this.getName(),
      size: this._vertices.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._vertexBuffer, 0, this._vertices);
    // Defne vertex buffer layout - how the GPU should read the buffer
    this._vertexBufferLayout = {
      arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
      attributes: [{ 
        // position 0 has two floats
        shaderLocation: 0,   // position in the vertex shader
        format: "float32x2", // two coordiantes
        offset: 0,           // no offset in the vertex buffer
      }],
    };
    // Create camera pose buffer to store the uniform color in GPU
    this._cameraPoseBuffer = this._device.createBuffer({
      label: "Camera Pose " + this.getName(),
      size: this._cameraPose.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    }); 
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._cameraPoseBuffer, 0, this._cameraPose);
    // an array of cell statuses in CPU
    this._cellStatus = new Uint32Array(256 * 256); 

    // Create a storage ping-pong-buffer to hold the cell status.
    this._cellStateBuffers = [
      this._device.createBuffer({
        label: "Grid status Buffer 1 " + this.getName(),
        size: this._cellStatus.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      this._device.createBuffer({
        label: "Grid status Buffer 2 " + this.getName(),
        size: this._cellStatus.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
    ];
    
    // Copy from CPU to GPU
    this._device.queue.writeBuffer(this._cellStateBuffers[0], 0, this._cellStatus);
    // Set a step counter
    this._step = 0;
  }
  
  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraPoseBuffer, 0, this._cameraPose);
  }
  
  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/camera2dalivedead.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    // Create the bind group layout
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Grid Bind Group Layout " + this.getName(),
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.VERTEX ,
        buffer: {} // Camera uniform buffer
      }, {
        binding: 1,
        visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
        buffer: { type: "read-only-storage"} // Cell status input buffer
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        buffer: { type: "storage"} // Cell status output buffer
      }]
    });
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Grid Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
    });
  }
  
  async createRenderPipeline() {
    this._renderPipeline = this._device.createRenderPipeline({
      label: "Render Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      vertex: {
        module: this._shaderModule,         // the shader code
        entryPoint: "vertexMain",           // the shader function
        buffers: [this._vertexBufferLayout] // the binded buffer layout
      },
      fragment: {
        module: this._shaderModule,    // the shader code
        entryPoint: "fragmentMain",    // the shader function
        targets: [{
          format: this._canvasFormat   // the target canvas format
        }]
      },
      primitive: {                     // instead of drawing triangles
        topology: 'line-strip'         // draw line strip
      }
    }); 
    // create bind group to bind the uniform buffer
    this._bindGroups = [
      this._device.createBindGroup({
        label: "Renderer Bind Group 1 " + this.getName(),
        layout: this._renderPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: { buffer: this._cameraPoseBuffer }
        }, {
          binding: 1,
          resource: { buffer: this._cellStateBuffers[0] }
        },
        {
          binding: 2,
          resource: { buffer: this._cellStateBuffers[1] }
        }],
      }),
      this._device.createBindGroup({
        label: "Renderer Bind Group 2 " + this.getName(),
        layout: this._renderPipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: { buffer: this._cameraPoseBuffer }
        }, {
          binding: 1,
          resource: { buffer: this._cellStateBuffers[1] }
        },
        {
          binding: 2,
          resource: { buffer: this._cellStateBuffers[0] }
        }],
      })
    ];
  }
  
  render(pass) {
    if (this._paused) return; // Skip rendering if paused
    // add to render pass to draw the object
    pass.setPipeline(this._renderPipeline);      // which render pipeline to use
    pass.setVertexBuffer(0, this._vertexBuffer); // how the buffer are binded
    pass.setBindGroup(0, this._bindGroups[this._step % 2]);       // bind the uniform buffer
    pass.draw(4, this._gridWidth * this._gridHeight); // For each grid cell  // number of vertices to draw and number of instances to draw (100 here)
  }
  
  async createComputePipeline() {
    // Create a compute pipeline that updates the game state.
    this._computePipeline = this._device.createComputePipeline({
      label: "Grid update pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeMain",
      }
    });
  }
  
  compute(pass) {
    if (this._paused) return; // Skip computation if paused
    const adjustedStep = Math.ceil(this._step * this._speedFactor);

    pass.setPipeline(this._computePipeline);
    pass.setBindGroup(0, this._bindGroups[this._step % 2]);
    pass.dispatchWorkgroups(Math.ceil(256 / 4), Math.ceil(256 / 4)); // Dispatch compute workgroup
    ++this._step;

    console.log(`Simulation step: ${adjustedStep}`);
  }
}