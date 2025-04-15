import Renderer from './lib/Viz/2DRenderer.js';
import PolygonObject from './lib/DSViz/PolygonObject.js';
import StandardTextObject from './lib/DSViz/StandardTextObject.js';

async function init() {
  // Create canvas
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);

  // Create status text
  const statusText = document.createElement('div');
  statusText.id = 'statusText';
  statusText.style.position = 'absolute';
  statusText.style.top = '10px';
  statusText.style.left = '10px';
  statusText.style.padding = '6px 12px';
  statusText.style.background = 'rgba(0, 0, 0, 0.6)';
  statusText.style.color = 'white';
  statusText.style.fontFamily = 'monospace';
  statusText.style.zIndex = 1000;
  statusText.innerText = 'Position: unknown';
  document.body.appendChild(statusText);

  // Create renderer
  const renderer = new Renderer(canvasTag);
  await renderer.init();

  // Add polygon with reference to status text
  const polygon = new PolygonObject(renderer._device, renderer._canvasFormat, './assets/box.polygon', renderer._canvas, statusText);
  await renderer.appendSceneObject(polygon);

  let fps = '??';
  var fpsText = new StandardTextObject('fps: ' + fps);

  // Animation loop
  var frameCnt = 0;
  var tgtFPS = 60;
  var secPerFrame = 1. / tgtFPS;
  var frameInterval = secPerFrame * 1000;
  var lastCalled;

  let renderFrame = () => {
    let elapsed = Date.now() - lastCalled;
    if (elapsed > frameInterval) {
      ++frameCnt;
      lastCalled = Date.now() - (elapsed % frameInterval);
      renderer.render();
    }
    requestAnimationFrame(renderFrame);
  };

  lastCalled = Date.now();
  renderFrame();

  setInterval(() => {
    fpsText.updateText('fps: ' + frameCnt);
    frameCnt = 0;
  }, 1000);

  return renderer;
}

init().then(ret => {
  console.log(ret);
}).catch(error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
