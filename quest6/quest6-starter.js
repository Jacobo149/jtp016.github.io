import RayTracer from './lib/Viz/RayTracer.js';
import StandardTextObject from './lib/DSViz/StandardTextObject.js';
import RayTracingBoxObject from './lib/DSViz/RayTracingBoxObject.js';
import Camera from './lib/Viz/3DCamera.js';

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
  const camera = new Camera(canvas.width, canvas.height);
  const tracerObj = new RayTracingBoxObject(tracer._device, tracer._canvasFormat, camera, true);
  await tracer.setTracerObject(tracerObj);

  const fpsText = new StandardTextObject('fps: ??');

  let frameCnt = 0;
  const tgtFPS = 60;
  const frameInterval = 1000 / tgtFPS;
  let lastCalled = Date.now();

  const renderFrame = () => {
    const elapsed = Date.now() - lastCalled;
    if (elapsed > frameInterval) {
      ++frameCnt;
      lastCalled = Date.now() - (elapsed % frameInterval);
      tracer.render();
    }
    requestAnimationFrame(renderFrame);
  };

  renderFrame();
  setInterval(() => {
    fpsText.updateText('fps: ' + frameCnt);
    frameCnt = 0;
  }, 1000);

  // === Animated cube scaling ===
  let scale = 1.0;
  let direction = 1;
  setInterval(() => {
    scale += 0.005 * direction;
    if (scale > 1.5 || scale < 0.5) direction *= -1;
    tracerObj._box._scales.set([scale, scale, scale]);
    tracerObj.updateBoxScales();
  }, 16);

  // === Mouse camera rotation with orbit toggle ===
  let isDragging = false;
  let lastX, lastY;
  let orbitMode = false;

  canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
  });

  canvas.addEventListener('mouseup', () => {
    isDragging = false;
  });

  canvas.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    if (orbitMode) {
      camera.orbitY(-dx * 0.1);
      camera.orbitX(-dy * 0.1);
    } else {
      camera.rotateY(dx * 0.1);
      camera.rotateX(dy * 0.1);
    }
    tracerObj.updateCameraPose();
    tracer.render();
  });

  // === Keyboard Controls + orbit toggle ===
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
      case "o": orbitMode = !orbitMode; break;
    }
    tracerObj.updateCameraPose();
    tracer.render();
  });

  // === UI instructions ===
  const controlBox = document.createElement("div");
  controlBox.style.position = "fixed";
  controlBox.style.top = "10px";
  controlBox.style.right = "10px";
  controlBox.style.padding = "10px";
  controlBox.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  controlBox.style.color = "white";
  controlBox.style.fontFamily = "monospace";
  controlBox.style.fontSize = "14px";
  controlBox.style.borderRadius = "8px";
  controlBox.style.maxWidth = "300px";
  controlBox.innerHTML = `
    <b>Controls</b><br/>
    <u>Move:</u> W/A/S/D/Q/E<br/>
    <u>Rotate:</u> ↑/↓/←/→/R/F<br/>
    <u>Zoom:</u> + / -<br/>
    <u>Toggle camera type:</u> T<br/>
    <u>Toggle orbit mode:</u> O<br/>
    <u>Mouse drag:</u> Rotate camera/orbit<br/>
    <u>Reset camera:</u> Click "Reset View"<br/>
    <u>Cube:</u> Automatically pulses<br/>
  `;
  document.body.appendChild(controlBox);

  // === Reset Camera Button ===
  const resetBtn = document.createElement("button");
  resetBtn.innerText = "Reset View";
  resetBtn.style.position = "fixed";
  resetBtn.style.top = "10px";
  resetBtn.style.right = "320px";
  resetBtn.style.padding = "8px 12px";
  resetBtn.style.borderRadius = "6px";
  resetBtn.style.border = "none";
  resetBtn.style.backgroundColor = "#444";
  resetBtn.style.color = "white";
  resetBtn.style.fontFamily = "monospace";
  resetBtn.style.cursor = "pointer";
  resetBtn.onclick = () => {
    camera.resetPose();
    tracerObj.updateCameraPose();
    tracer.render();
  };
  document.body.appendChild(resetBtn);

  return tracer;
}

// Error handler
init().then(ret => {
  console.log(ret);
}).catch(error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
