
export enum ShaderLanguageType {
    wgsl = 0,
    glsl = 1
}

interface ShaderOpt {
    type: ShaderLanguageType;
    shaderTxt: string;
    target: GPUColorTargetState[] | undefined;
    buffers?: Iterable<GPUVertexBufferLayout | null>;
    [key: string]: any;
}

export class Shader {
    type: ShaderLanguageType;
    shaderTxt: string;
    target: GPUColorTargetState[] | undefined;
    state: GPUFragmentState | GPUVertexState | undefined;
    buffers: Iterable<GPUVertexBufferLayout | null> | undefined;
    datas: any;
    constructor(options: ShaderOpt) {
        this.type = options.type;
        this.shaderTxt = options.shaderTxt;
        this.target = options.target;
        this.buffers = options.buffers;
        this.datas = options.datas;
    }
    createShaderModule(device: GPUDevice) {
        let module;
        const vsmDesc = {
            code: this.shaderTxt
        };
        switch(this.type) {
            case ShaderLanguageType.wgsl:
                module = device.createShaderModule(vsmDesc);
                break;
            case ShaderLanguageType.glsl:
                module = undefined;
                break;
        }
        if (!module) {
            return;
        }
        if (this.target) {
            const colorState: GPUColorTargetState = this.target[0];
            this.state = {
                module: module,
                entryPoint: 'main',
                targets: [colorState]
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