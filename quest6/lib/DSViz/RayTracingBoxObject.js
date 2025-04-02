import RayTracingObject from "/lib/DSViz/RayTracingObject.js";
import UnitCube from "/lib/DS/UnitCube.js";
import Camera from "/lib/Viz/3DCamera.js";

export default class RayTracingBoxObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true, canvas) {
    super(device, canvasFormat);
    this._box = new UnitCube();
    this._camera = camera;
    this._showTexture = showTexture;
    this._device = device;
    this._canvas = canvas || document.getElementById("renderCanvas");

    if (!this._canvas) {
      throw new Error("Canvas is undefined in RayTracingBoxObject constructor.");
    }
  }

  async createGeometry() {
    this._cameraBuffer = this._device.createBuffer({
      label: "Camera " + this.getName(),
      size: this._camera._pose.byteLength + this._camera._focal.byteLength + this._camera._resolutions.byteLength,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.updateCameraBuffer();

    this._boxBuffer = this._device.createBuffer({
      label: "Box " + this.getName(),
      size: this._box._pose.byteLength + this._box._scales.byteLength + this._box._top.byteLength * 6,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
    this.updateBoxBuffer();
  }

  updateCameraBuffer() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength, this._camera._focal);
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength + this._camera._focal.byteLength, this._camera._resolutions);
  }

  updateBoxBuffer() {
    let offset = 0;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._pose);
    offset += this._box._pose.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._scales);
    offset += this._box._scales.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._front);
    offset += this._box._front.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._back);
    offset += this._box._back.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._left);
    offset += this._box._left.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._right);
    offset += this._box._right.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._top);
    offset += this._box._top.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._down);
  }

  updateGeometry() {
    this._camera.updateSize(this._canvas.width, this._canvas.height);  // Use canvas dimensions
    this.updateCameraBuffer();
  }


  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/tracebox.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Ray Trace Box Layout " + this.getName(),
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, storageTexture: { format: this._canvasFormat, access: 'write-only', viewDimension: '2d' }}
      ]
    });
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Box Pipeline Layout",
      bindGroupLayouts: [this._bindGroupLayout],
    });
  }

  async createComputePipeline() {
    this._computePipeline = this._device.createComputePipeline({
      label: "Ray Trace Box Orthogonal Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeOrthogonalMain",
      }
    });
    this._computeProjectivePipeline = this._device.createComputePipeline({
      label: "Ray Trace Box Projective Pipeline " + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint: "computeProjectiveMain",
      }
    });
  }

  createBindGroup(outTexture) {
    this._bindGroup = this._device.createBindGroup({
      label: "Ray Trace Box Bind Group",
      layout: this._computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this._cameraBuffer }},
        { binding: 1, resource: { buffer: this._boxBuffer }},
        { binding: 2, resource: outTexture.createView({ format: 'rgba8unorm' })}
      ],
    });
    this._wgWidth = Math.ceil(outTexture.width);
    this._wgHeight = Math.ceil(outTexture.height);
  }

  compute(pass) {
    const pipeline = this._camera._isProjective ? this._computeProjectivePipeline : this._computePipeline;
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, this._bindGroup);
    pass.dispatchWorkgroups(Math.ceil(this._wgWidth / 16), Math.ceil(this._wgHeight / 16));
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  if (!navigator.gpu) {
    console.error("WebGPU is not supported in this browser.");
    return;
  }

  try {
    const canvas = document.getElementById("renderCanvas");
    if (!canvas) {
      console.error("Canvas element not found.");
      return;
    }

    console.log("Canvas in WebGPU initialization:", canvas);

    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      console.error("Failed to get a WebGPU adapter.");
      return;
    }

    const device = await adapter.requestDevice();
    const camera = new Camera(canvas.width, canvas.height);
    const rayTracingBox = new RayTracingBoxObject(device, 'rgba8unorm', camera, true, canvas);

    await rayTracingBox.createGeometry();
    await rayTracingBox.createShaders();
    await rayTracingBox.createComputePipeline();

    const outTexture = device.createTexture({
      size: { width: canvas.width, height: canvas.height, depthOrArrayLayers: 1 },
      format: 'rgba8unorm',
      usage: GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
    });

    document.addEventListener('keydown', (event) => {
      console.log("Key pressed:", event.key); // Debugging output
      const speed = 0.1;
      switch (event.key) {
        case 'w': camera.moveZ(speed); break;
        case 's': camera.moveZ(-speed); break;
        case 'a': camera.moveX(-speed); break;
        case 'd': camera.moveX(speed); break;
        case 'q': camera.rotateY(-Math.PI / 30); break;
        case 'e': camera.rotateY(Math.PI / 30); break;
        case 'r': camera.rotateX(Math.PI / 30); break;
        case 'f': camera.rotateX(-Math.PI / 30); break;
        default: break;
      }
      console.log("Camera pose updated:", camera._pose); // Debugging output
      rayTracingBox.updateCameraBuffer();
    });

    function animate() {
      rayTracingBox.updateGeometry();
      rayTracingBox.createBindGroup(outTexture);
      
      const passEncoder = device.createCommandEncoder();
      
      // Use compute pass encoder instead of render pass encoder
      const computePass = passEncoder.beginComputePass();
      
      // Set the compute pipeline
      const pipeline = rayTracingBox._camera._isProjective ? rayTracingBox._computeProjectivePipeline : rayTracingBox._computePipeline;
      computePass.setPipeline(pipeline);
      computePass.setBindGroup(0, rayTracingBox._bindGroup);
      
      // Dispatch compute workgroups
      computePass.dispatchWorkgroups(Math.ceil(rayTracingBox._wgWidth / 16), Math.ceil(rayTracingBox._wgHeight / 16));
      
      // End the compute pass correctly
      computePass.end();
      device.queue.submit([passEncoder.finish()]);
      
      requestAnimationFrame(animate);
    }
    
    

    animate();

  } catch (error) {
    console.error("Error initializing WebGPU: ", error);
  }
});

