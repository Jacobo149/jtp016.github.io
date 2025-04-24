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

/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 * Licensed under the Creative Commons Attribution-NonCommerical 4.0 International License.
 */

import RayTracingObject from "/lib/DSViz/RayTracingObject.js";
import UnitCube from "/lib/DS/UnitCube.js";

export default class RayTracingBoxLightObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true) {
    super(device, canvasFormat);
    this._camera = camera;
    this._showTexture = showTexture;
    this._box = new UnitCube();
  }

  async createGeometry() {
    this._createCameraBuffer();
    this._uploadCameraData();
    this._createBoxBuffer();
    this._uploadBoxData();
    this._createLightBuffer();
  }

  updateGeometry() {
    this._camera.updateSize(this._imgWidth, this._imgHeight);
    this._device.queue.writeBuffer(
      this._cameraBuffer,
      this._camera._pose.byteLength + this._camera._focal.byteLength,
      this._camera._resolutions
    );
  }

  updateBoxPose() {
    this._device.queue.writeBuffer(this._boxBuffer, 0, this._box._pose);
  }

  updateBoxScales() {
    this._device.queue.writeBuffer(
      this._boxBuffer,
      this._box._pose.byteLength,
      this._box._scales
    );
  }

  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
  }

  updateCameraFocal() {
    this._device.queue.writeBuffer(
      this._cameraBuffer,
      this._camera._pose.byteLength,
      this._camera._focal
    );
  }

  updateLight(light) {
    const segments = [
      light._intensity,
      light._position,
      light._direction,
      light._attenuation,
      light._params,
    ];
    let offset = 0;
    segments.forEach((segment) => {
      this._device.queue.writeBuffer(this._lightBuffer, offset, segment);
      offset += segment.byteLength;
    });
  }

  async createShaders() {
    const shaderCode = await this.loadShader("/shaders/traceboxlight.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    this._createBindGroupLayout();
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Box Pipeline Layout",
      bindGroupLayouts: [this._bindGroupLayout],
    });
  }

  async createComputePipeline() {
    this._computePipeline = this._createPipeline("computeOrthogonalMain", "Ray Trace Box Orthogonal Pipeline ");
    this._computeProjectivePipeline = this._createPipeline("computeProjectiveMain", "Ray Trace Box Projective Pipeline ");
  }

  createBindGroup(outTexture) {
    this._bindGroup = this._device.createBindGroup({
      label: "Ray Trace Box Bind Group",
      layout: this._computePipeline.getBindGroupLayout(0),
      entries: [
        { binding: 0, resource: { buffer: this._cameraBuffer } },
        { binding: 1, resource: { buffer: this._boxBuffer } },
        { binding: 2, resource: outTexture.createView() },
        { binding: 3, resource: { buffer: this._lightBuffer } },
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

  // Private helper methods
  _createCameraBuffer() {
    const size = this._camera._pose.byteLength + this._camera._focal.byteLength + this._camera._resolutions.byteLength;
    this._cameraBuffer = this._device.createBuffer({
      label: "Camera " + this.getName(),
      size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  _uploadCameraData() {
    const { _pose, _focal, _resolutions } = this._camera;
    this._device.queue.writeBuffer(this._cameraBuffer, 0, _pose);
    this._device.queue.writeBuffer(this._cameraBuffer, _pose.byteLength, _focal);
    this._device.queue.writeBuffer(this._cameraBuffer, _pose.byteLength + _focal.byteLength, _resolutions);
  }

  _createBoxBuffer() {
    const size = this._box._pose.byteLength + this._box._scales.byteLength + this._box._top.byteLength * 6;
    this._boxBuffer = this._device.createBuffer({
      label: "Box " + this.getName(),
      size,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  _uploadBoxData() {
    const faces = [this._box._pose, this._box._scales, this._box._front, this._box._back, this._box._left, this._box._right, this._box._top, this._box._down];
    let offset = 0;
    faces.forEach(face => {
      this._device.queue.writeBuffer(this._boxBuffer, offset, face);
      offset += face.byteLength;
    });
  }

  _createLightBuffer() {
    this._lightBuffer = this._device.createBuffer({
      label: "Light " + this.getName(),
      size: 20 * Float32Array.BYTES_PER_ELEMENT,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });
  }

  _createBindGroupLayout() {
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Ray Trace Box Layout " + this.getName(),
      entries: [
        { binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        { binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: {} },
        { binding: 2, visibility: GPUShaderStage.COMPUTE, storageTexture: { format: this._canvasFormat } },
        { binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: {} },
      ],
    });
  }

  _createPipeline(entryPoint, labelPrefix) {
    return this._device.createComputePipeline({
      label: labelPrefix + this.getName(),
      layout: this._pipelineLayout,
      compute: {
        module: this._shaderModule,
        entryPoint,
      },
    });
  }
}