<script lang="ts">
import glslangModule from "../../lib/glslang"
import vertShaderCode from './triangle.vert.wgsl?raw';
import fragShaderCode from './triangle.frag.wgsl?raw';
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
    console.log((navigator as any).gpu);
    let canvas = document.getElementById("App");
    const init = async function (useWGSL) {
      // 准备适配器
      const adapter = await navigator.gpu.requestAdapter();
      // console.log(adapter);
      const device = await adapter.requestDevice();
      // console.log(device);
      const glslang = await glslangModule();
      // console.log(glslang);

      const context = canvas.getContext("webgpu");
      console.log(context);

      const swapChainFormat = "bgra8unorm";

      const canvasConfig: GPUCanvasConfiguration = {
        device: device,
        format: 'bgra8unorm',
        usage:
          GPUTextureUsage.RENDER_ATTACHMENT |
          GPUTextureUsage.COPY_SRC,
        alphaMode: 'opaque'
      };
      context.configure(canvasConfig);



      const depthTextureDesc: GPUTextureDescriptor = {
        size: [canvas.width, canvas.height, 1],
        dimension: '2d',
        format: 'depth24plus-stencil8',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
      };

      var depthTexture = device.createTexture(depthTextureDesc);
      var depthTextureView = depthTexture.createView();







      // 🔺 Buffers
      const createBuffer = (
        arr: Float32Array | Uint16Array,
        usage: number
      ) => {
        // 📏 Align to 4 bytes (thanks @chrimsonite)
        let desc = {
          size: (arr.byteLength + 3) & ~3,
          usage,
          mappedAtCreation: true
        };
        let buffer = device.createBuffer(desc);
        const writeArray =
          arr instanceof Uint16Array
            ? new Uint16Array(buffer.getMappedRange())
            : new Float32Array(buffer.getMappedRange());
        writeArray.set(arr);
        buffer.unmap();
        return buffer;
      };

      var positionBuffer = createBuffer(positions, GPUBufferUsage.VERTEX);
      var colorBuffer = createBuffer(colors, GPUBufferUsage.VERTEX);
      var indexBuffer = createBuffer(indices, GPUBufferUsage.INDEX);

      // 🖍️ Shaders
      const vsmDesc = {
        code: vertShaderCode
      };
      console.log(vsmDesc);
      var vertModule = device.createShaderModule(vsmDesc);
      console.log(vertModule);

      const fsmDesc = {
        code: fragShaderCode
      };
      var fragModule = device.createShaderModule(fsmDesc);

      // ⚗️ Graphics Pipeline

      // 🔣 Input Assembly
      const positionAttribDesc: GPUVertexAttribute = {
        shaderLocation: 0, // [[location(0)]]
        offset: 0,
        format: 'float32x3'
      };
      const colorAttribDesc: GPUVertexAttribute = {
        shaderLocation: 1, // [[location(1)]]
        offset: 0,
        format: 'float32x3'
      };
      const positionBufferDesc: GPUVertexBufferLayout = {
        attributes: [positionAttribDesc],
        arrayStride: 4 * 3, // sizeof(float) * 3
        stepMode: 'vertex'
      };
      const colorBufferDesc: GPUVertexBufferLayout = {
        attributes: [colorAttribDesc],
        arrayStride: 4 * 3, // sizeof(float) * 3
        stepMode: 'vertex'
      };

      // 🌑 Depth
      const depthStencil: GPUDepthStencilState = {
        depthWriteEnabled: true,
        depthCompare: 'less',
        format: 'depth24plus-stencil8'
      };

      // 🦄 Uniform Data
      const pipelineLayoutDesc = { bindGroupLayouts: [] };
      const layout = device.createPipelineLayout(pipelineLayoutDesc);

      // 🎭 Shader Stages
      const vertex: GPUVertexState = {
        module: vertModule,
        entryPoint: 'main',
        buffers: [positionBufferDesc, colorBufferDesc]
      };

      // 🌀 Color/Blend State
      const colorState: GPUColorTargetState = {
        format: 'bgra8unorm'
      };

      const fragment: GPUFragmentState = {
        module: fragModule,
        entryPoint: 'main',
        targets: [colorState]
      };

      // 🟨 Rasterization
      const primitive: GPUPrimitiveState = {
        frontFace: 'cw',
        cullMode: 'none',
        topology: 'triangle-list'
      };

      const pipelineDesc: GPURenderPipelineDescriptor = {
        layout,

        vertex,
        fragment,

        primitive,
        depthStencil
      };
      var pipeline = device.createRenderPipeline(pipelineDesc);



      var render = () => {
        // ⏭ Acquire next image from context
        var colorTexture = context.getCurrentTexture();
        var colorTextureView = colorTexture.createView();

        // 📦 Write and submit commands to queue
        let colorAttachment: GPURenderPassColorAttachment = {
            view: colorTextureView,
            clearValue: { r: 0, g: 0, b: 0, a: 1 },
            loadOp: 'clear',
            storeOp: 'store'
        };

        const depthAttachment: GPURenderPassDepthStencilAttachment = {
            view: depthTextureView,
            depthClearValue: 1,
            depthLoadOp: 'clear',
            depthStoreOp: 'store',
            stencilClearValue: 0,
            stencilLoadOp: 'clear',
            stencilStoreOp: 'store'
        };

        const renderPassDesc: GPURenderPassDescriptor = {
            colorAttachments: [colorAttachment],
            depthStencilAttachment: depthAttachment
        };

        var commandEncoder = device.createCommandEncoder();

        // 🖌️ Encode drawing commands
        var passEncoder = commandEncoder.beginRenderPass(renderPassDesc);
        passEncoder.setPipeline(pipeline);
        passEncoder.setViewport(
            0,
            0,
            canvas.width,
            canvas.height,
            0,
            1
        );
        passEncoder.setScissorRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
        passEncoder.setVertexBuffer(0, positionBuffer);
        passEncoder.setVertexBuffer(1, colorBuffer);
        passEncoder.setIndexBuffer(indexBuffer, 'uint16');
        passEncoder.drawIndexed(3, 1);
        passEncoder.end();

        device.queue.submit([commandEncoder.finish()]);
        // encodeCommands();

        // ➿ Refresh canvas
        requestAnimationFrame(render);
      };

      render();


    }


    await init(true);
    console.log(2);
  }
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
