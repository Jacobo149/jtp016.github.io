import RayTracingObject from "./RayTracingObject.js";
import UnitCube from "../DS/UnitCube.js";

export default class RayTracingBoxObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true) {
    super(device, canvasFormat);
    this._camera = camera;
    this._showTexture = showTexture;
    this._box = new UnitCube();
  }

  async createGeometry() {
    this._createCameraBuffer();
    this._createBoxBuffer();
  }

  _createCameraBuffer() {
    const poseSize = this._camera._pose.byteLength;
    const focalSize = this._camera._focal.byteLength;
    const resSize = this._camera._resolutions.byteLength;
    const totalSize = poseSize + focalSize + resSize;

    this._cameraBuffer = this._device.createBuffer({
      label: `Camera ${this.getName()}`,
      size: totalSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const queue = this._device.queue;
    queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
    queue.writeBuffer(this._cameraBuffer, poseSize, this._camera._focal);
    queue.writeBuffer(this._cameraBuffer, poseSize + focalSize, this._camera._resolutions);
  }

  _createBoxBuffer() {
    const { _pose, _scales, _front, _back, _left, _right, _top, _down } = this._box;

    const totalSize =
      _pose.byteLength + _scales.byteLength +
      (_top.byteLength * 6); // assumes all face byteLengths are equal

    this._boxBuffer = this._device.createBuffer({
      label: `Box ${this.getName()}`,
      size: totalSize,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    const queue = this._device.queue;
    let offset = 0;
    const write = (buffer) => {
      queue.writeBuffer(this._boxBuffer, offset, buffer);
      offset += buffer.byteLength;
    };

    [_pose, _scales, _front, _back, _left, _right, _top, _down].forEach(write);
  }

  updateGeometry() {
    this._camera.updateSize(this._imgWidth, this._imgHeight);
    const offset = this._camera._pose.byteLength + this._camera._focal.byteLength;
    this._device.queue.writeBuffer(this._cameraBuffer, offset, this._camera._resolutions);
  }

  updateBoxPose() {
    this._device.queue.writeBuffer(this._boxBuffer, 0, this._box._pose);
  }

  updateBoxScales() {
    const offset = this._box._pose.byteLength;
    this._device.queue.writeBuffer(this._boxBuffer, offset, this._box._scales);
  }

  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
  }

  updateCameraFocal() {
    const offset = this._camera._pose.byteLength;
    this._device.queue.writeBuffer(this._cameraBuffer, offset, this._camera._focal);
  }

  async createShaders() {
    const code = await this.loadShader("./shaders/tracebox.wgsl");

    this._shaderModule = this._device.createShaderModule({
      label: `Shader ${this.getName()}`,
      code,
    });

    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: `Ray Trace Box Layout ${this.getName()}`,
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        {
          binding: 2,
          visibility: GPUShaderStage.COMPUTE,
          storageTexture: { format: this._canvasFormat },
        },
      ],
    });

    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Box Pipeline Layout",
      bindGroupLayouts: [this._bindGroupLayout],
    });
  }

  async createComputePipeline() {
    const createPipeline = (label, entryPoint) =>
      this._device.createComputePipeline({
        label: `${label} ${this.getName()}`,
        layout: this._pipelineLayout,
        compute: {
          module: this._shaderModule,
          entryPoint,
        },
      });

    this._computePipeline = createPipeline("Ray Trace Box Orthogonal Pipeline", "computeOrthogonalMain");
    this._computeProjectivePipeline = createPipeline("Ray Trace Box Projective Pipeline", "computeProjectiveMain");
  }

  createBindGroup(outTexture) {
    this._bindGroup = this._device.createBindGroup({
      label: "Ray Trace Box Bind Group",
      layout: this._computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this._cameraBuffer } },
        { binding: 1, resource: { buffer: this._boxBuffer } },
        { binding: 2, resource: outTexture.createView() },
      ],
    });

    this._wgWidth = Math.ceil(outTexture.width);
    this._wgHeight = Math.ceil(outTexture.height);
  }

  compute(pass) {
    const pipeline = this._camera?._isProjective
      ? this._computeProjectivePipeline
      : this._computePipeline;

    pass.setPipeline(pipeline);
    pass.setBindGroup(0, this._bindGroup);
    pass.dispatchWorkgroups(
      Math.ceil(this._wgWidth / 16),
      Math.ceil(this._wgHeight / 16)
    );
  }
}
