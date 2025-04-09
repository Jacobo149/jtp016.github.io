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

import Renderer from './lib/Viz/2DRenderer.js';
import Standard2DVertexObject from './lib/DSViz/Standard2DVertexObject.js';

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);

  // Create a 2D renderer
  const renderer = new Renderer(canvasTag);
  await renderer.init();

  // Create a triangle geometry
  const triangleVertices = new Float32Array([
    // x,    y,     r, g, b, a
     0.0,  0.5,   1, 0, 0, 1,
    -0.5,  0.0,   0, 1, 0, 1,
     0.5,  0.0,   0, 0, 1, 1,
  ]);
  
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, triangleVertices));


  // Create a circle geometry (approximation with multiple points)
  const circleVertices = [];
  const numSegments = 100;
  const centerX = -0.8;
  const centerY = 0.2;
  const radius = 0.2;
  for (let i = 0; i < numSegments; i++) {
    const angle1 = (i / numSegments) * 2 * Math.PI;
    const angle2 = ((i + 1) / numSegments) * 2 * Math.PI;

    // center
    circleVertices.push(centerX, centerY, 1, 0, 0, 1);
    // point 1
    circleVertices.push(
      centerX + radius * Math.cos(angle1),
      centerY + radius * Math.sin(angle1),
      0, 1, 0, 1
    );
    // point 2
    circleVertices.push(
      centerX + radius * Math.cos(angle2),
      centerY + radius * Math.sin(angle2),
      0, 0, 1, 1
    );
  }

  
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, new Float32Array(circleVertices)));

  // Create a square geometry
  const squareVertices = new Float32Array([
    // x, y,     r, g, b, a
    -0.2, -0.1, 1, 0, 0, 1,
     0.2, -0.1, 0, 1, 0, 1,
     0.2, -0.5, 0, 0, 1, 1,
    -0.2, -0.1, 1, 0, 0, 1,
     0.2, -0.5, 0, 0, 1, 1,
    -0.2, -0.5, 1, 1, 0, 1,
  ]);
  
  await renderer.appendSceneObject(new Standard2DVertexObject(renderer._device, renderer._canvasFormat, squareVertices));

  renderer.render();
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
