import { Attribute } from "../core/Attribute";
import defaultValue from "../core/defaultValue";
import { Shader } from "../core/Shader";

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

const DefaultMs = {
    count: 1,
    /**
     * Mask determining which samples are written to.
     */
    mask: 0,
    /**
     * When `true` indicates that a fragment's alpha channel should be used to generate a sample
     * coverage mask.
     */
    alphaToCoverageEnabled: false,
}

interface IPipelingOpt {
    attribute: Attribute[];
    layout: GPUPipelineLayout;
    shader: Shader;
    /**
     * Describes the primitive-related properties of the pipeline.
     */
    primitive?: GPUPrimitiveState;
    /**
     * Describes the optional depth-stencil properties, including the testing, operations, and bias.
     */
    depthStencil?: GPUDepthStencilState;
    /**
     * Describes the multi-sampling properties of the pipeline.
     */
    multisample?: GPUMultisampleState;
    /**
     * Describes the fragment shader entry point of the pipeline and its output colors. If
     * `undefined`, the [[#no-color-output]] mode is enabled.
     */
    fragment?: GPUFragmentState;
}

export class Pipeline {
    pipeline: GPURenderPipeline | undefined;
    attribute: Attribute[];
    primitive: GPUPrimitiveState;
    depthStencil: GPUDepthStencilState;
    fragment: GPUFragmentState;
    multisample: GPUMultisampleState;
    layout: GPUPipelineLayout;
    shader: Shader;
    constructor(options: IPipelingOpt) {
        this.attribute = options.attribute;
        this.primitive = defaultValue(options.primitive, DefaultPrimitive);
        this.depthStencil = defaultValue(options.depthStencil, DefaultDepthStencil);
        this.fragment = defaultValue(options.fragment, undefined);
        this.multisample = defaultValue(options.multisample, undefined);
        this.layout = defaultValue(options.layout, undefined);
        this.shader = defaultValue(options.shader, undefined);
    }
    createPipeline(device: GPUDevice) {
        let attArr = [];
        for (let att of this.attribute) {
            attArr.push(att.bufferDesc);
        }
        let vertex = {
            module: this.shader.state?.module,
            entryPoint: 'main',
            buffers: attArr
        }
        let pipelineOpt = {
            layout: this.layout,
            vertex,
            fragment: this.fragment,
            primitive: this.primitive,
            depthStencil: this.depthStencil
        }
        this.pipeline = device.createRenderPipeline(pipelineOpt as GPURenderPipelineDescriptor);
    }
}