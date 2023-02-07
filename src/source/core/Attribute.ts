interface AttributeOpt {
    arr: number[];
    format: GPUVertexFormat;
    stride: GPUSize64;
    location?: GPUIndex32;
    offset?: GPUSize64;
    stepMode?: GPUVertexStepMode;
}

const DefaultAttribute = {
    location: 0,
    offset: 0,
    stepMode: 'vertex'
}

export class Attribute {
    location: GPUIndex32 | undefined = 0;
    offset: GPUSize64 | undefined = 0;
    format: GPUVertexFormat = 'float32x3';
    arr: number[] = [];
    stride: GPUSize64 | undefined = 12;
    stepMode: GPUVertexStepMode | undefined;
    bufferDesc: GPUVertexBufferLayout = {
        arrayStride: 0,
        attributes: []
    };
    constructor (options: AttributeOpt) {
        if (!options.arr || !options.arr.length) {
            return;
        }
        let opt = {...DefaultAttribute, ...options};
        this.arr = opt.arr;
        this.location = opt.location;
        this.stride = opt.location;
        this.offset = opt.offset;
        this.format = opt.format;
        this.stepMode = opt.stepMode as GPUVertexStepMode;

        let AttribDesc: GPUVertexAttribute = {
            shaderLocation: this.location,
            offset: this.offset,
            format: this.format
        }
        this.bufferDesc = {
            attributes: [AttribDesc],
            arrayStride: this.stride, // sizeof(float) * 3
            stepMode: this.stepMode
        }
    }
}