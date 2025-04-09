import FilteredRenderer from './lib/Viz/FilterRenderer.js';
import Standard2DGAPosedVertexObject from './lib/DSViz/Standard2DGAPosedVertexObject.js';

async function init() {
    const canvasTag = document.createElement('canvas');
    canvasTag.id = "renderCanvas";
    document.body.appendChild(canvasTag);

    const renderer = new FilteredRenderer(canvasTag);
    await renderer.init();

    // === TRIANGLE (Animated) ===
    const triangleVertices = new Float32Array([
        0, 0.5,
        -0.5, 0,
        0.5, 0
    ]);
    const A = 0.5, B = 0.3, omega = 2 * Math.PI / 2000;
    let t = 0;
    const trianglePose = new Float32Array([1, 0, A * Math.cos(0), B * Math.sin(0), 1, 1, 0, 0]); 
    await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, triangleVertices, trianglePose));

    // === SQUARE (Static, Green) ===
    const squareVertices = new Float32Array([
        -0.2, 0.2,
        0.2, 0.2,
        0.2, -0.2,
        -0.2, 0.2,
        0.2, -0.2,
        -0.2, -0.2,
    ]);
    const squarePose = new Float32Array([1, 0, 0.6, 0.5, 0, 1, 0, 0]); // Green color
    await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, squareVertices, squarePose));

    // === CIRCLE (Static, Purple) ===
    const circleVertices = [];
    const centerX = -0.6, centerY = -0.4, radius = 0.2, segments = 50;
    for (let i = 0; i < segments; i++) {
        const angle1 = (i / segments) * 2 * Math.PI;
        const angle2 = ((i + 1) / segments) * 2 * Math.PI;

        circleVertices.push(centerX, centerY); // center
        circleVertices.push(centerX + radius * Math.cos(angle1), centerY + radius * Math.sin(angle1));
        circleVertices.push(centerX + radius * Math.cos(angle2), centerY + radius * Math.sin(angle2));
    }
    const circlePose = new Float32Array([1, 0, 0, 0, 1, 0, 1, 0.5]); // Purple (R+B)
    await renderer.appendSceneObject(new Standard2DGAPosedVertexObject(renderer._device, renderer._canvasFormat, new Float32Array(circleVertices), circlePose));

    // Animate triangle
    setInterval(() => { 
        renderer.render();
        trianglePose[2] = A * Math.cos(omega * t);
        trianglePose[3] = B * Math.sin(omega * t);
        t += 30;
    }, 30);

    renderer.render();
    return renderer;
}

init().then(renderer => {
    console.log("Renderer initialized:", renderer);
}).catch(error => {
    console.error(error);
});
