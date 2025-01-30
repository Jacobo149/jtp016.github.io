// struct to store 2D GA pose
  struct Pose {
  rotor: vec2f,
  translator: vec2f,
  scale: vec2f,
  r_center: vec2f // added a rotation center
};

@group(0) @binding(0) var<uniform> pose: Pose;

fn applyRotorToPoint(p: vec2f, r: vec2f) -> vec2f{
  // p = x e0 + y e1
  // r = c S - s e01
  // r * p * rv
  let c = r[0];
  let s = r[1];
  let rotated = vec2f(c * p[0] - s * p[1], c * p[1] + s * p[0]);
  return vec2f(rotated[0], rotated[1]);
};

@vertex // this compute the scene coordinate of each input vertex
fn vertexMain(@location(0) pos: vec2f) -> @builtin(position) vec4f {
  // Apply rotor
  let rotated = applyRotorToPoint(pos - pose.r_center, pose.rotor) + pose.r_center;
  // Apply translator
  let transformed = rotated + pose.translator;
  // Apply scale
  let scaled = transformed * pose.scale;
  return vec4f(scaled, 0, 1); // (pos, Z, W) = (X, Y, Z, W)
}

@fragment // this compute the color of each pixel
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(238.f/255, 118.f/255, 35.f/255, 1); // (R, G, B, A)
}