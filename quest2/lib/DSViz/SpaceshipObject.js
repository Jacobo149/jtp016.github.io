import Standard2DPGAPosedVertexColorObject from "/lib/DSViz/Standard2DPGAPosedVertexColorObject.js";

export default class SpaceshipObject extends Standard2DPGAPosedVertexColorObject {
  constructor(device, canvasFormat, pose, size = 0.1, radius = 0.5, speed = 0.01) {
    const numSegments = 30;
    let _vertices = [];

    // Main body: Triangle shape
    _vertices.push(
      0, size, 0.0, 1.0, 0.0, 1.0,  // Top point
      size, -size, 0.0, 0.0, 1.0, 1.0, // Bottom right point
      -size, -size, 0.0, 0.0, 1.0, 1.0 // Bottom left point
    );

    // Left wing (positioned relative to the body)
    const wingWidth = size * 0.5;
    const wingHeight = size * 0.2;
    _vertices.push(
      -size - wingWidth, size * 1, 0.0, 0.5, 0.5, 1.0,  // Adjusted relative to body
      -size - wingWidth, -size * 0.4, 0.0, 0.5, 0.5, 1.0,
      -size, size * 0.4, 0.0, 0.0, 0.5, 1.0,
      -size, -size * 0.4, 0.0, 0.0, 0.5, 1.0
    );

    // Right wing (positioned relative to the body)
    _vertices.push(
      size + wingWidth, size * 0.4, 0.0, 0.5, 0.5, 1.0,   // Adjusted relative to body
      size + wingWidth, -size * 0.4, 0.0, 0.5, 0.5, 1.0,
      size, size * 0.4, 0.0, 0.0, 0.5, 1.0,
      size, -size * 0.4, 0.0, 0.0, 0.5, 1.0
    );

    // Initialize the super class with pose and vertex data
    super(device, canvasFormat, new Float32Array(_vertices), pose);

    this._radius = radius; // Orbital radius
    this._speed = speed;   // Orbital speed
    this._angle = Math.random() * Math.PI * 2; // Random starting angle

    // Ensure pose is initialized properly
    this._pose = pose || [1, 0, 0, 0, 0, 0]; // Default pose if not provided
  }

  updateGeometry() {
    // Update position based on orbital parameters
    this._angle += this._speed;
    if (this._angle > 2 * Math.PI) this._angle -= 2 * Math.PI;

    // Update position
    const x = this._radius * Math.cos(this._angle);
    const y = this._radius * Math.sin(this._angle);

    // Update the pose directly
    this._pose[4] = x;
    this._pose[5] = y;

    // Send the updated pose to the GPU
    super.updateGeometry();
  }
}
