<script lang="ts">
import glslangModule from "../../lib/glslang"
import vertShaderCode from './triangle.vert.wgsl?raw';
import fragShaderCode from './triangle.frag.wgsl?raw';
import Render from "../../source/render/Render";
import { Buffer } from "../../source/core/Buffer";
import { Shader } from "../../source/core/Shader";
import { Attribute } from "../../source/core/Attribute";
import { Pipeline } from "../../source/render/Pipeline";
// 📈 Position Vertex Buffer Data
const positions = new Float32Array([
  1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0
]);
// 🎨 Color Vertex Buffer Data
const colors = new Float32Array([
  1.0,
  0.0,
  0.0, // 🔴
  0.0,
  1.0,
  0.0, // 🟢
  0.0,
  0.0,
  1.0 // 🔵
]);

const positions1 = new Float32Array([
  1.0, 1.0, 0.0, 1.0, -1.0, 0.0, -1, 0, 0.0
]);
// 🎨 Color Vertex Buffer Data
const colors1 = new Float32Array([
  1.0,
  1.0,
  0.0, // 🔴
  0.0,
  1.0,
  1.0, // 🟢
  1.0,
  0.0,
  1.0 // 🔵
]);

// 📇 Index Buffer Data
const indices = new Uint16Array([0, 1, 2]);
export default {
  name: "cesiumPage",
  data() {
    return {
      cameraInfo: {
        lon: 0,
        lat: 0,
        height: 0,
        heading: 0,
        pitch: 0
      },
      layerLevel: 0
    }
  },
  async mounted() {
    let render = new Render("App");
    await render.init();

    console.log(this);

    let pip = createPip(render, positions, colors, indices);
    let pip1 = createPip(render, positions1, colors1, indices);

    render.pipelineArr.push(pip1 as any);
    render.pipelineArr.push(pip as any);


    render.loop()
  },
}

function createPip(render, positions, colors, indices) {
    var positionBuffer = new Buffer(positions, GPUBufferUsage.VERTEX, 0);
    positionBuffer.createBuffer(render.device as any);
    var colorBuffer = new Buffer(colors, GPUBufferUsage.VERTEX, 1);
    colorBuffer.createBuffer(render.device as any);
    var indexBuffer = new Buffer(indices, GPUBufferUsage.INDEX);
    indexBuffer.createBuffer(render.device as any);

    let posatt = new Attribute({
      arr: [
        1.0, -1.0, 0.0, -1.0, -1.0, 0.0, 0.0, 1.0, 0.0
      ],
      format: "float32x3",
      stride: 12,
      location: 0,
      buffer: positionBuffer
    });
    let coloratt = new Attribute({
      arr: [
        1.0,
        0.0,
        0.0, // 🔴
        0.0,
        1.0,
        0.0, // 🟢
        0.0,
        0.0,
        1.0 // 🔵
      ],
      format: "float32x3",
      stride: 12,
      location: 1,
      buffer: colorBuffer
    });

    var vs = new Shader({
      type: 0,
      shaderTxt: vertShaderCode,
      target: undefined,
      buffers: [posatt.bufferDesc, coloratt.bufferDesc],
      datas: [posatt.arr, coloratt.arr]
    });
    vs.createShaderModule(render.device as any);

    const colorState: GPUColorTargetState = {
      format: 'bgra8unorm'
    };

    const fragment = new Shader({
      type: 0,
      shaderTxt: fragShaderCode,
      target: [colorState]
    });
    fragment.createShaderModule(render.device as any);

    const pipelineLayoutDesc = { bindGroupLayouts: [] };
    const layout = render.device?.createPipelineLayout(pipelineLayoutDesc);
    if (!layout) {
      return;
    }
    var pip = new Pipeline({
      attribute: [posatt, coloratt],
      fragment: fragment.state as GPUFragmentState,
      layout,
      shader: vs
    });

    (pip as any).indexBuffer = indexBuffer.buffer;
    pip.createPipeline(render.device as any);
    return pip;
  }

</script>

<template>
  <canvas id="App"></canvas>
</template>

<style scoped>
#App {
  width: 100%;
  height: 100%;
}
</style>
