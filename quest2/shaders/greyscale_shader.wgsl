@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn computeMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let texSize = textureDimensions(inputTexture);
  if (all(global_id.xy < texSize.xy)) {
    let color = textureLoad(inputTexture, global_id.xy);
    let grey = (color.r + color.g + color.b) / 3.0;
    textureStore(outputTexture, global_id.xy, vec4<f32>(grey, grey, grey, 1.0));
  }
}
