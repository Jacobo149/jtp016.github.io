import RayTracingObject from "/lib/DSViz/RayTracingObject.js";
import UnitCube from "/lib/DS/UnitCube.js";
import Camera from "/lib/Viz/3DCamera.js";

export default class RayTracingBoxObject extends RayTracingObject {
  constructor(device, canvasFormat, camera, showTexture = true) {
    super(device, canvasFormat);
    this._box = new UnitCube();
    this._camera = camera;
    this._showTexture = showTexture;
    this._device = device;
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
    this._camera.updateSize(this._imgWidth, this._imgHeight);
    this.updateCameraBuffer();
  }

  updateCameraPose() {
    this._device.queue.writeBuffer(this._cameraBuffer, 0, this._camera._pose);
  }

  updateCameraFocal() {
    this._device.queue.writeBuffer(this._cameraBuffer, this._camera._pose.byteLength, this._camera._focal);
  }

  async createShaders() {
    let shaderCode = await this.loadShader("/shaders/tracebox.wgsl");
    this._shaderModule = this._device.createShaderModule({
      label: " Shader " + this.getName(),
      code: shaderCode,
    });
    this._bindGroupLayout = this._device.createBindGroupLayout({
      label: "Ray Trace Box Layout " + this.getName(),
      entries: [{
        binding: 0,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} 
      }, {
        binding: 1,
        visibility: GPUShaderStage.COMPUTE,
        buffer: {} 
      }, {
        binding: 2,
        visibility: GPUShaderStage.COMPUTE,
        storageTexture: { format: this._canvasFormat } 
      }]
    });
    this._pipelineLayout = this._device.createPipelineLayout({
      label: "Ray Trace Box Pipeline Layout",
      bindGroupLayouts: [ this._bindGroupLayout ],
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
      {
        binding: 0,
        resource: { buffer: this._cameraBuffer }
      },
      {
        binding: 1,
        resource: { buffer: this._boxBuffer }
      },
      {
        binding: 2,
        resource: outTexture.createView()
      }
      ],
    });
    this._wgWidth = Math.ceil(outTexture.width);
    this._wgHeight = Math.ceil(outTexture.height);
  }

  compute(pass) {
    if (this._camera?._isProjective) {
      pass.setPipeline(this._computeProjectivePipeline);
    }
    else {
      pass.setPipeline(this._computePipeline);
    }
    pass.setBindGroup(0, this._bindGroup);
    pass.dispatchWorkgroups(Math.ceil(this._wgWidth / 16), Math.ceil(this._wgHeight / 16));
  }
}

// Initialize the scene with a canvas
let canvas = document.getElementById("renderCanvas"); // Your rendering canvas element

// Check if WebGPU is supported
if (!navigator.gpu) {
  console.error("WebGPU is not supported in this browser.");
} else {
  try {
    const adapter = await navigator.gpu.requestAdapter(); // Request an adapter
    if (!adapter) {
      console.error("Failed to get a WebGPU adapter.");
    } else {
      const device = await adapter.requestDevice(); // Request a device
      let camera = new Camera(canvas.width, canvas.height); // Your custom Camera class
      let rayTracingBox = new RayTracingBoxObject(device, 'rgba8unorm', camera);

      // Create the geometry and shaders for the box
      await rayTracingBox.createGeometry();
      await rayTracingBox.createShaders();
      await rayTracingBox.createComputePipeline();

      // Create an output texture (adjust the size and format as needed)
      let outTexture = device.createTexture({
        size: { width: canvas.width, height: canvas.height, depthOrArrayLayers: 1 },
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.STORAGE,
      });

      // Keybinds for manipulating the camera
      document.addEventListener('keydown', (event) => {
        const speed = 0.1; // Movement speed
        switch (event.key) {
          case 'w': // Move forward
            camera.moveZ(speed);
            break;
          case 's': // Move backward
            camera.moveZ(-speed);
            break;
          case 'a': // Move left
            camera.moveX(-speed);
            break;
          case 'd': // Move right
            camera.moveX(speed);
            break;
          case 'q': // Rotate left
            camera.rotateY(-Math.PI / 30); // Rotate 6 degrees left
            break;
          case 'e': // Rotate right
            camera.rotateY(Math.PI / 30); // Rotate 6 degrees right
            break;
          case 'r': // Rotate up
            camera.rotateX(Math.PI / 30); // Rotate 6 degrees up
            break;
          case 'f': // Rotate down
            camera.rotateX(-Math.PI / 30); // Rotate 6 degrees down
            break;
          default:
            break;
        }

        // Update the camera pose and geometry after key press
        rayTracingBox.updateCameraPose();
        rayTracingBox.updateBoxPose(); // Optionally update the box pose
      });

      // Render loop for animation
      function animate() {
        // Update the geometry if necessary
        rayTracingBox.updateGeometry();

        // Create the bind group using the output texture
        rayTracingBox.createBindGroup(outTexture);

        // Set up the rendering pass
        const passEncoder = device.createCommandEncoder();
        let pass = passEncoder.beginRenderPass({
          colorAttachments: [{
            view: outTexture.createView(),
            loadOp: 'clear',
            storeOp: 'store',
            clearColor: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 }
          }],
        });
        rayTracingBox.compute(pass);
        device.queue.submit([passEncoder.finish()]);

        requestAnimationFrame(animate);
      }

      // Start the animation loop
      animate();
    }
  } catch (error) {
    console.error("Error initializing WebGPU: ", error);
  }
}
