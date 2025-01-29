import FilteredRenderer from '/lib/Viz/FilterRenderer.js';
import Standard2DVertexColorObject from '/lib/DSViz/Standard2DVertexObject.js';
import Standard2DFullScreenObject from '/lib/DSViz/Standard2DFullScreenObject.js';
import LineStrip2DVertexObject from '/lib/DSViz/LineStrip2DVertexObject.js';
import ImageFilterObject from '/lib/DSViz/ImageFilterObject.js';
import Image8BitsFilterObject from '/lib/DSViz/Image8BitsFilterObject.js';
import ImageNosifyFilterObject from '/lib/DSViz/ImageNosifyFilterObject.js';

async function init() {
    // Create a canvas tag
    const canvasTag = document.createElement('canvas');
    canvasTag.id = "renderCanvas";
    document.body.appendChild(canvasTag);
    // Create a 2d renderer
    const renderer = new FilteredRenderer(canvasTag);
    await renderer.init();

    // Create a triangle geometry
var vertices = new Float32Array([
    // x, y
      0, 0.5,
      -0.5, 0,
      0.5,  0,
      0, 0.5, // line strip draw a loop, so set the last vertex the same as the first
    ]);

    // Add Standard2DVertexObject
    await renderer.appendSceneObject(new Standard2DFullScreenObject(renderer._device, renderer._canvasFormat, "/assets/me.ico"));

    await renderer.appendSceneObject(new LineStrip2DVertexObject(renderer._device, renderer._canvasFormat, vertices));

    // Add Filter Object
    await renderer.appendFilterObject(new ImageFilterObject(renderer._device, renderer._canvasFormat, canvasTag));

    // Add 8 Bit Filter Object
    await renderer.appendFilterObject(new Image8BitsFilterObject(renderer._device, renderer._canvasFormat, canvasTag));

    // Nosify Filter
    await renderer.appendFilterObject(new ImageNosifyFilterObject(renderer._device, renderer._canvasFormat, canvasTag));



    renderer.render();
    return renderer;
}

init().then( ret => {
    console.log(ret);
    }).catch( error => {
    const pTag = document.createElement('p');
    pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
    document.body.appendChild(pTag);
    document.getElementById("renderCanvas").remove();
});
    