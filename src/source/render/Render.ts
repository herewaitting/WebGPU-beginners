/// <reference types="@webgpu/types" />


import glslangModule from "../../lib/glslang"
import { Pipeline } from "./Pipeline";
import { PipelineProgram } from "./PipelineProgram";
import { async2sync } from "../core/async2sync";
window.async2sync = async2sync;
interface RenderOpt {

}

class Render {
    public autoRender: boolean = true;
    adapter: GPUAdapter | null | undefined;
    device: GPUDevice | null | undefined;
    glslang: any;
    context: GPUCanvasContext | null | undefined;
    depth: any;
    canvas: HTMLCanvasElement;
    layout: GPUPipelineLayout | null | undefined;
    primitive: GPUPrimitiveState | undefined;
    pipelineArr: PipelineProgram[] = [];
    constructor(id: string, options?: RenderOpt) {
        if (!navigator || !navigator.gpu) {
            throw Error("初始化环境错误！");
        }
        let dom = document.getElementById(id) as HTMLCanvasElement;
        if (!dom) {
            throw Error("缺少容器！");
        }
        this.canvas = dom;
        this.depth = {};
    }
    async init() {
        // 准备适配器
        this.adapter = await navigator.gpu.requestAdapter();
        // this.adapter = async2sync(navigator.gpu.requestAdapter) as any;
        this.device = await this.adapter?.requestDevice();
        if (!this.device) {
            throw Error("获取硬件失败");
        }
        this.glslang = await glslangModule();
        this.context = this.canvas.getContext("webgpu");
        if (!this.context) {
            throw Error("获取webgpu上下文失败");
        }

        const canvasConfig: GPUCanvasConfiguration = {
            device: this.device,
            format: 'bgra8unorm',
            usage:
                GPUTextureUsage.RENDER_ATTACHMENT |
                GPUTextureUsage.COPY_SRC,
            alphaMode: 'opaque'
        };
        this.context.configure(canvasConfig);

        const depthTextureDesc: GPUTextureDescriptor = {
            size: [this.canvas.width, this.canvas.height, 1],
            dimension: '2d',
            format: 'depth24plus-stencil8',
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC
        };

        this.depth.depthTexture = this.device.createTexture(depthTextureDesc);
        this.depth.depthTextureView = this.depth.depthTexture.createView();

        // 🌑 Depth
        this.depth.depthStencil = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth24plus-stencil8'
        };

        // 🦄 Uniform Data
        const pipelineLayoutDesc = { bindGroupLayouts: [] };
        this.layout = this.device.createPipelineLayout(pipelineLayoutDesc);

        this.primitive = {
            frontFace: 'cw',
            cullMode: 'none',
            topology: 'triangle-list'
        };
    }
    loop() {
        let context = this.context;
        let device = this.device;
        let canvas = this.canvas;
        if (!context || !device) {
            requestAnimationFrame(this.loop.bind(this));
            return;
        }
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
            view: this.depth.depthTextureView,
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

        // 目前认知理解这里对同一渲染目标（fbo或者屏幕）只需创建一次
        var passEncoder = commandEncoder.beginRenderPass(renderPassDesc);

        // 设置窗口绘制起始像素点与宽高
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

        // 🖌️ Encode drawing commands 便利渲染pipeline队列
        for (let program of this.pipelineArr) {
            let pipeline = program.pipeline;
            if (!pipeline) {
                continue;
            }
            passEncoder.setPipeline(pipeline);
            for (let data of (program as any).attribute) {
                passEncoder.setVertexBuffer(data.location, data.buffer.buffer);
            }
            passEncoder.setIndexBuffer(program.indexBuffer as any, 'uint16');
            passEncoder.drawIndexed(3, 1);
        }
        passEncoder.end();
        
        // 把渲染队列提交给硬件
        device.queue.submit([commandEncoder.finish()]);

        requestAnimationFrame(this.loop.bind(this));
    }
}

export default Render;
