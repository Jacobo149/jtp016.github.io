import FilteredRenderer from '/lib/Viz/2DFilteredRenderer.js';
import Standard2DFullScreenObject from '/lib/DSViz/Standard2DFullScreenObject.js';
import DemoCircleObject from '/lib/DSViz/DemoCircleObject.js';
import PGA2D from '/lib/Math/PGA2D.js';
import StationaryCircleObject from '/lib/DSViz/StationaryCircleObject.js'; // Use the new class
import Standard2DVertexColorObject from '/lib/DSViz/Standard2DVertexColorObject.js'; // Use the new class
import SpaceshipObject from '/lib/DSViz/SpaceshipObject.js'; // Use the new class
import ImageGreyscaleFilterObject from '/lib/DSViz/ImageGreyscaleFilterObject.js'; // Use the new class
import ImageBlurFilterObject from '/lib/DSViz/ImageBlurFilterObject.js'; // Use the new class
import ImagePointillismFilterObject from '/lib/DSViz/ImagePointillismFilterObject.js'; // Use the new class

async function init() {
  // Create a canvas tag
  const canvasTag = document.createElement('canvas');
  canvasTag.id = "renderCanvas";
  document.body.appendChild(canvasTag);

  // Create a 2D animated renderer
  const renderer = new FilteredRenderer(canvasTag);
  await renderer.init();

 // Load the background image as a texture
 await renderer.appendSceneObject(new Standard2DFullScreenObject(renderer._device, renderer._canvasFormat, "/assets/pexels-krisof-1252890.jpg"));

 // Apply filters sequentially
 //await renderer.appendFilterObject(new ImageGreyscaleFilterObject(renderer._device, renderer._canvasFormat, canvasTag));
 //await renderer.appendFilterObject(new ImageBlurFilterObject(renderer._device, renderer._canvasFormat, canvasTag));
 //await renderer.appendFilterObject(new ImagePointillismFilterObject(renderer._device, renderer._canvasFormat, canvasTag));


  // Create spaceship and add it to the scene with orbital motion
  let spaceshipPose = new Float32Array([1, 0, 0, 0, 0.5, 0.5]);
  let spaceship = new SpaceshipObject(renderer._device, renderer._canvasFormat, spaceshipPose, 0.1, 0.5, 0.01);
  await renderer.appendSceneObject(spaceship);
  console.log("Spaceship Object added:", spaceship);

  // Sun at (0, 0) with a large size and no movement (stationary)
  let sunRadius = 0.3; // Increase radius for visibility
  let sunPose = new Float32Array([1, 0, 0, 0, 0, 0]); // No motion for Sun, fixed at center

  // Vertices for a circle
  let vertices = [];
  const numSegments = 30; // Number of subdivisions for smoothness
  for (let i = 0; i <= numSegments; i++) {
    let theta = (i / numSegments) * 2.0 * Math.PI;
    let x = sunRadius * Math.cos(theta);
    let y = sunRadius * Math.sin(theta);
    vertices.push(x, y, 1.0, 1.0, 0.0, 1.0); // Yellow (RGBA format)
  }

  // Create the Sun as a Standard2DVertexColorObject
  let sun = new Standard2DVertexColorObject(
    renderer._device,
    renderer._canvasFormat,
    new Float32Array(vertices)
  );

  // Append the Sun to the scene
  await renderer.appendSceneObject(sun);
  console.log("Sun Object added:", sun);

  // Define planet properties: radius, orbital speed, and initial angles
  const planets = [];
  const planetData = [
    { radius: 0.2, speed: 0.02 }, // Mercury
    { radius: 0.4, speed: 0.015 }, // Venus
    { radius: 0.6, speed: 0.01 }, // Earth
    { radius: 0.8, speed: 0.008 }, // Mars
    { radius: 1.2, speed: 0.005 }, // Jupiter
    { radius: 1.6, speed: 0.004 }, // Saturn
    { radius: 2.0, speed: 0.003 }, // Uranus
    { radius: 2.4, speed: 0.002 }  // Neptune
  ];

  // Create planets with different orbits
  for (let i = 0; i < planetData.length; i++) {
    let angle = Math.random() * Math.PI * 2; // Random starting angle
    let x = planetData[i].radius * Math.cos(angle);
    let y = planetData[i].radius * Math.sin(angle);

    let pose = new Float32Array([1, 0, 0, 0, x, y]); // Position planet
    let planet = new DemoCircleObject(renderer._device, renderer._canvasFormat, pose);

    planets.push({ object: planet, angle, speed: planetData[i].speed, radius: planetData[i].radius });
    await renderer.appendSceneObject(planet);
  }

  // Run at every 100 ms
  setInterval(() => {
    renderer.render();

    // Update each planet's position
    for (let planet of planets) {
      planet.angle += planet.speed; // Increment angle based on speed
      let x = planet.radius * Math.cos(planet.angle);
      let y = planet.radius * Math.sin(planet.angle);
      planet.object._pose[4] = x;
      planet.object._pose[5] = y;
    }

    // Update spaceship's orbital position
    spaceship.updateGeometry(); // Update spaceship's position in orbit

  }, 100); // Update every 100ms

  return renderer;
}

async function loadImageAsTexture(imagePath, device) {
  // Create an image element
  const image = new Image();
  image.src = imagePath;
  await new Promise((resolve) => {
    image.onload = resolve;
  });

  // Create a GPU texture from the loaded image
  const imageBitmap = await createImageBitmap(image);
  const texture = device.createTexture({
    size: [imageBitmap.width, imageBitmap.height, 1],
    format: 'rgba8unorm',
    usage: GPUTextureUsage.SAMPLED | GPUTextureUsage.COPY_SRC,
  });

  // Copy the image data into the texture
  device.queue.copyExternalImageToTexture(
    { source: imageBitmap },
    { texture: texture },
    [imageBitmap.width, imageBitmap.height]
  );

  return texture;
}




init().then(ret => {
  console.log(ret);
}).catch(error => {
  const pTag = document.createElement('p');
  pTag.innerHTML = navigator.userAgent + "</br>" + error.message;
  document.body.appendChild(pTag);
  document.getElementById("renderCanvas").remove();
});
