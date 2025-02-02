import Standard2DPGAPosedVertexColorObject from "/lib/DSViz/Standard2DPGAPosedVertexColorObject.js";

export default class DemoCircleObject extends Standard2DPGAPosedVertexColorObject {
  constructor(device, canvasFormat, pose) {
    const numSegments = 30; // Number of subdivisions for smoothness
    const radius = 0.2;
    let _vertices = [];

    // Center vertex of the circle
    _vertices.push(0.0, 0.0, 34.0 / 255, 110.0 / 255, 34.0 / 255, 1);

    for (let i = 0; i <= numSegments; i++) {
      let theta = (i / numSegments) * 2.0 * Math.PI;
      let x = radius * Math.cos(theta);
      let y = radius * Math.sin(theta);
      _vertices.push(x, y, 34.0 / 255, 90.0 / 255, 34.0 / 255, 1);
    }

    super(device, canvasFormat, new Float32Array(_vertices), pose);
    this._interval = 100;
    this._t = 0;
    this._step = 1;
    this._pose0 = [-1, 0, 0.5, 0.5, 0.5, 0.5];
    this._pose1 = [0, 1, -0.5, 0.5, 0.5, 0.5];
  }

  updateGeometry() {
    // Linearly interpolate the motor
    this._pose[0] = this._pose0[0] * (1 - this._t / this._interval) + this._pose1[0] * this._t / this._interval;
    this._pose[1] = this._pose0[1] * (1 - this._t / this._interval) + this._pose1[1] * this._t / this._interval;
    this._pose[2] = this._pose0[2] * (1 - this._t / this._interval) + this._pose1[2] * this._t / this._interval;
    this._pose[3] = this._pose0[3] * (1 - this._t / this._interval) + this._pose1[3] * this._t / this._interval;
    
    // Interpolating back and forth
    this._t += this._step;
    if (this._t >= this._interval) {
      this._step = -1;
    } else if (this._t <= 0) {
      this._step = 1;
    }
    
    super.updateGeometry();
  }
}
