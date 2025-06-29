import Replicate from "replicate";
import { getDefaultValues, WidgetableWidget } from '../../schemas/schemas';
import { Task } from "./_base/Task";
import { Client } from "./_base/Client";
import { sdpppSDK } from "../../sdk/sdppp-ps-sdk";

sdpppSDK.plugins.fetchProxy.registerProxyDomains('api.replicate.com');

const modelIds: Record<string, string> = {
}

export const availableModels = [
    'black-forest-labs/flux-kontext-dev',
    'black-forest-labs/flux-kontext-pro',
    'flux-kontext-apps/multi-image-kontext-pro',
    'black-forest-labs/flux-kontext-max',
    'flux-kontext-apps/multi-image-kontext-max',
    'black-forest-labs/flux-1.1-pro',
    'openai/gpt-image-1',
    'bytedance/seedream-3',
    'minimax/image-01',
    'google/imagen-4',
    'stability-ai/stable-diffusion',
    'stability-ai/stable-diffusion-inpainting',
    'stability-ai/sdxl',
]

export class SDPPPReplicate extends Client<{
    apiKey: string
}> {
    private replicate: Replicate;

    constructor(config: { apiKey: string }) {
        super(config);
        this.replicate = new Replicate({
            auth: config.apiKey
        })
    }

    async getWidgets(model: string): Promise<{
        widgetableWidgets: WidgetableWidget[],
        defaultInput: Record<string, any>,
        rawData: any
    }> {
        const [modelProvider, modelId] = model.split('/');
        const modelInfo = await this.replicate.models.get(modelProvider, modelId)
        if (!modelInfo.latest_version) {
            throw new Error('No latest version found')
        }
        modelIds[model] = modelInfo.latest_version.id;
        const widgetableWidgets = convertInputSchemaToWidgetableWidgets(modelInfo.latest_version.openapi_schema['components']?.schemas);
        const defaultInput = modelInfo.default_example?.input ?? {};
        widgetableWidgets.forEach((widget) => {
            if (!(widget.name in defaultInput)) {
                defaultInput[widget.name] = getDefaultValues(widget.outputType, widget.options)
            }
        })
        return {
            widgetableWidgets,
            defaultInput,
            rawData: modelInfo
        }
    }
    async run(model: string, input: any) {
        const id = modelIds[model];
        if (!id) {
            await this.getWidgets(model);
        }
        const [modelProvider, modelId] = model.split('/');
        const result = await this.replicate.predictions.create({
            model: `${modelProvider}/${modelId}`,
            version: id,
            input
        })
        return new Task(result.id, {
            statusGetter: async (id) => {
                const r = await this.replicate.predictions.get(id)
                if (r.status === 'failed') {
                    throw new Error(r.error)
                }
                return {
                    isCompleted: r.status === 'succeeded',
                    progress: 0,
                    progressMessage: r.status,
                    rawData: r
                }
            },
            resultGetter: async (id, lastStatusResult) => {
                return (lastStatusResult.rawData.output instanceof Array ? lastStatusResult.rawData.output : [lastStatusResult.rawData.output]).map((item: any) => {
                    return {
                        url: item
                    }
                })
            },
            canceler: async (id: string) => {
                await this.replicate.predictions.cancel(id)
            }
        })
    }
    async uploadImage(image: ArrayBuffer, format: 'png' | 'jpg' | 'jpeg' | 'webp'): Promise<string> {
        const base64 = Buffer.from(image).toString('base64');
        const dataUrl = `data:image/${format};base64,${base64}`;
        return dataUrl;
    }
}

function convertInputSchemaToWidgetableWidgets(schemas: any): WidgetableWidget[] {
    return Object.entries(schemas.Input.properties as Record<string, any>)
        .sort((a, b) => a[1]['x-order'] - b[1]['x-order'])
        .map(([name, prop]: [string, any]) => {
            let outputType: any = prop.type;
            let options: any = undefined;

            // combo 类型（enum/oneOf/allOf）
            if (prop.enum || prop.oneOf || prop.allOf) {
                outputType = 'combo';
                if (prop.allOf[0].$ref) {
                    const refSchema = schemas[prop.allOf[0].$ref.split('/').pop()];
                    options = {
                        values: refSchema.enum,
                        description: refSchema.description
                    }
                } else {
                    options = {
                        values: prop.enum || (prop.oneOf ? prop.oneOf.map((o: any) => o.const ?? o) : prop.allOf)
                    };
                }
            }
            // number/integer 类型
            else if (prop.type === 'integer' || prop.type === 'number') {
                outputType = 'number';
                options = {
                    max: prop.maximum ?? undefined,
                    min: prop.minimum ?? undefined,
                    step: prop.type === 'integer' ? 1 : 0.01
                };
            } else if (prop.type === 'string' || prop.type === 'password') {
                if (prop.format === 'uri') {
                    outputType = 'images';
                } else {
                    outputType = 'string';
                }
            } else if (prop.type === 'array') {
                if (prop.items.type === 'string' && prop.items.format === 'uri') {
                    outputType = 'images';
                }
            }

            options = {
                ...options,
                required: schemas.Input.required && schemas.Input.required.indexOf(name) !== -1,
            }

            return {
                name,
                uiWeight: 12,
                outputType,
                options
            };
        });
}


// Input Schema example
// {
//     type: 'object',
//     title: 'Input',
//     properties: {
//       seed: {
//         type: 'integer',
//         title: 'Seed',
//         'x-order': 8,
//         description: 'Random seed. Leave blank to randomize the seed'
//       },
//       width: {
//         allOf: [Array],
//         default: 768,
//         'x-order': 2,
//         description: 'Width of generated image in pixels. Needs to be a multiple of 64'
//       },
//       height: {
//         allOf: [Array],
//         default: 768,
//         'x-order': 1,
//         description: 'Height of generated image in pixels. Needs to be a multiple of 64'
//       },
//       prompt: {
//         type: 'string',
//         title: 'Prompt',
//         default: 'a vision of paradise. unreal engine',
//         'x-order': 0,
//         description: 'Input prompt'
//       },
//       scheduler: {
//         allOf: [Array],
//         default: 'DPMSolverMultistep',
//         'x-order': 7,
//         description: 'Choose a scheduler.'
//       },
//       num_outputs: {
//         type: 'integer',
//         title: 'Num Outputs',
//         default: 1,
//         maximum: 4,
//         minimum: 1,
//         'x-order': 4,
//         description: 'Number of images to generate.'
//       },
//       guidance_scale: {
//         type: 'number',
//         title: 'Guidance Scale',
//         default: 7.5,
//         maximum: 20,
//         minimum: 1,
//         'x-order': 6,
//         description: 'Scale for classifier-free guidance'
//       },
//       negative_prompt: {
//         type: 'string',
//         title: 'Negative Prompt',
//         'x-order': 3,
//         description: 'Specify things to not see in the output'
//       },
//       num_inference_steps: {
//         type: 'integer',
//         title: 'Num Inference Steps',
//         default: 50,
//         maximum: 500,
//         minimum: 1,
//         'x-order': 5,
//         description: 'Number of denoising steps'
//       }
//     }
//   }