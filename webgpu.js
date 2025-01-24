async function init() {
    // Create a canvas tag
    const canvasTag = document.createElement('canvas');
    canvasTag.id = "renderCanvas"; // Important! This tells which CSS style to use
    document.body.appendChild(canvasTag);
    // Check if the browser supports WebGPU
    if (!navigator.gpu) {
      throw Error("WebGPU is not supported in this browser.");
    }
    // Get an GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
      throw Error("Couldn't request WebGPU adapter.");
    }
    // Get a GPU device
    const device = await adapter.requestDevice();
    // Get canvas context using webgpu
    const context = canvasTag.getContext("webgpu");
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    context.configure({
      device: device,
      format: canvasFormat,
    });
    // Create a gpu command encoder
    const encoder = device.createCommandEncoder();
    // Use the encoder to begin render pass
    const pass = encoder.beginRenderPass({
      colorAttachments: [{
        view: context.getCurrentTexture().createView(),
        clearValue: { r: 0, g: 56/255, b: 101/255, a: 1 }, // Bucknell Blue
        loadOp: "clear",
        storeOp: "store",
      }]
    });
    pass.end(); // end the pass
    // Create the command buffer
    const commandBuffer = encoder.finish();
    // Submit to the device to render
    device.queue.submit([commandBuffer]);
  
    return context;
  }
  
  init().then( ret => {
    console.log(ret);
  }).catch( error => {
    // error handling - add a p tag to display the error message
    const pTag = document.createElement('p');
    pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
    document.body.appendChild(pTag);
    // also remove the created canvas tag
    document.getElementById("renderCanvas").remove();
  });