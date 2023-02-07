
export enum ShaderLanguageType {
    wgsl = 0,
    glsl = 1
}

interface ShaderOpt {
    type: ShaderLanguageType;
    shaderTxt: string;
    target: Iterable<GPUColorTargetState | null> | undefined;
    buffers: Iterable<GPUVertexBufferLayout | null>;
}

export class Shader {
    type: ShaderLanguageType;
    shaderTxt: string;
    target: Iterable<GPUColorTargetState | null> | undefined;
    state: GPUFragmentState | GPUVertexState | undefined;
    buffers: Iterable<GPUVertexBufferLayout | null>;
    constructor(options: ShaderOpt) {
        this.type = options.type;
        this.shaderTxt = options.shaderTxt;
        this.target = options.target;
        this.buffers = options.buffers;
    }
    createShaderModule(device: GPUDevice) {
        let module;
        const vsmDesc = {
            code: this.shaderTxt
        };
        switch(this.type) {
            case ShaderLanguageType.wgsl:
                module = device.createShaderModule(vsmDesc);
            case ShaderLanguageType.glsl:
                module = undefined;
        }
        if (!module) {
            return;
        }
        if (this.target) {
            const colorState: GPUColorTargetState = {
                format: 'bgra8unorm'
            };
        } else {
            this.state = {
                module: module,
                entryPoint: 'main',
                buffers: this.buffers
            };
        }
    }
}