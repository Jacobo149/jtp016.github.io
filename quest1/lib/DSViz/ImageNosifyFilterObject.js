import ImageFilterObject from "/lib/DSViz/ImageFilterObject.js";

export default class ImageNosifyFilterObject extends ImageFilterObject {
    async createGeometry() {
      this.updateGeometry(); 
    }
  
    async createShaders() {
      let shaderCode = await this.loadShader("/shaders/nosifyshader.wgsl");
      this._shaderModule = this._device.createShaderModule({
        label: " Shader " + this.getName(),
        code: shaderCode,
      }); 
    }
  
    updateGeometry() {
      if (this._imgWidth && this._imgHeight) {
        // update the random number
        this._randomArray = new Float32Array(this._imgWidth * this._imgHeight);
        // create a buffer for the random number
        this._randomBuffer = this._device.createBuffer({
          label: "Random Buffer " + this.getName(),
          size: this._randomArray.byteLength,
          usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });
        // fill in the random values
        for (let i = 0; i < this._imgWidth * this._imgHeight; ++i) {
          this._randomArray[i] = Math.random() * 2 - 1; // range from [-1, 1]
        }
        // Copy from CPU to GPU
        this._device.queue.writeBuffer(this._randomBuffer, 0, this._randomArray);
      }
    }
  
    createBindGroup(inTexture, outTexture) {
      // Create a bind group
      this._bindGroup = this._device.createBindGroup({
        label: "Image Filter Bind Group",
        layout: this._computePipeline.getBindGroupLayout(0),
        entries: [{
          binding: 0,
          resource: inTexture.createView()
        },
        {
          binding: 1,
          resource: outTexture.createView()
        },
        {
          binding: 2,
          resource: { buffer: this._randomBuffer }
        }],
      });
      this._wgWidth = Math.ceil(inTexture.width);
      this._wgHeight = Math.ceil(inTexture.height);
    }
  }