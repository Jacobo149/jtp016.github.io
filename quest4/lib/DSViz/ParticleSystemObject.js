import SceneObject from './SceneObject.js';

export default class ParticleSystemObject extends SceneObject {
  constructor(device, canvasFormat, numParticles = 2048) {
    super(device, canvasFormat);
    this._numParticles = numParticles;
    this._step = 0;
    this._emissionRate = 10;  // Number of particles to emit each frame
    this._emissionTimer = 0;  // Timer to handle emission intervals
    this.mousePosition = { x: 0, y: 0 }; // Store mouse position
    this.setupMouseListener(); // Add event listener

    // Initialize mouse position buffer
    this._mousePositionBuffer = this._device.createBuffer({
      size: Float32Array.BYTES_PER_ELEMENT * 2, // 2 elements: x, y coordinates
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  setupMouseListener() {
    // Track mouse position
    window.addEventListener("mousemove", (event) => {
      this.mousePosition.x = event.clientX / window.innerWidth * 2 - 1; // Normalize to [-1, 1]
      this.mousePosition.y = - (event.clientY / window.innerHeight * 2 - 1); // Normalize to [-1, 1]
    });

    // You could also handle clicks to trigger specific actions, if desired
    window.addEventListener("click", () => {
      // Add logic for particle attraction on mouse click (if necessary)
    });
  }

  async createGeometry() { 
    await this.createParticleGeometry();
  }

  async createParticleGeometry() {
    this._particles = new Float32Array(this._numParticles * 8);  // 6 elements per particle: x, y, velocity x, velocity y

    this._particleBuffers = [
      this._device.createBuffer({
        size: this._particles.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      }),
      this._device.createBuffer({
        size: this._particles.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
      })
    ];
    
    this.resetParticles();
  }

  resetParticles() {
    for (let i = 0; i < this._numParticles; ++i) {
      if (this._particles[8 * i + 7] === 0) {
        // Reset only inactive particles
        this._particles[8 * i + 0] = 0.0;  // position x
        this._particles[8 * i + 1] = 0.0;  // position y
        this._particles[8 * i + 2] = 0.0;  // initial velocity x
        this._particles[8 * i + 3] = 0.0;  // initial velocity y
        this._particles[8 * i + 4] = 0.0;  // velocity x
        this._particles[8 * i + 5] = 0.0;  // velocity y
        this._particles[8 * i + 6] = 0.0;  // lifespan
        this._particles[8 * i + 7] = 0.0;  // age
      }
    }
    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
    this._device.queue.submit([]);  // Ensure buffer updates
  }

  emitParticles(numParticles) {
    let emitted = 0;
    for (let i = 0; i < this._numParticles && emitted < numParticles; ++i) {
      if (this._particles[8 * i + 4] === 0 && this._particles[8 * i + 5] === 0) {
        // Emit particles from the center with random velocities
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.1;  // Emission radius from the center
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const velocity = {
          x: (Math.random() * 2 - 1) * 0.1, // Random velocity
          y: (Math.random() * 2 - 1) * 0.1
        };
        const lifespan = 5.0; // Set lifespan for emitted particles (5 seconds)
        
        // Update particle properties
        this._particles[8 * i + 0] = x;  // position x (centered)
        this._particles[8 * i + 1] = y;  // position y (centered)
        this._particles[8 * i + 2] = velocity.x;  // initial velocity x
        this._particles[8 * i + 3] = velocity.y;  // initial velocity y
        this._particles[8 * i + 4] = velocity.x;  // velocity x
        this._particles[8 * i + 5] = velocity.y;  // velocity y
        this._particles[8 * i + 6] = lifespan; // Set lifespan
        this._particles[8 * i + 7] = 0.0;  // Set age to 0
        emitted++;  // Track number of emitted particles
      }
    }
    
    // Update buffers after emission
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
    this._device.queue.submit([]);  // Ensure buffer updates
  }

  // Update method to write the mouse position buffer
  update(dt) {
    this._emissionTimer += dt;
    
    // Emit particles periodically
    if (this._emissionTimer >= 1 / this._emissionRate) {
      this.emitParticles(10);  // Emit 10 particles each frame
      this._emissionTimer = 0;  // Reset the emission timer
    }

    // Update the mouse position buffer with current mouse coordinates
    this._device.queue.writeBuffer(this._mousePositionBuffer, 0, new Float32Array([this.mousePosition.x, this.mousePosition.y]));

    // Update the particles' positions, velocities, etc.
    this.compute();
  }

  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/particles.wgsl");
    this._shaderModule = this._device.createShaderModule({
        label: "Particles Shader " + this.getName(),
        code: shaderCode,
    });

    // Define pipeline layout and bind groups
    this._computeBindGroupLayout = this._device.createBindGroupLayout({
      entries: [
          { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
          { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
          { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } } // Mouse position buffer type
      ]
    });

    this._renderBindGroupLayout = this._device.createBindGroupLayout({
        entries: [
            { binding: 0, visibility: GPUShaderStage.VERTEX, buffer: { type: "read-only-storage" } }
        ]
    });

    this._computePipelineLayout = this._device.createPipelineLayout({
        bindGroupLayouts: [this._computeBindGroupLayout],
    });

    this._renderPipelineLayout = this._device.createPipelineLayout({
        bindGroupLayouts: [this._renderBindGroupLayout],
    });

    // Create bind groups for compute pipeline
    this._computeBindGroups = [
        this._device.createBindGroup({
            layout: this._computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this._particleBuffers[0] } },
                { binding: 1, resource: { buffer: this._particleBuffers[1] } },
                { binding: 2, resource: { buffer: this._mousePositionBuffer } } // Mouse position buffer
            ]
        }),
        this._device.createBindGroup({
            layout: this._computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this._particleBuffers[1] } },
                { binding: 1, resource: { buffer: this._particleBuffers[0] } },
                { binding: 2, resource: { buffer: this._mousePositionBuffer } } // Mouse position buffer
            ]
        })
    ];

    // Create bind group for render pipeline (read-only storage buffer)
    this._renderBindGroup = this._device.createBindGroup({
        layout: this._renderBindGroupLayout,
        entries: [{ binding: 0, resource: { buffer: this._particleBuffers[this._step % 2] } }]
    });
  }

  async createRenderPipeline() {
    this._renderPipeline = this._device.createRenderPipeline({
        layout: this._renderPipelineLayout,
        vertex: {
            module: this._shaderModule,
            entryPoint: "vertexMain",
            buffers: [] // No vertex buffer needed, we use storage buffer instead
        },
        fragment: {
            module: this._shaderModule,
            entryPoint: "fragmentMain",
            targets: [{ format: this._canvasFormat }]
        },
        primitive: { topology: "point-list" }
    });
  }

  async createComputePipeline() {
    this._computePipeline = this._device.createComputePipeline({
      layout: this._computePipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeMain"
      }
    });
  }

  render(pass) {
    pass.setPipeline(this._renderPipeline);
    pass.setBindGroup(0, this._renderBindGroup);
    pass.draw(this._numParticles, this._numParticles);
  }

  compute(pass) {
    pass.setPipeline(this._computePipeline);
    pass.setBindGroup(0, this._computeBindGroups[this._step % 2]);
    pass.dispatchWorkgroups(Math.ceil(this._numParticles / 256));
    this._step++;
  }
}
