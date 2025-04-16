// Define a struct to store a particle
struct Particle {
  position: vec2f,
  velocity: vec2f,
  isActive: i32, // Change from bool to i32 to track if the particle is active
  age: f32,      // Track the age of the particle
  lifespan: f32, // Track the lifespan of the particle
};

// Define gravity constant in the compute shader
const gravity = vec2f(0.0, -0.05);  // Gravity in the y direction (downward)

// Bind groups for input and output particles
@group(0) @binding(0) var<storage, read> particlesIn: array<Particle>;
@group(0) @binding(1) var<storage, read_write> particlesOut: array<Particle>;

// Vertex shader to draw particles as points (visualize the particles)
@vertex
fn vertexMain(@builtin(instance_index) idx: u32, @builtin(vertex_index) vIdx: u32) -> @builtin(position) vec4f {
  let particle = particlesIn[idx];
  
  // Only process particles that are active
  if (particle.isActive == 0) { // Use integer check for activity
    return vec4f(0.0, 0.0, 0.0, 1.0); // Return invalid position for inactive particles
  }

  let size = 0.8;
  let pi = 3.14159265;
  let theta = 2 * pi / 16 * f32(vIdx);
  let x = cos(theta) * size;
  let y = sin(theta) * size;

  return vec4f(vec2f(x + particle.position.x, y + particle.position.y), 0.0, 1.0);
}

// Fragment shader to color the particles
@fragment
fn fragmentMain() -> @location(0) vec4f {
  return vec4f(238.0/255.0, 118.0/255.0, 35.0/255.0, 1.0); // Particle color (RGB)
}

// Add mouse position as input
@group(0) @binding(2) var<uniform> mousePosition: vec2f;

// Compute shader to update particle positions, velocities, and handle boundary conditions
@compute @workgroup_size(256)
fn computeMain(@builtin(global_invocation_id) global_id: vec3u) {
  let idx = global_id.x;

  if (idx < arrayLength(&particlesIn)) {
    var p = particlesIn[idx];

    // If the particle is active, update its position and velocity
    if (p.isActive == 1) {
      p.age += 0.016;

      if (p.age > p.lifespan) {
        p.isActive = 0;
      } else {
        // Apply gravity to the velocity
        p.velocity += gravity * 0.016;

        // Apply mouse attraction force
        let direction = mousePosition - p.position; // Direction vector from particle to mouse
        let distance = length(direction);
        if (distance > 0.1) { // Apply attraction only if particle is far enough
          let attraction = normalize(direction) * 0.05; // Apply constant attraction force
          p.velocity += attraction;
        }

        // Update position based on velocity
        p.position += p.velocity * 0.016;
      }
    }

    // Check if particle needs to be emitted (reactivated)
    if (p.isActive == 0) {
      p.position = vec2f(0.0, 0.0);
      p.velocity = vec2f((fract(sin(f32(idx) * 0.8) * 43758.5453) * 2.0 - 1.0) * 0.1,
                         (fract(cos(f32(idx) * 0.8) * 43758.5453) * 2.0 - 1.0) * 0.1);
      p.lifespan = 5.0;
      p.age = 0.0;
      p.isActive = 1;
    }

    // Update the particle in the output buffer
    particlesOut[idx] = p;
  }
}

