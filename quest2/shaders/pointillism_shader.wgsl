@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn computeMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let texSize = textureDimensions(inputTexture);
  if (all(global_id.xy < texSize.xy)) {
    let color = textureLoad(inputTexture, global_id.xy);
    let pointSize = 4.0; // Random size for "pointillism"
    if (mod(global_id.x, pointSize) == 0 && mod(global_id.y, pointSize) == 0) {
      textureStore(outputTexture, global_id.xy, color);
    } else {
      textureStore(outputTexture, global_id.xy, vec4<f32>(0.0, 0.0, 0.0, 0.0));
    }
  }
}
