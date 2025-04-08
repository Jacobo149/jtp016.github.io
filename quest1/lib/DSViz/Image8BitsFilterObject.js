import ImageFilterObject from "./ImageFilterObject.js"

export default class Image8BitsFilterObject extends ImageFilterObject {
  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/computeshader.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    }); 
  }
}