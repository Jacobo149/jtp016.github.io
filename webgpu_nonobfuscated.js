async function init() {
    // Create a canvas tag
    const canvasTag = document.createElement("canvas");
    canvasTag.id = "renderCanvas"; // Important! This tells which CSS style to use
    document.body.appendChild(canvasTag);

    // Check if the browser supports WebGPU
    if (!navigator.gpu) {
        throw Error("WebGPU is not supported in this browser.");
    }

    // Get a GPU adapter
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
        throw Error("Couldn't request WebGPU adapter.");
    }

    // Get a GPU device
    const device = await adapter.requestDevice();
    const canvasFormat = navigator.gpu.getPreferredCanvasFormat();
    const context = canvasTag.getContext("webgpu");
    context.configure({
        device: device,
        format: canvasFormat,
    });

    // Define vertices for the triangle, square, and circle
    const triangleVertices = new Float32Array([
        0, 0.5, // Triangle top
        -0.5, 0, // Bottom left
        0.5, 0, // Bottom right
    ]);

    const offsetY = 0.6;
    const squareVertices = new Float32Array([
        -0.3, 0.3 - offsetY, // Top-left
        -0.3, 0.0 - offsetY, // Bottom-left
        0.0, 0.3 - offsetY,  // Top-right

        -0.3, 0.0 - offsetY, // Bottom-left
        0.0, 0.3 - offsetY,  // Top-right
        0.0, 0.0 - offsetY,  // Bottom-right
    ]);

    const circleVertices = [];
    const numSegments = 100;
    const centerX = -0.8;
    const centerY = 0.2;
    const radius = 0.2;
    for (let i = 0; i <= numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI;
        circleVertices.push(centerX, centerY); // Center of the circle
        circleVertices.push(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
    }

    // Create vertex buffers
    const createBuffer = (vertices) =>
        device.createBuffer({
            label: "Vertices",
            size: vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });

    const triangleBuffer = createBuffer(triangleVertices);
    const squareBuffer = createBuffer(squareVertices);
    const circleBuffer = createBuffer(new Float32Array(circleVertices));

    device.queue.writeBuffer(triangleBuffer, 0, triangleVertices);
    device.queue.writeBuffer(squareBuffer, 0, squareVertices);
    device.queue.writeBuffer(circleBuffer, 0, new Float32Array(circleVertices));

    // Define vertex buffer layout
    const vertexBufferLayout = {
        arrayStride: 2 * Float32Array.BYTES_PER_ELEMENT,
        attributes: [{
            format: "float32x2",
            offset: 0,
            shaderLocation: 0,
        }],
    };

    // Vertex shader code
    const vertCode = `
@vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
    return vec4f(pos, 0.0, 1.0);
}
`;

    const fragCode = `
@group(0) @binding(0) var<uniform> color: vec4f;

@fragment
fn fragmentMain() -> @location(0) vec4f {
    return color;
}
`;

    // Create bind group layout
    const bindGroupLayout = device.createBindGroupLayout({
        entries: [{
            binding: 0,
            visibility: GPUShaderStage.FRAGMENT,
            buffer: {
                type: "uniform",
            },
        }],
    });

    // Function to create bind groups for each shape with its color
    function createBindGroup(device, color) {
        const colorBuffer = device.createBuffer({
            size: 16, // 4 components (RGBA) of 4 bytes each
            usage: GPUBufferUsage.UNIFORM,
            mappedAtCreation: true,
        });
        new Float32Array(colorBuffer.getMappedRange()).set(color);
        colorBuffer.unmap();

        return device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{
                binding: 0,
                resource: {
                    buffer: colorBuffer,
                },
            }],
        });
    }

    // Colors for different shapes
    const triangleColor = [1.0, 0.0, 0.0, 1.0]; // Red
    const squareColor = [0.0, 1.0, 0.0, 1.0];   // Green
    const circleColor = [0.0, 0.0, 1.0, 1.0];   // Blue

    // Create bind groups
    const triangleBindGroup = createBindGroup(device, triangleColor);
    const squareBindGroup = createBindGroup(device, squareColor);
    const circleBindGroup = createBindGroup(device, circleColor);

    // Create shader modules
    const vertShaderModule = device.createShaderModule({
        code: vertCode,
    });
    const fragShaderModule = device.createShaderModule({
        code: fragCode,
    });

    // Create pipeline layout using the bind group layout
    const pipelineLayout = device.createPipelineLayout({
        bindGroupLayouts: [bindGroupLayout], // Specify the bind group layout
    });

    // Create render pipeline with the explicit pipeline layout
    const renderPipeline = device.createRenderPipeline({
        layout: pipelineLayout, // Use the created pipeline layout
        vertex: {
            module: vertShaderModule,
            entryPoint: "vertexMain",
            buffers: [vertexBufferLayout],
        },
        fragment: {
            module: fragShaderModule,
            entryPoint: "fragmentMain",
            targets: [{
                format: canvasFormat,
            }],
        },
    });

    // Encode rendering commands
    const encoder = device.createCommandEncoder();
    const pass = encoder.beginRenderPass({
        colorAttachments: [{
            view: context.getCurrentTexture().createView(),
            clearValue: { r: 0, g: 56 / 255, b: 101 / 255, a: 1 },
            loadOp: "clear",
            storeOp: "store",
        }],
    });

    pass.setPipeline(renderPipeline);

    // Draw triangle
    pass.setBindGroup(0, triangleBindGroup);
    pass.setVertexBuffer(0, triangleBuffer);
    pass.draw(triangleVertices.length / 2);

    // Draw square
    pass.setBindGroup(0, squareBindGroup);
    pass.setVertexBuffer(0, squareBuffer);
    pass.draw(squareVertices.length / 2);

    // Draw circle
    pass.setBindGroup(0, circleBindGroup);
    pass.setVertexBuffer(0, circleBuffer);
    pass.draw(circleVertices.length / 2);

    pass.end();

    // Submit commands
    device.queue.submit([encoder.finish()]);
    return context;
}

init()
    .then((ret) => {
        console.log(ret);
    })
    .catch((error) => {
        const pTag = document.createElement("p");
        pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
        document.body.appendChild(pTag);
        document.getElementById("renderCanvas").remove();
    });
