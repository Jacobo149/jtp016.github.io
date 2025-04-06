import RayTracer from '/lib/Viz/RayTracer.js'
import StandardTextObject from '/lib/DSViz/StandardTextObject.js'
import RayTracingBoxObject from '/lib/DSViz/RayTracingBoxObject.js'
import Camera from '/lib/Viz/3DCamera.js'

async function init() {
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);
  await new Promise(resolve => setTimeout(resolve, 100));
  const canvas = document.getElementById("renderCanvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const tracer = new RayTracer(canvasTag);
  await tracer.init();
  var camera = new Camera(canvas.width, canvas.height);
  var tracerObj = new RayTracingBoxObject(tracer._device, tracer._canvasFormat, camera, true);
  await tracer.setTracerObject(tracerObj);

  let fps = '??';
  var fpsText = new StandardTextObject('fps: ' + fps);

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

  document.addEventListener("keydown", (event) => {
    const moveStep = camera.move_speed;
    const rotateStep = camera.rotation_speed * 10;
    switch (event.key) {
      case "w": camera.moveZ(-moveStep); break;
      case "s": camera.moveZ(moveStep); break;
      case "a": camera.moveX(-moveStep); break;
      case "d": camera.moveX(moveStep); break;
      case "q": camera.moveY(-moveStep); break;
      case "e": camera.moveY(moveStep); break;
      case "ArrowUp": camera.rotateX(rotateStep); break;
      case "ArrowDown": camera.rotateX(-rotateStep); break;
      case "ArrowLeft": camera.rotateY(rotateStep); break;
      case "ArrowRight": camera.rotateY(-rotateStep); break;
      case "r": camera.rotateZ(rotateStep); break;
      case "f": camera.rotateZ(-rotateStep); break;
      case "+": camera.changeFocal(0.1); break;
      case "-": camera.changeFocal(-0.1); break;
      case "t": camera.toggleCameraType(); break;
    }
    tracerObj.updateCameraPose();
    tracer.render();
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
