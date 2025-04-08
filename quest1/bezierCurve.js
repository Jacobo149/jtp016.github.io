import FilteredRenderer from './lib/Viz/FilterRenderer.js';
import Standard2DGAPosedVertexObject from './lib/DSViz/Standard2DGAPosedVertexObject.js';

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

    // Bezier Interpolation Function
    function bezier(t, p0, p1, p2, p3) {
        return Math.pow(1 - t, 3) * p0 +
               3 * Math.pow(1 - t, 2) * t * p1 +
               3 * (1 - t) * Math.pow(t, 2) * p2 +
               Math.pow(t, 3) * p3;
    }

    // Define control points for animation
    let p0 = [0, -0.75];  // Start position
    let p1 = [0.25, -0.5]; // Control point 1
    let p2 = [-0.25, 0.5]; // Control point 2
    let p3 = [0, 0.75];  // End position

    let t = 0;
    let step = 0.01; // Step size

    // Initialize pose
    let pose = new Float32Array([1, 0, p0[0], p0[1], 1, 1, 0, 0]); 
    await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, vertices, pose));

    setInterval(() => { 
        renderer.render();

        // Bezier interpolation for position
        pose[2] = bezier(t, p0[0], p1[0], p2[0], p3[0]);
        pose[3] = bezier(t, p0[1], p1[1], p2[1], p3[1]);

        t += step;
        if (t > 1 || t < 0) {
            step = -step;  // Reverse direction at end points
        }
    }, 30); // Call every 30 ms

    renderer.render();
    return renderer;
}

init().then(renderer => {
    console.log("Renderer initialized:", renderer);
}).catch(error => {
    console.error(error);
});
