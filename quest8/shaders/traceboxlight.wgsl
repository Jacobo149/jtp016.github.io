/* 
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

// struct to sture 3D PGA multivector
struct MultiVector {
  s: f32, 
  exey: f32, 
  exez: f32, 
  eyez: f32, 
  eoex: f32, 
  eoey: f32, 
  eoez: f32, 
  exeyez: f32, 
  eoexey: f32, 
  eoexez: f32, 
  eoeyez: f32,
  ex: f32, 
  ey: f32, 
  ez: f32, 
  eo: f32,
  eoexeyez: f32
}

// the geometric product 
fn geometricProduct(a: MultiVector, b: MultiVector) -> MultiVector { 
  // The geometric product rules are:
  //   1. eoeo = 0, exex = 1 and eyey = 1, ezez = 1
  //   2. eoex + exeo = 0, eoey + eyeo = 0, eoez + ezeo = 0
  //   3. exey + eyex = 0, exez + ezex = 0, eyez + ezey = 0
  // This results in the following product table:
  var r: MultiVector;
  r.s = a.s * b.s - a.exey * b.exey - a.exez * b.exez - a.eyez * b.eyez - a.exeyez * b.exeyez + a.ex * b.ex + a.ey * b.ey + a.ez * b.ez; // scalar
  r.exey = a.s * b.exey + a.exey * b.s - a.exez * b.eyez + a.eyez * b.exez + a.exeyez * b.ez + a.ex * b.ey - a.ey * b.ex + a.ez * b.exeyez; // exey
  r.exez = a.s * b.exez + a.exey * b.eyez + a.exez * b.s - a.eyez * b.exey - a.exeyez * b.ey + a.ex * b.ez - a.ey * b.exeyez - a.ez * b.ex; // exez
  r.eyez = a.s * b.eyez - a.exey * b.exez + a.exez * b.exey + a.eyez * b.s + a.exeyez * b.ex + a.ex * b.exeyez + a.ey * b.ez - a.ez * b.ey; // eyez
  r.eoex = a.s * b.eoex + a.exey * b.eoey + a.exez * b.eoez - a.eyez * b.eoexeyez + a.eoex * b.s - a.eoey * b.exey - a.eoez * b.exez + a.exeyez * b.eoeyez + a.eoexey * b.ey + a.eoexez * b.ez - a.eoeyez * b.exeyez - a.ex * b.eo + a.ey * b.eoexey + a.ez * b.eoexez + a.eo * b.ex - a.eoexeyez * b.eyez; // eoex
  r.eoey = a.s * b.eoey - a.exey * b.eoex + a.exez * b.eoexeyez + a.eyez * b.eoez + a.eoex * b.exey + a.eoey * b.s - a.eoez * b.eyez - a.exeyez * b.eoexez - a.eoexey * b.ex + a.eoexez * b.exeyez + a.eoeyez * b.ey - a.ex * b.eoexey - a.ey * b.eo + a.ez * b.eoeyez + a.eo * b.ey + a.eoexeyez * b.exez; // eoey
  r.eoez = a.s * b.eoez - a.exey * b.eoexeyez - a.exez * b.eoex - a.eyez * b.eoey + a.eoex * b.exez + a.eoey * b.eyez + a.eoez * b.s + a.exeyez * b.eoexey - a.eoexey * b.exeyez - a.eoexez * b.ex - a.eoeyez * b.ey - a.ex * b.eoexez - a.ey * b.eoeyez - a.ez * b.eo + a.eo * b.ez - a.eoexeyez * b.exey; // eoez
  r.exeyez = a.s * b.exeyez + a.exey * b.ez - a.exez * b.ey + a.eyez * b.ex + a.exeyez * b.s + a.ex * b.eyez - a.ey * b.exez + a.ez * b.exey; // exeyez
  r.eoexey = a.s * b.eoexey + a.exey * b.eo - a.exez * b.eoeyez + a.eyez * b.eoexez + a.eoex * b.ey - a.eoey * b.ex + a.eoez * b.exeyez - a.exeyez * b.eoez + a.eoexey * b.s - a.eoexez * b.eyez + a.eoeyez * b.exez - a.ex * b.eoey + a.ey * b.eoex - a.ez * b.eoexeyez + a.eo * b.exey + a.eoexeyez * b.ez; // eoexey
  r.eoexez = a.s * b.eoexez + a.exey * b.eoeyez + a.exez * b.eo - a.eyez * b.eoexey + a.eoex * b.ez - a.eoey * b.exeyez - a.eoez * b.ex + a.exeyez * b.eoey + a.eoexey * b.eyez + a.eoexez * b.s - a.eoeyez * b.exey - a.ex * b.eoez + a.ey * b.eoexeyez + a.ez * b.eoex + a.eo * b.exez - a.eoexeyez * b.ey; // eoexez
  r.eoeyez = a.s * b.eoeyez - a.exey * b.eoexez + a.exez * b.eoexey + a.eyez * b.eo + a.eoex * b.exeyez + a.eoey * b.ez - a.eoez * b.ey - a.exeyez * b.eoex - a.eoexey * b.exez + a.eoexez * b.exey + a.eoeyez * b.s - a.ex * b.eoexeyez - a.ey * b.eoez + a.ez * b.eoey + a.eo * b.eyez + a.eoexeyez * b.ex; // eoeyez
  r.ex = a.s * b.ex + a.exey * b.ey + a.exez * b.ez - a.eyez * b.exeyez - a.exeyez * b.eyez + a.ex * b.s - a.ey * b.exey - a.ez * b.exez; // ex
  r.ey = a.s * b.ey - a.exey * b.ex + a.exez * b.exeyez + a.eyez * b.ez + a.exeyez * b.exez + a.ex * b.exey + a.ey * b.s - a.ez * b.eyez; // ey
  r.ez = a.s * b.ez - a.exey * b.exeyez - a.exez * b.ex - a.eyez * b.ey - a.exeyez * b.exey + a.ex * b.exez + a.ey * b.eyez + a.ez * b.s; // ez
  r.eo = a.s * b.eo - a.exey * b.eoexey - a.exez * b.eoexez - a.eyez * b.eoeyez + a.eoex * b.ex + a.eoey * b.ey + a.eoez * b.ez + a.exeyez * b.eoexeyez - a.eoexey * b.exey - a.eoexez * b.exez - a.eoeyez * b.eyez - a.ex * b.eoex - a.ey * b.eoey - a.ez * b.eoez + a.eo * b.s - a.eoexeyez * b.exeyez; // eo
  r.eoexeyez = a.s * b.eoexeyez + a.exey * b.eoez - a.exez * b.eoey + a.eyez * b.eoex + a.eoex * b.eyez - a.eoey * b.exez + a.eoez * b.exey - a.exeyez * b.eo + a.eoexey * b.ez - a.eoexez * b.ey + a.eoeyez * b.ex - a.ex * b.eoeyez + a.ey * b.eoexez - a.ez * b.eoexey + a.eo * b.exeyez + a.eoexeyez * b.s; // eoexeyez
  return r;
}

// the reverse of a Multivector
fn reverse(a: MultiVector) -> MultiVector {
  // The reverse is the reverse order of the basis elements
  //  the reverse of a scalar is the scalar
  //  the reverse of exey is eyex = -exey
  //  the reverse of exez is ezex = -exez
  //  the reverse of eyez is ezey = -eyez
  //  the reverse of eoex is exeo = -eoex
  //  the reverse of eoey is eyeo = -eoey
  //  the reverse of eoez is ezeo = -eoez
  //  the reverse of exeyez is ezeyex = exezey = -exeyez
  //  the reverse of eoexey is eyexeo = eoeyex = -eoexey
  //  the reverse of eoexez is ezexeo = eoezex = -eoexez
  //  the reverse of eoeyez is ezeyeo = eoezey = -eoeyez
  //  the reverse of ex, ey, ez, eo are ex, ey, ez, eo
  //  the reverse of eoexeyez is ezeyexeo = -eoezeyex = -eoexezey = eoexeyez
  // So, for [s, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez],
  // Its reverse is [s, -exey, -exez, eyez, -eoex, -eoey, -eoez, -exeyez, -eoexey, -eoexez, -eoeyez, ex, ey, ez, eo, eoexeyez].
  return MultiVector(a.s, -a.exey, -a.exez, -a.eyez, -a.eoex, -a.eoey, -a.eoez, -a.exeyez, -a.eoexey, -a.eoexez, -a.eoeyez, a.ex, a.ey, a.ez, a.eo, a.eoexeyez);
}

fn applyMotor(p: MultiVector, m: MultiVector) -> MultiVector {
  // To apply a motor to a point, we use the sandwich operation
  // The formula is m * p * reverse of m
  // Here * is the geometric product
  return geometricProduct(m, geometricProduct(p, reverse(m)));
}

fn motorNorm(m: MultiVector) -> f32 {
  // The norm of a motor is square root of the sum of square of the terms:
  // we have
  var sum = 0.;
  sum += m.s * m.s;
  sum += m.exey * m.exey;
  sum += m.exez * m.exez;
  sum += m.eyez * m.eyez;
  sum += m.eoex * m.eoex;
  sum += m.eoey * m.eoey;
  sum += m.eoez * m.eoez;
  sum += m.exeyez * m.exeyez;
  sum += m.eoexey * m.eoexey;
  sum += m.eoexez * m.eoexez;
  sum += m.eoeyez * m.eoeyez;
  sum += m.ex * m.ex;
  sum += m.ey * m.ey;
  sum += m.ez * m.ez;
  sum += m.eo * m.eo;
  sum += m.eoexeyez * m.eoexeyez;
  return sqrt(sum);
}

fn createTranslator(d: vec3f) -> MultiVector {
  // Given dx and dy describing the moveming in the x and y directions,
  // the translator is given by 1 + dx/2 exeo + dy/2 eyeo + dz/2 ezeo
  // In code, we always store the coefficents of
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  // Hence the implementation is as below
  return MultiVector(1, 0, 0, 0, -d.x / 2, -d.y / 2, -d.z / 2, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn extractTranslator(m: MultiVector) -> MultiVector {
  // Given a general motor, we can extract the translator part
  return MultiVector(1, 0, 0, 0, m.eoex, m.eoey, m.eoez, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createDir(d: vec3f) -> MultiVector {
  // A direction is given by dx eyez + dy ezex + dz exey
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, d.z, -d.y, d.x, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createLine(s: vec3f, d: vec3f) -> MultiVector {
  // A line is given by a starting point (sx, sy, sz) and a direction (dx, dy, dz)
  //  in this form: dx eyez + dy ezex + dz exey + (dy * sz - dz * sy) exeo + (dz * sx - dx * sz) eyeo + (dx * sy - dy * sx) ezeo
  let n = createDir(d); // represent the input direction in PGA
  let dir = normalizeMotor(n); // normalize the direction to make sure it is a unit direction
  // Note dir.exey = dz, dir.exez = -dy, dir.eyez = dx
  return MultiVector(0, dir.exey, dir.exez, dir.eyez, -(-dir.exez * s.z - dir.exey * s.y), -(dir.exey * s.x - dir.eyez * s.z), -(dir.eyez * s.y + dir.exez * s.x), 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createRotor(angle: f32, d: vec3f, spt: vec3f) -> MultiVector {
  // Given an angle and a rotation axis direction (dx, dy, dz) and a start point of the rotation axis,
  // the rotor is given by cos(angle / 2 ) + sin(angle / 2 ) L
  //  where L is the line in 3D PGA formed by the direction and the start point
  let c = cos(angle / 2);
  let s = sin(angle / 2);
  let L = createLine(spt, d);
  return MultiVector(c, s * L.exey, s * L.exez, s * L.eyez, s * L.eoex, s * L.eoey, s * L.eoez, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn extractRotor(m: MultiVector) -> MultiVector {
  // Given a general motor, we can extract the rotor part
  return MultiVector(m.s, m.exey, m.exez, m.eyez, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
}

fn createPoint(p: vec3f) -> MultiVector {
  // Given a point in 3D with coordinates (x, y, z)
  // A point in PGA is given by exeyez + x eoezey + y eoexez + z eoeyex
  // In code, we always store the coefficents of 
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, 0, 0, 0, 0, 0, 0, 1, -p.z, p.y, -p.x, 0, 0, 0, 0, 0);
}

fn extractPoint(p: MultiVector) -> vec3f {
  // to extract the 3d point from a exeyez + b eoezey + c eoexez + d eoeyex
  // we have x = -b/a and y = c/a and z = -d/a
  return vec3f(-p.eoeyez / p.exeyez, p.eoexez / p.exeyez, -p.eoexey / p.exeyez);
}

fn createPlane(n: vec3f, d: f32) -> MultiVector {
  // Given a plane in 3D with normal (nx, ny, nz) and distance from the origin d
  // A plane in PGA is given by nx ex + ny ey + nz ez - deo
  // In code, we always store the coefficents of 
  //    scalar, exey, exez, eyez, eoex, eoey, eoez, exeyez, eoexey, eoexez, eoeyez, ex, ey, ez, eo, eoexeyez
  return MultiVector(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, n.x, n.y, n.z, -d, 0);
}

fn createPlaneFromPoints(p1: vec3f, p2: vec3f, p3: vec3f) -> MultiVector {
  // Given three poitns (x1, y1, z1), (x2, y2, z2), (x3, y3, z3)
  // A plane in PGA is given by 
  //        ((y2 * z3 - y3 * z2) -      (y1 * z3 - y3 * z1) +      (y1 * z2 - y2 * z1)) ex 
  // -      ((x2 * z3 - x3 * z2) -      (x1 * z3 - x3 * z1) +      (x1 * z2 - x2 * z1)) ey 
  // +      ((x2 * y3 - x3 * y2) -      (x1 * y3 - x3 * y1) +      (x1 * y2 - x2 * y1)) ez 
  // + (x1 * (y2 * z3 - y3 * z2) - x2 * (y1 * z3 - y3 * z1) + x3 * (y1 * z2 - y2 * z1)) eo
  let nx =          (p2[1] * p3[2] - p3[1] * p2[2]) -         (p1[1] * p3[2] - p3[1] * p1[2]) +         (p1[1] * p2[2] - p2[1] * p1[2]);
  let ny =          (p2[0] * p3[2] - p3[0] * p2[2]) -         (p1[0] * p3[2] - p3[0] * p1[2]) +         (p1[0] * p2[2] - p2[0] * p1[2]);
  let nz =          (p2[0] * p3[1] - p3[0] * p2[1]) -         (p1[0] * p3[1] - p3[0] * p1[1]) +         (p1[0] * p2[1] - p2[0] * p1[1]);
  let d = (p1[0] * (p2[1] * p3[2] - p3[1] * p2[2]) - p2[0] * (p1[1] * p3[2] - p3[1] * p1[2]) + p3[0] * (p1[1] * p2[2] - p2[1] * p1[2]));
  return createPlane(vec3f(nx, -ny, nz), d);
}

// define a constant
const EPSILON : f32 = 0.00000001;

// a structure to store the hit information
struct HitInfo {
  p: vec3f,      // where it hits
  hit: bool,     // if it hits
  inPlane: bool, // if it does not hit, is it in the plane?
}

fn linePlaneIntersection(L: MultiVector, P: MultiVector) -> HitInfo {
  // In PGA, the intersection point is simply embedded in the geometric product betwen them
  let new_p = geometricProduct(L, P);
  var hitInfo: HitInfo;
  hitInfo.p = extractPoint(new_p);
  hitInfo.hit = !(abs(new_p.exeyez) <= EPSILON);
  hitInfo.inPlane = hitInfo.hit && abs(new_p.eoexey) <= EPSILON && abs(new_p.eoexez) <= EPSILON && abs(new_p.eoeyez) <= EPSILON;
  return hitInfo;
}

fn normalizeMotor(m: MultiVector) -> MultiVector {
  // To normalize a motor, we divide each coefficient by its norm
  let mnorm = motorNorm(m);
  if (mnorm == 0.0) {
    return MultiVector(1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
  }
  return MultiVector(m.s / mnorm, m.exey / mnorm, m.exez / mnorm, m.eyez / mnorm, m.eoex / mnorm, m.eoey / mnorm, m.eoez / mnorm, m.exeyez / mnorm, m.eoexey / mnorm, m.eoexez / mnorm, m.eoeyez / mnorm, m.ex / mnorm, m.ey / mnorm, m.ez / mnorm, m.eo / mnorm, m.eoexeyez / mnorm);
}

fn applyMotorToPoint(p: vec3f, m: MultiVector) -> vec3f {
  // apply the motor m to transform the point p
  // this code covert the 3d point p into PGA and apply the motor to transform it
  // then extra the result from PGA
  let new_p = applyMotor(createPoint(p), m);
  return extractPoint(new_p);
};

fn applyMotorToDir(d: vec3f, m: MultiVector) -> vec3f {
  // apply the motor m to transform the direction d
  // this code convert the 3d direction d into PGA, then extract the rotor from the motor
  // and transform the direction using the rotor
  // last, extra the result from PGA
  let r = extractRotor(m);
  let new_d = applyMotor(createPoint(d), r);
  return extractPoint(new_d);
}

// struct to store 3D PGA pose
struct Camera {
  motor: MultiVector,
  focal: vec2f,
  res: vec2f,
}

// struct to store a quad vertices
struct Quad {
  ll: vec4f, // lower left
  lr: vec4f, // lower right
  ur: vec4f, // upper right
  rl: vec4f, // upper left
}

// struct to store the box
struct Box {
  motor: MultiVector,     // the model pose of the box
  scale: vec4f,           // the scale of the box
  faces: array<Quad, 6>,  // six faces: front, back, left, right, top, down
}

// struct to store the light
struct Light {
  intensity: vec4f,   // the light intensity
  position: vec4f,    // where the light is
  direction: vec4f,   // the light direction
  attenuation: vec4f, // the attenuation factors
  params: vec4f,      // other parameters such as cut-off, drop off, area width/height, and radius etc.
}

// binding the camera pose
@group(0) @binding(0) var<uniform> cameraPose: Camera ;
// binding the box
@group(0) @binding(1) var<uniform> box: Box;
// binding the output texture to store the ray tracing results
@group(0) @binding(2) var outTexture: texture_storage_2d<rgba8unorm, write>;
// binding the Light
@group(0) @binding(3) var<uniform> light: Light;

// a helper function to get the hit point of a ray to a quad
fn quadRayHitCheck(s: vec3f, d: vec3f, q: Quad, ct: f32) -> vec2f {
  // Note, the quad is axis aligned
  // we assume the ray is transfomred using the poses to the model coordiantes
  // Step 1: Construct the ray as a line in PGA
  let L = createLine(s, d);
  // Step 2: Construct the plane in PGA
  let P = createPlaneFromPoints(q.ll.xyz, q.lr.xyz, q.ur.xyz); // we only need three points to define a plane
  // Step 3: Compute the intersection info
  var hitInfo = linePlaneIntersection(L, P);
  if (hitInfo.hit) {
    // Step 4: Check if the hit point within the face
    if (abs(q.ll.z - q.ur.z) <= EPSILON) { // z is 0, i.e. front or back face
      hitInfo.hit = (q.ll.x <= hitInfo.p.x && hitInfo.p.x <= q.ur.x) && (q.ll.y <= hitInfo.p.y && hitInfo.p.y <= q.ur.y);
    }
    else if (abs(q.ll.y - q.ur.y) <= EPSILON) { // y is 0, i.e. top or down face
      hitInfo.hit = (q.ll.x <= hitInfo.p.x && hitInfo.p.x <= q.ur.x) && (q.ll.z <= hitInfo.p.z && hitInfo.p.z <= q.ur.z);
    }
    else if (abs(q.ll.x - q.ur.x) <= EPSILON) { // x is 0, i.e. left or right face
      hitInfo.hit = (q.ll.y <= hitInfo.p.y && hitInfo.p.y <= q.ur.y) && (q.ll.z <= hitInfo.p.z && hitInfo.p.z <= q.ur.z);
    }
    // Step 5: Compute the new hit (t) value i.e. hitPt = s + t * d
    if (hitInfo.hit) {
      var nt: f32 = -1.;
      // pick one axis to compute the t value
      if (d.x > EPSILON) {
        nt = (hitInfo.p.x - s.x) / d.x;
      }
      else if (d.y > EPSILON) {
        nt = (hitInfo.p.y - s.y) / d.y;
      }
      else {
        nt = (hitInfo.p.z - s.z) / d.z;
      }
      // return the hit cases
      if (nt < 0) {
        return vec2f(ct, -1); // Case 1: the ray has already passed the face, no hit
      }
      else if (ct < 0) {
        return vec2f(nt, 1.); // Case 2: the first hit is nt, and say it hits the new face
      }
      else {
        if (nt < ct) {
          return vec2f(nt, 1.); // Case 3: the closer is nt, and say it hits the new face first
        }
        else {
          return vec2f(ct, -1.); // Case 4: the closer is ct, and say it hits the old face first
        }
      }
    }
  }
  return vec2f(ct, -1.); // Default Case: no hit
}

// a function to transform the direction to the model coordiantes
fn transformDir(d: vec3f) -> vec3f {
  // transform the direction using the camera pose
  var out = applyMotorToDir(d, cameraPose.motor);
  // transform it using the object pose
  out = applyMotorToDir(out, reverse(box.motor));
  out /= box.scale.xyz;
  return out;
}

// a function to transform the start pt to the model coordiantes
fn transformPt(pt: vec3f) -> vec3f {
  // transform the point using the camera pose
  var out = applyMotorToPoint(pt, cameraPose.motor);
  // transform it using the object pose
  out = applyMotorToPoint(out, reverse(box.motor));
  out /= box.scale.xyz;
  return out;
}

// a function to transform normal to the world coordiantes
fn transformNormal(n: vec3f) -> vec3f {
  var out = n * box.scale.xyz;
  out = applyMotorToDir(out, box.motor);
  return normalize(out);
}

// a function to transform hit point to the world coordiantes
fn transformHitPoint(pt: vec3f) -> vec3f {
  var out = pt * box.scale.xyz;
  out = applyMotorToPoint(out, box.motor);
  return out;
}

// a function to compute the ray box intersection
fn rayBoxIntersection(s: vec3f, d: vec3f) -> vec2f { // output is (t, idx)
  // t is the hit value, idx is the fact it hits
  // here we have six planes to check and we keep the cloest hit point
  var t = -1.;
  var idx = -1.;
  for (var i = 0; i < 6; i++) {
    let info = quadRayHitCheck(s, d, box.faces[i], t);
    if (info.y > 0) {
      t = info.x;
      idx = f32(i);
    }
  }
  return vec2f(t, idx);
}

// a function to get the box emit color
fn boxEmitColor() -> vec4f {
  return vec4f(0, 0, 0, 1); // my box doesn't emit any color
}

// a function to get the box diffuse color
fn lamberDiffuseColor(idx: i32) -> vec4f {
  // CyberPunk Theme
  var color: vec4f;
  switch(idx) {
    case 0: { color = vec4f(255.0/255, 0.0/255, 110.0/255, 1.0); break; } // Hot pink  
    case 1: { color = vec4f(0.0/255, 255.0/255, 255.0/255, 1.0); break; } // Cyan glow  
    case 2: { color = vec4f(100.0/255, 0.0/255, 255.0/255, 1.0); break; } // Purple  
    case 3: { color = vec4f(255.0/255, 255.0/255, 0.0/255, 1.0); break; } // Neon yellow  
    case 4: { color = vec4f(255.0/255, 0.0/255, 255.0/255, 1.0); break; } // Magenta  
    case 5: { color = vec4f(0.0/255, 0.0/255, 255.0/255, 1.0); break; } // Electric blue  
    default: { color = vec4f(0.0, 0.0, 0.0, 1.0); break; } // Black
  }

  return color;
}

fn toonDiffuseColor(idx: i32) -> vec4f {
  // CyberPunk Theme
  var color: vec4f;
  switch(idx) {
    // Toon Palette - Bold & High Contrast
    case 0: { color = vec4f(255.0/255, 85.0/255, 85.0/255, 1.0); break; } // Cartoon Red  
    case 1: { color = vec4f(255.0/255, 221.0/255, 51.0/255, 1.0); break; } // Cartoon Yellow  
    case 2: { color = vec4f(51.0/255, 204.0/255, 51.0/255, 1.0); break; } // Cartoon Green  
    case 3: { color = vec4f(51.0/255, 153.0/255, 255.0/255, 1.0); break; } // Cartoon Blue  
    case 4: { color = vec4f(153.0/255, 102.0/255, 255.0/255, 1.0); break; } // Cartoon Purple  
    case 5: { color = vec4f(0.0/255, 0.0/255, 0.0/255, 1.0); break; } // Cartoon Black (shadow base)   
    default: { color = vec4f(0.0, 0.0, 0.0, 1.0); break; } // Black
  }

  return color;
}

fn phongDiffuseColor(idx: i32) -> vec4f {
  // CyberPunk Theme
  var color: vec4f;
  switch(idx) {
    case 0: { color = vec4f(192.0/255, 57.0/255, 43.0/255, 1.0); break; } // Crimson Red  
    case 1: { color = vec4f(243.0/255, 156.0/255, 18.0/255, 1.0); break; } // Amber Gold  
    case 2: { color = vec4f(39.0/255, 174.0/255, 96.0/255, 1.0); break; } // Emerald Green  
    case 3: { color = vec4f(41.0/255, 128.0/255, 185.0/255, 1.0); break; } // Sapphire Blue  
    case 4: { color = vec4f(127.0/255, 140.0/255, 141.0/255, 1.0); break; } // Steel Gray  
    case 5: { color = vec4f(236.0/255, 240.0/255, 241.0/255, 1.0); break; } // Pearl White    
    default: { color = vec4f(0.0, 0.0, 0.0, 1.0); break; } // Black
  }

  return color;
}

// a function to get the box normal
fn boxNormal(idx: i32) -> vec3f {
  // my box's normal is facing inward as I want to see the inside instead of the outside
  // Pay attention here: how you arrange your quad vertices will affect which normal is pointing inward and which is pointing outward! The normal is always relative to how you define your model!
  // if you see your surface is black, try to flip your normal
  switch(idx) {
    case 0: { //front
      return vec3f(0, 0, -1);
    }
    case 1: { //back
      return vec3f(0, 0, -1);
    }
    case 2: { //left
      return vec3f(-1, 0, 0);
    }
    case 3: { //right
      return vec3f(-1, 0, 0);
    }
    case 4: { //top
      return vec3f(0, -1, 0);
    }
    case 5: { //down
      return vec3f(0, -1, 0);
    }
    default: {
      return vec3f(0, 0, 0);
    }
  }
}

// a structure to store the computed light information
struct LightInfo {
  intensity: vec4f, // the final light intensity
  lightdir: vec3f, // the final light direction
}

// a function to compute the light intensity and direction
fn getLightInfo(lightPos: vec3f, lightDir: vec3f, hitPoint: vec3f, objectNormal: vec3f) -> LightInfo {
  var intensity = light.intensity;
  var out: LightInfo;
  
  // 1 = Point Light (default)
  // 2 = Directional Light
  // 3 = Spot Light
  let lightType = i32(light.params.z); // Use z component to store light type
  
  if (lightType == 2) {
    // Directional Light - intensity is constant, direction is fixed
    intensity *= 0.5;
    out.intensity = intensity * max(dot(-lightDir, objectNormal), 0);
    out.lightdir = -lightDir; // Directional lights use a fixed direction
  } 
  else if (lightType == 3) {
    // Spot Light - has position, direction, cutoff and dropoff
    var distVec = hitPoint - lightPos;
    var dist = length(distVec);
    var lightToPoint = normalize(distVec);
    
    // Make sure light direction is normalized
    var normalizedLightDir = normalize(lightDir);
    
    // Calculate the angle between light direction and the vector to the hit point
    // For a spotlight pointing down, the light direction is [0,-1,0]
    // We want to check if the point is within the cone defined by the spotlight
    let cosAngle = dot(normalizedLightDir, -lightToPoint);
    let cutoff = light.params.x;
    
    // If the point is within the spotlight cone
    if (cosAngle > cos(cutoff)) {
      // Calculate intensity based on angle from center of spotlight
      let dropoff = max(light.params.y, 1.0);
      let spotFactor = pow(cosAngle, dropoff);
      
      // Calculate distance-based attenuation
      let factor = light.attenuation[0] + dist * light.attenuation[1] + dist * dist * light.attenuation[2];
      
      // Apply both spot factor and distance attenuation
      intensity = intensity * spotFactor / factor;
      
      // Final lighting calculation with normal
      out.intensity = intensity * max(dot(-lightToPoint, objectNormal), 0);
    } else {
      // Outside the spotlight cone - no direct light
      out.intensity = vec4f(0.0, 0.0, 0.0, 0.0);
    }
    
    out.lightdir = -lightToPoint;
  }
  else {
    // Point Light (default)
    var distVec = hitPoint - lightPos;
    var dist = length(distVec);
    var lightToPoint = normalize(distVec);

    let factor = light.attenuation[0] + dist * light.attenuation[1] + dist * dist * light.attenuation[2];
    intensity /= factor;
    out.intensity = intensity * max(dot(lightToPoint, -objectNormal), 0);
    out.lightdir = lightToPoint;
  }
  
  return out;
}

@compute
@workgroup_size(16, 16)
fn computeOrthogonalMain(@builtin(global_invocation_id) global_id: vec3u) {
  // Get the pixel coordinates
  let uv = vec2i(global_id.xy);
  let texDim = vec2i(textureDimensions(outTexture));

  // Ensure we are within bounds
  if (uv.x < texDim.x && uv.y < texDim.y) {
    // Compute pixel size
    let psize = vec2f(2, 2) / cameraPose.res.xy;

    // Orthogonal camera: ray originates at each pixel's center, direction along z-axis
    var spt = vec3f((f32(uv.x) + 0.5) * psize.x - 1, (f32(uv.y) + 0.5) * psize.y - 1, 0.0);
    var rdir = vec3f(0.0, 0.0, 1.0);

    // Apply transformations
    spt = transformPt(spt);
    rdir = transformDir(rdir);

    // Choose shading model based on light parameters
    if (light.params.w == 1.0) {
      phongShader(uv, spt, rdir);
    } else if (light.params.w == 2.0) {
      toonShader(uv, spt, rdir);
    } else {
      lamberShader(uv, spt, rdir); // Default Lambertian shading
    }
  }
}


@compute
@workgroup_size(16, 16)
fn computeProjectiveMain(@builtin(global_invocation_id) global_id: vec3u) {
  // Get the pixel coordinates
  let uv = vec2i(global_id.xy);
  let texDim = vec2i(textureDimensions(outTexture));

  // Ensure we are within bounds
  if (uv.x < texDim.x && uv.y < texDim.y) {
    // Compute pixel size based on focal length and resolution
    let psize = vec2f(2, 2) * cameraPose.focal.xy / cameraPose.res.xy;

    // Projective camera setup: rays start from origin (0, 0, 0) and point toward each pixel
    var spt = vec3f(0.0, 0.0, 0.0);
    var rdir = vec3f(
      (f32(uv.x) + 0.5) * psize.x - cameraPose.focal.x,
      (f32(uv.y) + 0.5) * psize.y - cameraPose.focal.y,
      cameraPose.focal.x
    );

    // Normalize the direction vector
    rdir = normalize(rdir);

    // Apply transformations
    spt = transformPt(spt);
    rdir = transformDir(rdir);

    // Compute the intersection with the object
    var hitInfo = rayBoxIntersection(spt, rdir);

    // Choose shading model based on light parameters
    if (light.params.w == 1.0) {
      phongShader(uv, spt, rdir);
    } else if (light.params.w == 2.0) {
      toonShader(uv, spt, rdir);
    } else {
      lamberShader(uv, spt, rdir); // Default Lambertian shading
    }
  }
}


fn phongShader(uv: vec2i, spt: vec3f, rdir: vec3f) {
  var hitInfo = rayBoxIntersection(spt, rdir);
  var color = vec4f(0.f/255, 56.f/255, 101.f/255, 1.);

  if (hitInfo.x > 0) {
    let emit = boxEmitColor();
    var diffuse = phongDiffuseColor(i32(hitInfo.y));
    var normal = boxNormal(i32(hitInfo.y));
    normal = transformNormal(normal);

    let lightPos = applyMotorToPoint(light.position.xyz, reverse(cameraPose.motor));
    let lightDir = applyMotorToDir(light.direction.xyz, reverse(cameraPose.motor));

    var hitPt = spt + rdir * hitInfo.x;
    hitPt = transformHitPoint(hitPt);

    let lightInfo = getLightInfo(lightPos, lightDir, hitPt, normal);
    
    var diffuseComponent = diffuse * lightInfo.intensity;

    var reflectDir = reflect(lightInfo.lightdir, normal);
    var viewDir = normalize(-rdir);
    var specFactor = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
    var specularComponent = vec4f(1.0, 1.0, 1.0, 1.0) * light.intensity * specFactor;

    var ambientComponent = diffuse * 0.1;

    color = emit + diffuseComponent + specularComponent + ambientComponent;
  }

  textureStore(outTexture, uv, color);
}


fn lamberShader(uv: vec2i, spt: vec3f, rdir: vec3f) {
  var hitInfo = rayBoxIntersection(spt, rdir);
  var color = vec4f(0.f/255, 56.f/255, 101.f/255, 1.); // Bucknell Blue

  if (hitInfo.x > 0) {
    let emit = boxEmitColor();
    var diffuse = lamberDiffuseColor(i32(hitInfo.y));
    var normal = boxNormal(i32(hitInfo.y));
    normal = transformNormal(normal);

    let lightPos = applyMotorToPoint(light.position.xyz, reverse(cameraPose.motor));
    let lightDir = applyMotorToDir(light.direction.xyz, reverse(cameraPose.motor));
    
    var hitPt = spt + rdir * hitInfo.x;
    hitPt = transformHitPoint(hitPt);

    let lightInfo = getLightInfo(lightPos, lightDir, hitPt, normal);
    diffuse *= lightInfo.intensity;

    color = emit + diffuse;
  }

  textureStore(outTexture, uv, color);
}


fn toonShader(uv: vec2i, spt: vec3f, rdir: vec3f) {
  // Compute the intersection with the object
  var hitInfo = rayBoxIntersection(spt, rdir);
  var color = vec4f(0.f / 255, 56.f / 255, 101.f / 255, 1.); // Bucknell Blue
  if (hitInfo.x > 0) { // Hit detection
    let emit = boxEmitColor(); // Get emission color
    var diffuse = toonDiffuseColor(i32(hitInfo.y)); // Get diffuse material property
    var normal = transformNormal(boxNormal(i32(hitInfo.y))); // Transform normal to world coordinates

    // Light setup
    let lightPos = applyMotorToPoint(light.position.xyz, reverse(cameraPose.motor));
    let lightDir = applyMotorToDir(light.direction.xyz, reverse(cameraPose.motor));

    // Transform the hit point to world coordinates
    var hitPt = transformHitPoint(spt + rdir * hitInfo.x);

    // Compute light information
    let lightInfo = getLightInfo(lightPos, lightDir, hitPt, normal);

    // Phong components
    var diffuseIntensity = max(dot(-lightInfo.lightdir, normal), 0.0);
    var shininess = 32.0;
    var reflectDir = reflect(lightInfo.lightdir, normal);
    var viewDir = normalize(-rdir);
    var specFactor = max(dot(viewDir, reflectDir), 0.0);
    specFactor = pow(specFactor, shininess);

    // Quantize diffuse into more levels (e.g., 6 levels: 0.0, 0.17, 0.33, 0.5, 0.67, 1.0)
    if (diffuseIntensity < 0.17) {
      diffuseIntensity = 0.0;
    } else if (diffuseIntensity < 0.33) {
      diffuseIntensity = 0.17;
    } else if (diffuseIntensity < 0.5) {
      diffuseIntensity = 0.33;
    } else if (diffuseIntensity < 0.67) {
      diffuseIntensity = 0.5;
    } else if (diffuseIntensity < 0.83) {
      diffuseIntensity = 0.67;
    } else {
      diffuseIntensity = 1.0;
    }

    // Quantize specular to more levels (e.g., 4 levels: 0.0, 0.33, 0.67, 1.0)
    if (specFactor < 0.33) {
      specFactor = 0.0;
    } else if (specFactor < 0.67) {
      specFactor = 0.33;
    } else if (specFactor < 1.0) {
      specFactor = 0.67;
    } else {
      specFactor = 1.0;
    }

    // Final components
    var diffuseComponent = diffuse * light.intensity * diffuseIntensity;
    var specularComponent = vec4f(1.0, 1.0, 1.0, 1.0) * light.intensity * specFactor;
    var ambientComponent = diffuse * 0.1;

    // Edge detection (simulating cartoon edges)
    var edgeFactor = dot(normal, viewDir);
    if (edgeFactor < 0.4) {
      color = vec4f(0.0, 0.0, 0.0, 1.0); // Edge color
    } else {
      color = emit + diffuseComponent + specularComponent + ambientComponent;
    }
  }

  // Set the final color to the pixel
  textureStore(outTexture, uv, color);
}
