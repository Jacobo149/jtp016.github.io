@group(0) @binding(0) var inputTexture: texture_2d<f32>;
@group(0) @binding(1) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(16, 16)
fn computeMain(@builtin(global_invocation_id) global_id: vec3<u32>) {
  let texSize = textureDimensions(inputTexture);
  if (all(global_id.xy < texSize.xy)) {
    var colorSum = vec4<f32>(0.0);
    let offset: array<vec2<i32>, 9> = array<vec2<i32>, 9>(
      vec2<i32>(-1, -1), vec2<i32>( 0, -1), vec2<i32>( 1, -1),
      vec2<i32>(-1,  0), vec2<i32>( 0,  0), vec2<i32>( 1,  0),
      vec2<i32>(-1,  1), vec2<i32>( 0,  1), vec2<i32>( 1,  1)
    );
    var sampleCount: u32 = 0;
    for (var i = 0; i < 9; i = i + 1) {
      let samplePos = global_id.xy + offset[i];
      if (samplePos.x < texSize.x && samplePos.y < texSize.y && samplePos.x >= 0 && samplePos.y >= 0) {
        colorSum = colorSum + textureLoad(inputTexture, samplePos);
        sampleCount = sampleCount + 1;
      }
    }
    textureStore(outputTexture, global_id.xy, colorSum / f32(sampleCount));
  }
}
