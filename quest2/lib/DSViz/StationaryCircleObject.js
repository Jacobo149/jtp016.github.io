import Standard2DPGAPosedVertexColorObject from "/lib/DSViz/Standard2DPGAPosedVertexColorObject.js"

export default class StationaryCircleObject extends Standard2DPGAPosedVertexColorObject {
  constructor(device, canvasFormat, pose, radius = 0.5, color = [1.0, 1.0, 0.0, 1.0]) { // Default Yellow Sun
    const numSegments = 40;
    let _vertices = [];

    // Center vertex of the circle
    _vertices.push(0.0, 0.0, ...color);

    // Generate circle vertices
    for (let i = 0; i <= numSegments; i++) {
      let theta = (i / numSegments) * 2.0 * Math.PI;
      let x = radius * Math.cos(theta);
      let y = radius * Math.sin(theta);
      _vertices.push(x, y, ...color);
    }

    super(device, canvasFormat, new Float32Array(_vertices), pose);
  }

  updateGeometry() {
    // Do nothing - this object does not move!
  }
}
