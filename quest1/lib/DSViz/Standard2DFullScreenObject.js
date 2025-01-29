import SceneObject from "/lib/DSViz/SceneObject.js"

export default class Standard2DFullScreenObject extends SceneObject {
  constructor(device, canvasFormat, img) {
    super(device, canvasFormat);
    // This assume each vertex has (x, y)
    this._img = new Image();
    this._img.src = img;
  }

  async createGeometry() {
    // Load img and create image bitmap
    await this._img.decode();
    this._bitmap = await createImageBitmap(this._img);
    // Create texture buffer to store the texture in GPU
    this._texture = this._device.createTexture({
      label: "Texture " + this.getName(),
      size: [this._bitmap.width, this._bitmap.height, 1],
      format: "rgba8unorm",
      usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
    });
    // Copy from CPU to GPU
    this._device.queue.copyExternalImageToTexture({ source: this._bitmap }, { texture: this._texture }, [ this._bitmap.width, this._bitmap.height]);
    // Create the texture sampler
    this._sampler = this._device.createSampler({
      magFilter: "linear",
      minFilter: "linear"
    });
  }

  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/standard2dfullscreen.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    }); 
  }

  async createRenderPipeline() {
    this._renderPipeline = this._device.createRenderPipeline({
      label: "Render Pipeline " + this.getName(),
      layout: "auto",
      vertex: {
        module: this._shaderModule,         // the shader code
        entryPoint: "vertexMain",           // the shader function
      },
      fragment: {
        module: this._shaderModule,    // the shader code
        entryPoint: "fragmentMain",    // the shader function
        targets: [{
          format: this._canvasFormat   // the target canvas format
        }]
      }
    });
    // Create bind group to bind the texture
    this._bindGroup = this._device.createBindGroup({
      layout: this._renderPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: this._texture.createView(),
        },
        {
          binding: 1,
          resource: this._sampler,
        }
      ],
    });
  }

  render(pass) {
    // add to render pass to draw the object
    pass.setPipeline(this._renderPipeline);   // which render pipeline to use
    pass.setBindGroup(0, this._bindGroup);    // bind group to bind texture to shader
    pass.draw(6, 1, 0, 0);                    // 6 vertices to draw a quad
  }

  async createComputePipeline() {}

  compute(pass) {}
}