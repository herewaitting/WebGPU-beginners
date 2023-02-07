import { Buffer } from "../core/Buffer"
import { Attribute } from "../core/Attribute"

interface IAttributeBuffersOpt {
    positionBuffer: Buffer;
    [key: string]: Buffer;
}

interface IPipelineProgramOpt {
    attributeBuffers: IAttributeBuffersOpt;
    indexBuffer: Buffer;
}

export class PipelineProgram {
    pipeline: GPURenderPipeline | undefined;
    attributeBuffers: IAttributeBuffersOpt;
    indexBuffer: Buffer;
    constructor (options: IPipelineProgramOpt) {
        this.attributeBuffers = options.attributeBuffers;
        this.indexBuffer = options.indexBuffer;
    }
}