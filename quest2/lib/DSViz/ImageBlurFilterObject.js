import ImageFilterObject from '/lib/DSViz/ImageFilterObject.js';

export default class ImageBlurFilterObject extends ImageFilterObject {
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/blur_shader.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Blur Shader",
      code: shaderCode,
    });
  }

}
