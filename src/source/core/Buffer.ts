
export class Buffer {
    arr: Float32Array | Uint16Array;
    usage: number;
    buffer: GPUBuffer | undefined;
    location: GPUIndex32;
    constructor(arr: Float32Array | Uint16Array, usage: number, location: GPUIndex32 = 0){
        this.arr = arr;
        this.usage = usage;
        this.location = location;
    }
    createBuffer(device: GPUDevice) {
        let desc = {
            size: (this.arr.byteLength + 3) & ~3,
            usage: this.usage,
            mappedAtCreation: true
        } as any;
        let buffer = device.createBuffer(desc);
        const writeArray =
            this.arr instanceof Uint16Array
                ? new Uint16Array(buffer.getMappedRange())
                : new Float32Array(buffer.getMappedRange());
        writeArray.set(this.arr);
        buffer.unmap();
        this.buffer = buffer;
    }
}


