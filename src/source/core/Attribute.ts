import { Buffer } from "./Buffer";
import defaultValue from "./defaultValue";

interface AttributeOpt {
    arr: number[];
    buffer: Buffer;
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
    location: GPUIndex32;
    offset: GPUSize64;
    format: GPUVertexFormat = 'float32x3';
    arr: number[] = [];
    typeArr: ArrayBuffer;
    stride: GPUSize64;
    stepMode: GPUVertexStepMode | undefined;
    bufferDesc: GPUVertexBufferLayout = {
        arrayStride: 0,
        attributes: []
    };
    buffer: Buffer;
    constructor (options: AttributeOpt) {
        let opt = {...DefaultAttribute, ...options};
        this.arr = opt.arr;
        this.location = defaultValue(options.location, 0);
        this.stride = opt.stride;
        this.offset = defaultValue(options.offset, 0);
        this.format = opt.format;
        this.stepMode = opt.stepMode as GPUVertexStepMode;

        this.typeArr = new Float32Array(this.arr);
        this.buffer = defaultValue(options.buffer, undefined);

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