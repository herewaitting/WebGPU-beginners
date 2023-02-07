struct VSOut {
    @builtin(position) Position: vec4<f32>,
    @location(0) color: vec3<f32>,
 };

struct UniformParams {
    tint_color: vec4<f32>,
};

@group(0) @binding(0) var<uniform> params: UniformParams;

@vertex
fn main(@location(0) inPos: vec3<f32>,
        @location(1) inColor: vec3<f32>) -> VSOut {
    var vsOut: VSOut;
    vsOut.Position = vec4<f32>(inPos, 1.0);
    vsOut.color = inColor;
    // vsOut.color = params.tint_color.rgb;
    return vsOut;
}