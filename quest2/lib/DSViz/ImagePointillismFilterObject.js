import ImageFilterObject from '/lib/DSViz/ImageFilterObject.js';

export default class ImagePointillismFilterObject extends ImageFilterObject {
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/pointillism_shader.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: "Pointillism Shader",
      code: shaderCode,
    });
  }

}
