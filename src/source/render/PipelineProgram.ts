
interface IAttributeBuffersOpt {
    positionBuffer: GPUBuffer;
    [key: string]: GPUBuffer;
}

interface IPipelineProgramOpt {
    attributeBuffers: IAttributeBuffersOpt;
    indexBuffer: GPUBuffer;
}

export class PipelineProgram {
    pipeline: GPURenderPipeline | undefined;
    attributeBuffers: IAttributeBuffersOpt;
    indexBuffer: GPUBuffer;
    constructor (options: IPipelineProgramOpt) {
        this.attributeBuffers = options.attributeBuffers;
        this.indexBuffer = options.indexBuffer;
    }
}