import FilteredRenderer from '/lib/Viz/FilterRenderer.js';
import Standard2DGAPosedVertexObject from '/lib/DSViz/Standard2DGAPosedVertexObject.js';

async function init() {
    // Create a canvas tag
    const canvasTag = document.createElement('canvas');
    canvasTag.id = "renderCanvas";
    document.body.appendChild(canvasTag);

    // Initialize renderer
    const renderer = new FilteredRenderer(canvasTag);
    await renderer.init();

    // Define triangle geometry
    const vertices = new Float32Array([
        0, 0.5,
        -0.5, 0,
        0.5, 0
    ]);

    // Parametric equations for motion
    const A = 0.5;  // X amplitude
    const B = 0.3;  // Y amplitude
    const omega = 2 * Math.PI / 2000; // Controls speed (full cycle in 2000ms)

    let t = 0; // Time variable

    // Initialize pose buffer (with padding to 32 bytes)
    let pose = new Float32Array([1, 0, A * Math.cos(0), B * Math.sin(0), 1, 1, 0, 0]); 
    await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, vertices, pose));

    setInterval(() => { 
        renderer.render();

        // Update position using parametric equations
        pose[2] = A * Math.cos(omega * t); // X position
        pose[3] = B * Math.sin(omega * t); // Y position

        t += 30; // Increment time step
    }, 30); // Call every 30ms

    renderer.render();
    return renderer;
}

init().then(renderer => {
    console.log("Renderer initialized:", renderer);
}).catch(error => {
    console.error(error);
});
