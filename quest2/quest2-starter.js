import FilteredRenderer from './lib/Viz/2DFilteredRenderer.js';
import Standard2DFullScreenObject from './lib/DSViz/Standard2DFullScreenObject.js';
import PGA2D from './lib/Math/PGA2D.js';
import SpaceshipObject from './lib/DSViz/SpaceshipObject.js';
import Standard2DVertexColorObject from './lib/DSViz/Standard2DVertexColorObject.js';

async function createShapeObject(
  renderer,
  x,
  y,
  scale,
  r,
  g,
  b,
  a,
  segments,
  pose
) {
  const vertices = [];
  segments = Math.max(3, segments);

  for (let i = 0; i < segments; ++i) {
    let angle = (i * 2 * Math.PI) / segments;
    let nextAngle = ((i + 1) * 2 * Math.PI) / segments;

    let x1 = x + Math.cos(angle) * scale;
    let y1 = y + Math.sin(angle) * scale;

    let x2 = x + Math.cos(nextAngle) * scale;
    let y2 = y + Math.sin(nextAngle) * scale;

    vertices.push(
      x, y, r, g, b, a,
      x1, y1, r, g, b, a,
      x2, y2, r, g, b, a,
    );
  }

  const verticesArray = new Float32Array(vertices);
  pose = new Float32Array(pose);

  await renderer.appendSceneObject(
    new Standard2DVertexColorObject(
      renderer._device,
      renderer._canvasFormat,
      verticesArray
    )
  );
}

async function init() {
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);

  const renderer = new FilteredRenderer(canvasTag);
  await renderer.init();

  await renderer.appendSceneObject(new Standard2DFullScreenObject(renderer._device, renderer._canvasFormat, "./assets/pexels-krisof-1252890.jpg"));

  let spaceshipPose = new Float32Array([1, 0, 0, 0, 0.5, 0.5]);
  let spaceship = new SpaceshipObject(renderer._device, renderer._canvasFormat, spaceshipPose, 0.1, 0.5, 0.01);

  let sunPose = new Float32Array([1, 0, 0, 0, 0, 0]);
  await createShapeObject(renderer, 0, 0, 0.3, 1.0, 1.0, 0.0, 1.0, 30, sunPose);

  const planets = [];
  const planetData = [
    { radius: 0.2, speed: 0.02, color: [0.5, 0.5, 0.5, 1.0] },
    { radius: 0.4, speed: 0.015, color: [1.0, 0.8, 0.0, 1.0] },
    { radius: 0.6, speed: 0.01, color: [0.0, 0.0, 1.0, 1.0] },
    { radius: 0.8, speed: 0.008, color: [1.0, 0.0, 0.0, 1.0] },
    { radius: 1.2, speed: 0.005, color: [1.0, 0.5, 0.0, 1.0] },
    { radius: 1.6, speed: 0.004, color: [1.0, 1.0, 0.0, 1.0] },
    { radius: 2.0, speed: 0.003, color: [0.0, 1.0, 1.0, 1.0] },
    { radius: 2.4, speed: 0.002, color: [0.5, 0.0, 0.5, 1.0] }
  ];

  for (let i = 0; i < planetData.length; i++) {
    let angle = Math.random() * Math.PI * 2;
    let x = planetData[i].radius * Math.cos(angle);
    let y = planetData[i].radius * Math.sin(angle);

    let pose = new Float32Array([1, 0, 0, 0, x, y]);
    await createShapeObject(renderer, x, y, 0.1, ...planetData[i].color, 30, pose);

    planets.push({ angle, speed: planetData[i].speed, radius: planetData[i].radius });
  }

  await renderer.appendSceneObject(spaceship);


  setInterval(() => {
    renderer.render();

    for (let i = 0; i < planets.length; i++) {
      planets[i].angle += planets[i].speed;
      let x = planets[i].radius * Math.cos(planets[i].angle);
      let y = planets[i].radius * Math.sin(planets[i].angle);
      createShapeObject(renderer, x, y, 0.1, ...planetData[i].color, 30, [1, 0, 0, 0, x, y]);
    }

    spaceship.updateGeometry();
  }, 100);

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