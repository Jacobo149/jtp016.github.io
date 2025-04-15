import Renderer from './lib/Viz/2DRenderer.js';
import PolygonObject from './lib/DSViz/PolygonObject.js';
import StandardTextObject from './lib/DSViz/StandardTextObject.js';

function createCollisionEffect(x, y) {
  const ripple = document.createElement('div');
  ripple.style.position = 'absolute';
  ripple.style.width = '20px';
  ripple.style.height = '20px';
  ripple.style.borderRadius = '50%';
  ripple.style.border = '2px solid #00FFFF';
  ripple.style.left = `${x - 10}px`;
  ripple.style.top = `${y - 10}px`;
  ripple.style.opacity = '1';
  ripple.style.transform = 'scale(1)';
  ripple.style.transition = 'transform 0.5s ease-out, opacity 0.5s ease-out';
  ripple.style.zIndex = 999;

  effectContainer.appendChild(ripple);

  requestAnimationFrame(() => {
    ripple.style.transform = 'scale(4)';
    ripple.style.opacity = '0';
  });

  setTimeout(() => {
    ripple.remove();
  }, 500);
}

let effectContainer;

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

  // Create instruction text
  const instructionText = document.createElement('div');
  instructionText.id = 'instructionText';
  instructionText.style.position = 'absolute';
  instructionText.style.top = '40px';
  instructionText.style.left = '10px';
  instructionText.style.padding = '6px 12px';
  instructionText.style.background = 'rgba(0, 0, 0, 0.6)';
  instructionText.style.color = 'white';
  instructionText.style.fontFamily = 'monospace';
  instructionText.style.zIndex = 1000;
  instructionText.innerText = 'Arrow Up: Increase Stiffness\nArrow Down: Decrease Stiffness';
  document.body.appendChild(instructionText);

  // Create ripple effect container
  effectContainer = document.createElement('div');
  effectContainer.style.position = 'absolute';
  effectContainer.style.top = '0';
  effectContainer.style.left = '0';
  effectContainer.style.width = '100%';
  effectContainer.style.height = '100%';
  effectContainer.style.pointerEvents = 'none';
  effectContainer.style.overflow = 'hidden';
  document.body.appendChild(effectContainer);

  // Create renderer
  const renderer = new Renderer(canvasTag);
  await renderer.init();

  // Add polygon with reference to status text
  const polygon = new PolygonObject(renderer._device, renderer._canvasFormat, './assets/box.polygon', renderer._canvas, statusText);
  polygon.setEffectCallback(createCollisionEffect);
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
