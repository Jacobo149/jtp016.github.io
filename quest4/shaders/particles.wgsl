// TODO 3: Define a struct to store a particle
struct Particle {
  position: vec2f;
  velocity: vec2f;
};

// TODO 4: Write the bind group spells here using array<Particle>
// name the binded variables particlesIn and particlesOut
@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;

@vertex
fn vertexMain(@builtin(instance_index) idx: u32, @builtin(vertex_index) vIdx: u32) -> @builtin(position) vec4f {
  // TODO 5: Revise the vertex shader to draw circle to visualize the particles
  let center = particlesIn[idx].position;
  let angle = (f32(vIdx) / 6.0) * 3.141592653589793 * 2.0;
  let offset = vec2f(cos(angle) * 0.02, sin(angle) * 0.02);
  return vec4f(center + offset, 0, 1);
}

@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(238.f/255, 118.f/255, 35.f/255, 1); // (R, G, B, A)
}

@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) global_id: vec3u) {
  // TODO 6: Revise the compute shader to update the particles using the velocity
  let idx = global_id.x;
  
  if (idx < arrayLength(&particlesIn)) {
    var p = particlesIn[idx];
    p.position += p.velocity * 0.016; // Assuming a fixed time step
    
    // TODO 7: Add boundary checking and respawn the particle when it is offscreen
    if (abs(p.position.x) > 1.0 || abs(p.position.y) > 1.0) {
      p.position = vec2f((fract(sin(f32(idx)) * 43758.5453) * 2.0 - 1.0),
                         (fract(cos(f32(idx)) * 43758.5453) * 2.0 - 1.0));
      p.velocity = vec2f(0, 0);
    }
    
    particlesOut[idx] = p;
  }
}