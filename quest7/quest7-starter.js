// This is a starter code for the Quest 7 assignment.
import RayTracer from './lib/Viz/RayTracer.js';
import StandardTextObject from './lib/DSViz/StandardTextObject.js';
import VolumeRenderingSimpleObject from './lib/DSViz/VolumeRenderingSimpleObject.js';
import Camera from './lib/Viz/3DCamera.js';

async function init() {
  // Create canvas and tracer
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);
  const tracer = new RayTracer(canvasTag);
  await tracer.init();

  // Use fixed dimensions to avoid 0x0 problems
  const width = 800;
  const height = 600;
  canvasTag.width = width;
  canvasTag.height = height;

  // Create camera
  var camera = new Camera(width, height);
  window.__camera = camera; // For debugging in the console

  // Create traceable object with camera
  var tracerObj = new VolumeRenderingSimpleObject(tracer._device, tracer._canvasFormat, camera);
  await tracer.setTracerObject(tracerObj);

  // Set up FPS text
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
      tracer.render();
    }
    requestAnimationFrame(renderFrame);
  };
  lastCalled = Date.now();
  renderFrame();

  setInterval(() => { 
    fpsText.updateText('fps: ' + frameCnt);
    frameCnt = 0;
  }, 1000);

  // === 🧠 KEYBOARD CONTROLS HERE ===
  document.addEventListener('keydown', (e) => {
    const step = 0.1;
    const rotStep = 5;
    let cameraChanged = true;

    switch (e.key.toLowerCase()) {
      case 'w': camera.moveZ(-step); break;
      case 's': camera.moveZ(step); break;
      case 'a': camera.moveX(-step); break;
      case 'd': camera.moveX(step); break;
      case 'q': camera.moveY(step); break;
      case 'e': camera.moveY(-step); break;

      case 'arrowup': camera.rotateX(-rotStep); break;
      case 'arrowdown': camera.rotateX(rotStep); break;
      case 'arrowleft': camera.rotateY(-rotStep); break;
      case 'arrowright': camera.rotateY(rotStep); break;
      case 'z': camera.rotateZ(-rotStep); break;
      case 'x': camera.rotateZ(rotStep); break;

      case '+':
      case '=': camera.changeFocal(0.1); break;
      case '-':
      case '_': camera.changeFocal(-0.1); break;

      case 'p': camera.toggleCameraType(); break;

      default: cameraChanged = false; break;
    }

    if (cameraChanged) {
      console.log('Key pressed:', e.key);
      console.log('Camera pose:', camera._pose);

      if (typeof tracerObj.cameraUpdated === 'function') {
        tracerObj.cameraUpdated(); // Update GPU buffer
      }

      tracer.render(); // Force re-render for now
    }
  });

  return tracer;
}

init().then(ret => {
  console.log(ret);
}).catch(error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
