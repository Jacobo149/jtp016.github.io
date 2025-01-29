struct VertexOutput {
    @builtin(position) position: vec4f,
    @location(0) color: vec4f,
}

@vertex // this compute the scene coordinate of each input vertex and its color information
fn vertexMain(@location(0) pos: vec2f, @location(1) color: vec4f) -> VertexOutput { 
    var out: VertexOutput;
    out.position = vec4f(pos, 0, 1); // (pos, Z, W) = (X, Y, Z, W)
    out.color = color;
    return out;
}

@fragment // this compute the color of each pixel
fn fragmentMain(@location(0) color: vec4f) -> @location(0) vec4f {
    return color; // (R, G, B, A)
}
