// TODO 3: Define a struct to store a particle
struct Particle {
  position: vec2f,
  velocity: vec2f,
};

// TODO 4: Write the bind group spells here using array<Particle>
// name the binded variables particlesIn and particlesOut
@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;

@vertex
fn vertexMain(@builtin(instance_index) idx: u32, @builtin(vertex_index) vIdx: u32) -> @builtin(position) vec4f {
  // TODO 5: Revise the vertex shader to draw circle to visualize the particles
  let particle = particlesIn[idx].position;
  let size = 0.01;
  let pi = 3.14159265;
  let theta = 2 * pi / 16 * f32(vIdx);
  let x = cos(theta) * size;
  let y = sin(theta) * size;
  return vec4f(vec2f(x + particle[0], y + particle[1]), 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(238.f/255, 118.f/255, 35.f/255, 1); // (R, G, B, A)
}

@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) global_id: vec3u) {
  let idx = global_id.x;
  
  if (idx < arrayLength(&particlesIn)) {
    var p = particlesIn[idx];
    p.position += p.velocity * 0.016; // Assuming a fixed time step
    
    // Boundary checking
    if (abs(p.position.x) > 1.0 || abs(p.position.y) > 1.0) {
      p.position = vec2f((fract(sin(f32(idx)) * 43758.5453) * 2.0 - 1.0),
                         (fract(cos(f32(idx)) * 43758.5453) * 2.0 - 1.0));
      p.velocity = vec2f(2, 0);  // Reset velocity
    }

    particlesOut[idx] = p;
  }
}
