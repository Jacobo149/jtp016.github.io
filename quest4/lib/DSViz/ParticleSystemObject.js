import SceneObject from '/lib/DSViz/SceneObject.js';

export default class ParticleSystemObject extends SceneObject {
  constructor(device, canvasFormat, numParticles = 2048) {
    super(device, canvasFormat);
    this._numParticles = numParticles;
    this._step = 0;
  }

  async createGeometry() { 
    await this.createParticleGeometry();
  }

  async createParticleGeometry() {
    this._particles = new Float32Array(this._numParticles * 6);
    
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
    const numCircles = 5; // Number of circles
    const radius = 0.2;   // Radius of each circle
    const spacing = 1.2;  // Increased spacing for visibility

    const centers = [];
    for (let i = 0; i < numCircles; i++) {
        let angle = (i / numCircles) * Math.PI * 2;
        centers.push({
            x: Math.cos(angle) * spacing,
            y: Math.sin(angle) * spacing
        });
    }

    for (let i = 0; i < this._numParticles; ++i) {
        const circleIndex = i % numCircles;
        const angle = Math.random() * Math.PI * 2;

        const center = centers[circleIndex];
        const x = center.x + Math.cos(angle) * radius;
        const y = center.y + Math.sin(angle) * radius;

        this._particles[6 * i + 0] = x;
        this._particles[6 * i + 1] = y;
        this._particles[6 * i + 2] = x;
        this._particles[6 * i + 3] = y;
        this._particles[6 * i + 4] = (Math.random() * 2 - 1) * 0.05;
        this._particles[6 * i + 5] = (Math.random() * 2 - 1) * 0.05;
    }

    console.log("Updated Particle Positions:", this._particles.slice(0, 60));

    this._step = 0;
    this._device.queue.writeBuffer(this._particleBuffers[this._step % 2], 0, this._particles);
    this._device.queue.submit([]);  // Ensure buffer updates
}



  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/particles.wgsl");
    this._shaderModule = this._device.createShaderModule({
        label: "Particles Shader " + this.getName(),
        code: shaderCode,
    });

    // Compute pipeline bind group layout
    this._computeBindGroupLayout = this._device.createBindGroupLayout({
      entries: [
          { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: "read-only-storage" } },
          { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: "storage" } }
      ]
  });
  

    // Render pipeline bind group layout (read-only storage buffer)
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
                { binding: 1, resource: { buffer: this._particleBuffers[1] } }
            ]
        }),
        this._device.createBindGroup({
            layout: this._computeBindGroupLayout,
            entries: [
                { binding: 0, resource: { buffer: this._particleBuffers[1] } },
                { binding: 1, resource: { buffer: this._particleBuffers[0] } }
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
      primitive: { topology: "point-list" } // If using particles, point-list is likely needed
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

  // Ensure compute bind groups are created with `storage` (read/write)
  this._computeBindGroups = [
      this._device.createBindGroup({
          layout: this._computeBindGroupLayout,
          entries: [
              { binding: 0, resource: { buffer: this._particleBuffers[0] } },
              { binding: 1, resource: { buffer: this._particleBuffers[1] } }
          ]
      }),
      this._device.createBindGroup({
          layout: this._computeBindGroupLayout,
          entries: [
              { binding: 0, resource: { buffer: this._particleBuffers[1] } },
              { binding: 1, resource: { buffer: this._particleBuffers[0] } }
          ]
      })
  ];
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
