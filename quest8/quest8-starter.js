/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 *
 * This code is provided mainly for educational purposes at Bucknell University.
 *
 * This code is licensed under the Creative Commons Attribution-NonCommerical 4.0
 * International License. To view a copy of the license, visit
 *   https://creativecommons.org/licenses/by-nc/4.0/
 * or send a letter to Creative Commons, PO Box 1866, Mountain View, CA 94042, USA.
 *
 * You are free to:
 *  - Share: copy and redistribute the material in any medium or format.
 *  - Adapt: remix, transform, and build upon the material.
 *
 * Under the following terms:
 *  - Attribution: You must give appropriate credit, provide a link to the license,
 *                 and indicate if changes where made.
 *  - NonCommerical: You may not use the material for commerical purposes.
 *  - No additional restrictions: You may not apply legal terms or technological
 *                                measures that legally restrict others from doing
 *                                anything the license permits.
 */

// Check your browser supports: https://github.com/gpuweb/gpuweb/wiki/Implementation-Status#implementation-status
// Need to enable experimental flags chrome://flags/
// Chrome & Edge 113+ : Enable Vulkan, Default ANGLE Vulkan, Vulkan from ANGLE, Unsafe WebGPU Support, and WebGPU Developer Features (if exsits)
// Firefox Nightly: sudo snap install firefox --channel=latext/edge or download from https://www.mozilla.org/en-US/firefox/channel/desktop/

/*!
 * Copyright (c) 2025 SingChun LEE @ Bucknell University. CC BY-NC 4.0.
 */

import RayTracer from "/lib/Viz/RayTracer.js";
import RayTracingBoxLightObject from "/lib/DSViz/RayTracingBoxLightObject.js";
import Camera from "/lib/Viz/3DCamera.js";
import PointLight from "/lib/Viz/PointLight.js";
import DirectionalLight from "/lib/Viz/DirectionalLight.js";
import SpotLight from "/lib/Viz/SpotLight.js";

// === Constants === //
const moveSpeed = 0.2;
const rotateSpeed = 0.1;
const fpsUpdateInterval = 1000;
const targetFPS = 60;
const frameInterval = 1000 / targetFPS;

const controlsText = `
<b>Controls:</b><br>
<b>Movement</b>: Arrow Keys (← ↑ ↓ →), PgUp/PgDn<br>
<b>Rotation</b>: J/K (Vertical), H/L (Horizontal), U/O (2D Axis Roll)<br>
<b>Camera</b>: P - Toggle Projection<br>
<b>Lighting</b>: 1 - Point, 2 - Directional, 3 - Spot<br>
<b>Shader</b>: 4 - Lambert, 5 - Phong, 6 - Toon<br>
<b>Bloom</b>: B - Toggle Bloom<br>
I - Toggle Info
`;

let currentLightType = "point";
let currentShaderMode = "lambert";

async function init() {
  const canvas = document.createElement("canvas");
  canvas.id = "renderCanvas";
  document.body.appendChild(canvas);

  const tracer = new RayTracer(canvas);
  await tracer.init();

  const camera = new Camera();
  camera._pose[2] = 0;
  camera._pose[3] = 0;
  camera._isProjective = false;

  const tracerObj = new RayTracingBoxLightObject(tracer._device, tracer._canvasFormat, camera);
  await tracer.setTracerObject(tracerObj);

  const lights = {
    point: new PointLight(),
    directional: new DirectionalLight(),
    spot: new SpotLight()
  };

  let currentLight = lights.point;
  tracerObj.updateLight(currentLight);

  const fpsText = createStyledTextBox();
  const updateFps = () => {
    fpsText.innerHTML = `
      <b>FPS:</b> ${frameCnt}<br><br>${controlsText}<br>
      <b>Current Light:</b> ${currentLightType}<br>
      <b>Current Shader:</b> ${currentShaderMode}
    `;
    frameCnt = 0;
  };

  setupKeyControls(camera, tracerObj, lights, (lightType, shaderMode) => {
    currentLightType = lightType;
    currentShaderMode = shaderMode;
    currentLight = lights[lightType];
    tracerObj.updateLight(currentLight);
  }, fpsText);

  // Animation Loop
  let frameCnt = 0;
  let lastFrame = Date.now();

  const renderFrame = () => {
    let now = Date.now();
    if (now - lastFrame >= frameInterval) {
      frameCnt++;
      lastFrame = now;
      tracer.render();
    }
    requestAnimationFrame(renderFrame);
  };

  renderFrame();
  setInterval(updateFps, fpsUpdateInterval);

  return tracer;
}

function setupKeyControls(camera, tracerObj, lights, updateLightShaderState, fpsText) {
  window.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) return;

    const { key } = event;

    const movementKeys = {
      ArrowUp: () => camera.moveZ(moveSpeed),
      ArrowDown: () => camera.moveZ(-moveSpeed),
      ArrowLeft: () => camera.moveX(-moveSpeed),
      ArrowRight: () => camera.moveX(moveSpeed),
      PageUp: () => camera.moveY(moveSpeed),
      PageDown: () => camera.moveY(-moveSpeed)
    };

    const rotationKeys = {
      j: () => camera.rotateX(rotateSpeed),
      k: () => camera.rotateX(-rotateSpeed),
      h: () => camera.rotateY(rotateSpeed),
      l: () => camera.rotateY(-rotateSpeed),
      u: () => camera.rotateZ(rotateSpeed),
      o: () => camera.rotateZ(-rotateSpeed)
    };

    if (movementKeys[key]) {
      movementKeys[key]();
    } else if (rotationKeys[key.toLowerCase()]) {
      rotationKeys[key.toLowerCase()]();
    } else {
      switch (key.toLowerCase()) {
        case "p":
          camera._isProjective = !camera._isProjective;
          break;
        case "i":
          fpsText.style.display = fpsText.style.display === "none" ? "block" : "none";
          break;
        case "1":
          updateLightShaderState("point", currentShaderMode);
          lights.point._params[2] = 1.0;
          break;
        case "2":
          updateLightShaderState("directional", currentShaderMode);
          lights.directional._params[2] = 2.0;
          break;
        case "3":
          updateLightShaderState("spot", currentShaderMode);
          lights.spot._params[2] = 3.0;
          break;
        case "4":
          currentShaderMode = "lambert";
          lights[currentLightType]._params[3] = 0.0;
          break;
        case "5":
          currentShaderMode = "phong";
          lights[currentLightType]._params[3] = 1.0;
          break;
        case "6":
          currentShaderMode = "toon";
          lights[currentLightType]._params[3] = 2.0;
          break;
        default:
          return;
      }
    }

    tracerObj.updateCameraPose();
    event.preventDefault();
  });
}

function createStyledTextBox() {
  const div = document.createElement("div");
  div.style.position = "fixed";
  div.style.top = "10px";
  div.style.right = "10px";
  div.style.maxWidth = "300px";
  div.style.padding = "12px";
  div.style.backgroundColor = "rgba(0, 0, 0, 0.75)";
  div.style.color = "#00ffcc";
  div.style.fontFamily = "monospace";
  div.style.fontSize = "13px";
  div.style.borderRadius = "8px";
  div.style.boxShadow = "0 0 10px rgba(0,0,0,0.5)";
  div.style.zIndex = 1000;
  div.innerHTML = controlsText;
  document.body.appendChild(div);
  return div;
}

// === Launch === //
init()
  .then(console.log)
  .catch((error) => {
    const p = document.createElement("p");
    p.innerHTML = `${navigator.userAgent}<br>${error.message}`;
    document.body.appendChild(p);
    document.getElementById("renderCanvas")?.remove();
  });


// Floating Ambient Particles
function createFloatingParticle() {
  const dot = document.createElement("div");
  dot.style.position = "fixed";
  dot.style.width = "8px";
  dot.style.height = "8px";
  dot.style.borderRadius = "50%";
  dot.style.backgroundColor = "#00ffff";
  dot.style.left = Math.random() * window.innerWidth + "px";
  dot.style.top = Math.random() * window.innerHeight + "px";
  dot.style.opacity = Math.random().toFixed(2);
  dot.style.pointerEvents = "none";
  dot.style.zIndex = "1";
  document.body.appendChild(dot);
  setTimeout(() => dot.remove(), 3000);
}
setInterval(createFloatingParticle, 100);

// 3. Bloom Toggle (Key "B")
let bloomActive = false;
document.addEventListener("keydown", (e) => {
  if (e.key.toLowerCase() === "b") {
    bloomActive = !bloomActive;
    document.body.style.filter = bloomActive ? "brightness(1.2) blur(1px)" : "none";
  }
});