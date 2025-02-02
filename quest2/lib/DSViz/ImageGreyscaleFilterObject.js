import ImageFilterObject from '/lib/DSViz/ImageFilterObject.js';

export default class ImageGreyscaleFilterObject extends ImageFilterObject {
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/greyscale_shader.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Greyscale Shader",
      code: shaderCode,
    });
  }

}
