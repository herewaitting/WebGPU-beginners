const DefaultPrimitive: GPUPrimitiveState = {
    frontFace: 'cw',
    cullMode: 'none',
    topology: 'triangle-list'
};

const DefaultDepthStencil: GPUDepthStencilState = {
    depthWriteEnabled: true,
    depthCompare: 'less',
    format: 'depth24plus-stencil8'
};

export class Pipeline {
    pipelineOpt: GPURenderPipelineDescriptor;
    pipeline: GPURenderPipeline | undefined;
    constructor (options: GPURenderPipelineDescriptor) {
        this.pipelineOpt = options;
    }
    createPipeline(device: GPUDevice) {
        let opt = {...{
            primitive: DefaultPrimitive,
            depthStencil: DefaultDepthStencil
        }, ...this.pipelineOpt}
        this.pipeline = device.createRenderPipeline(opt);
    }
}