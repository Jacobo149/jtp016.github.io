import SceneObject from './SceneObject.js';

export default class ParticleSystemObject extends SceneObject {
  constructor(device, canvasFormat, numParticles = 2048) {
    super(device, canvasFormat);
    this._numParticles = numParticles;
    this._step = 0;
    this._emissionRate = 10;
    this._emissionTimer = 0;

    this.mousePosition = { x: 0, y: 0 };
    this._mouseAttractEnabled = true;

    this._uniformData = new Float32Array(4); // mouseX, mouseY, attractEnabled, unused
    this._uniformBuffer = this._device.createBuffer({
      size: this._uniformData.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    this.setupMouseListener();
    this.setupKeyboardListener();
  }

  setupMouseListener() {
    window.addEventListener("mousemove", (event) => {
      this.mousePosition.x = event.clientX / window.innerWidth * 2 - 1;
      this.mousePosition.y = -(event.clientY / window.innerHeight * 2 - 1);
    });
  }

  setupKeyboardListener() {
    window.addEventListener("keydown", (event) => {
      switch (event.key.toLowerCase()) {
        case "e":
          this.emitParticles(100);
          break;
        case "a":
          this._mouseAttractEnabled = !this._mouseAttractEnabled;
          console.log("Mouse attraction:", this._mouseAttractEnabled ? "ON" : "OFF");
          break;
      }
    });
  }

  async createGeometry() {
    await this.createParticleGeometry();
  }

  async createParticleGeometry() {
    this._particles = new Float32Array(this._numParticles * 8);
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
        this._particles[8 * i + 0] = 0.0;
        this._particles[8 * i + 1] = 0.0;
        this._particles[8 * i + 2] = 0.0;
        this._particles[8 * i + 3] = 0.0;
        this._particles[8 * i + 4] = 0.0;
        this._particles[8 * i + 5] = 0.0;
        this._particles[8 * i + 6] = 0.0;
        this._particles[8 * i + 7] = 0.0;
      }
    }
    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
    this._device.queue.submit([]);
  }

  emitParticles(numParticles) {
    let emitted = 0;
    for (let i = 0; i < this._numParticles && emitted < numParticles; ++i) {
      if (this._particles[8 * i + 4] === 0 && this._particles[8 * i + 5] === 0) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 0.1;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        const velocity = {
          x: (Math.random() * 2 - 1) * 0.1,
          y: (Math.random() * 2 - 1) * 0.1
        };
        const lifespan = 5.0;

        this._particles[8 * i + 0] = x;
        this._particles[8 * i + 1] = y;
        this._particles[8 * i + 2] = velocity.x;
        this._particles[8 * i + 3] = velocity.y;
        this._particles[8 * i + 4] = velocity.x;
        this._particles[8 * i + 5] = velocity.y;
        this._particles[8 * i + 6] = lifespan;
        this._particles[8 * i + 7] = 0.0;
        emitted++;
      }
    }

    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
    this._device.queue.submit([]);
  }

  update(dt) {
    this._emissionTimer += dt;
    if (this._emissionTimer >= 1 / this._emissionRate) {
      this.emitParticles(10);
      this._emissionTimer = 0;
    }

    // Update uniform buffer with mouse position and toggle
    this._uniformData[0] = this.mousePosition.x;
    this._uniformData[1] = this.mousePosition.y;
    this._uniformData[2] = this._mouseAttractEnabled ? 1.0 : 0.0;
    this._device.queue.writeBuffer(this._uniformBuffer, 0, this._uniformData);

    this.compute();
  }

  async createShaders() {
    let shaderCode = await this.loadShader("./shaders/particles.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Particles Shader " + this.getName(),
      code: shaderCode,
    });

    this._computeBindGroupLayout = this._device.createBindGroupLayout({
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: "uniform" } }
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

    this._computeBindGroups = [
      this._device.createBindGroup({
        layout: this._computeBindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: this._particleBuffers[0] } },
          { binding: 1, resource: { buffer: this._particleBuffers[1] } },
          { binding: 2, resource: { buffer: this._uniformBuffer } }
        ]
      }),
      this._device.createBindGroup({
        layout: this._computeBindGroupLayout,
        entries: [
          { binding: 0, resource: { buffer: this._particleBuffers[1] } },
          { binding: 1, resource: { buffer: this._particleBuffers[0] } },
          { binding: 2, resource: { buffer: this._uniformBuffer } }
        ]
      })
    ];

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
        buffers: []
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
