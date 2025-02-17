import SceneObject from '/lib/DSViz/SceneObject.js'

export default class ParticleSystemObject extends SceneObject {
  constructor(device, canvasFormat, numParticles = 4096) {
    super(device, canvasFormat);
    this._numParticles = numParticles;
    this._step = 0;
  }
  
  async createGeometry() { 
    await this.createParticleGeometry();
  }
  
  async createParticleGeometry() {
    this._particles = new Float32Array(this._numParticles * 6);
    
    // TODO 1 - create ping-pong buffers to store and update the particles in GPU
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
      this._particles[6 * i + 0] = (Math.random() * 2 - 1); 
      this._particles[6 * i + 1] = (Math.random() * 2 - 1);
      this._particles[6 * i + 2] = this._particles[6 * i + 0];
      this._particles[6 * i + 3] = this._particles[6 * i + 1];
      this._particles[6 * i + 4] = 0;
      this._particles[6 * i + 5] = 0;
    }
    
    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
  }
  
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/particles.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Particles Shader " + this.getName(),
      code: shaderCode,
    });
    
    // TODO 2 - Create the bind group layout for using the ping-pong buffers in the GPU
    this._bindGroupLayout = this._device.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        },
        {
          binding: 1,
          visibility: GPUShaderStage.VERTEX | GPUShaderStage.COMPUTE,
          buffer: { type: "storage" },
        }
      ]
    });
    
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Particles Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
    });
  }
  
}