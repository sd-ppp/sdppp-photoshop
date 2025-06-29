// JavaScript
import { LiblibAI, LiblibAIError } from 'liblibai';
import { z } from 'zod';
import { WidgetableStringWidget, WidgetableWidget } from '../../schemas/schemas';
import { Task } from './_base/Task';
import { Client } from './_base/Client';
import { sdpppSDK } from '../../sdk/sdppp-ps-sdk';

sdpppSDK.plugins.fetchProxy.registerProxyDomains('.liblibai.cloud');
sdpppSDK.plugins.fetchProxy.registerProxyDomains('liblibai-');
sdpppSDK.plugins.fetchProxy.registerProxyDomains('liblib-');
sdpppSDK.plugins.fetchProxy.registerProxyDomains('liblib.');

const supportedModels = z.enum([
  'kontext-pro-text2img',
  'kontext-pro-img2img',
  'kontext-max-text2img',
  'kontext-max-img2img',
]); 
type SupportedModel = z.infer<typeof supportedModels>;
// Template UUIDs for different models
const TEMPLATE_UUIDS: Record<SupportedModel, string> = {
  'kontext-pro-text2img': 'fe9928fde1b4491c9b360dd24aa2b115',
  'kontext-pro-img2img': '1c0a9712b3d84e1b8a9f49514a46d88c',
  'kontext-max-text2img': 'fe9928fde1b4491c9b360dd24aa2b115',
  'kontext-max-img2img': '1c0a9712b3d84e1b8a9f49514a46d88c',
};
 
export const availableModels = Object.keys(TEMPLATE_UUIDS) as SupportedModel[]

export class SDPPPLiblib extends Client<{
  apiKey: string,
  apiSecret: string
}> {
  private readonly client: LiblibAI;
  constructor(config: { apiKey: string, apiSecret: string }) {
    super(config);
    this.client = new LiblibAI({
      apiKey: config.apiKey,
      apiSecret: config.apiSecret
    });
    // fix liblibai#2
    this.client.uploadFile = async function uploadFile(file, filename) {
        let blob;
        if (file instanceof Blob) {
            filename = filename || `blob_${Date.now()}`;
            blob = file;
        }
        else {
            throw new Error("Invalid file argument, must be a Blob, File or Buffer");
        }
        let signData: any;
        try {
          signData = await this.signFile(filename) as any;
        } catch (e) {
          throw new Error(`Failed to sign file: ${e}`);
        }
        const formData = new FormData();
        formData.append('x-oss-signature', signData.xOssSignature);
        formData.append('x-oss-date', signData.xOssDate);
        formData.append('x-oss-signature-version', signData.xOssSignatureVersion);
        formData.append('policy', signData.policy);
        formData.append('key', signData.key);
        formData.append('x-oss-credential', signData.xOssCredential);
        formData.append('x-oss-expires', signData.xOssExpires.toString());
        formData.append('file', blob, filename);
        const resp = await fetch(signData.postUrl, {
            method: 'POST',
            body: formData
        });
        if (!resp.ok) {
            throw new LiblibAIError('Failed to upload file', resp.status, await resp.text());
        }
        return new URL(signData.key, signData.postUrl).toString();
    }
    // end fix
  }

  async getWidgets(model: SupportedModel) {
    const widgets = await getWidgets(model);
    return {
      widgetableWidgets: widgets.widgetableWidgets,
      defaultInput: widgets.defaultInput,
      rawData: null
    };
  }

  async run(model: SupportedModel, input: any) {
    const templateUuid = TEMPLATE_UUIDS[model];

    if (!templateUuid) {
      throw new Error(`Unsupported model: ${model}`);
    }

    let response: any;
    if (model == 'kontext-max-img2img' || model == 'kontext-pro-img2img') {
      // POST  /api/generate/kontext/img2img
      response = await this.client.request('/api/generate/kontext/img2img', {
        method: 'POST',
        body: JSON.stringify({
          templateUuid,
          generateParams: {
            model: model === 'kontext-max-img2img' ? 'max' : 'pro',
            ...input
          }
        })
      })
    } else if (model == 'kontext-max-text2img' || model == 'kontext-pro-text2img') {
      response = await this.client.request('/api/generate/kontext/text2img', {
        method: 'POST',
        body: JSON.stringify({
          templateUuid,
          generateParams: {
            model: model === 'kontext-max-text2img' ? 'max' : 'pro',
            ...input
          }
        })
      }) as any;
      // {
      //   code: 0,
      //   data: { generateUuid: '2f81cdd82bcc4f1ba7bf1108b1d38212' },
      //   msg: ''
      // }
      // POST  /api/generate/kontext/text2img
    }
    if (response.code === 0) {
      return createTaskByGenerateUuid(this.client, response.data.generateUuid);

    } else {
      throw new Error(`HTTP error! message: ${response.code} ${response.msg}`);
    }
  }

  async uploadImage(image: ArrayBuffer, format: 'png' | 'jpg' | 'jpeg' | 'webp'): Promise<string> {
    try {
      const filename = `sdppp_${Math.random().toString(36).substring(2, 8)}_${Date.now()}.${format}`;
      const response = await this.client.uploadFile(new Blob([image], {
        type: `image/${format}`,
      }), filename)
      return response;
    } catch (e) {
      console.error('Error uploading image:', e);
      throw e;
    }
  }
}

// async function runGenerationTask(data: any, model: SupportedModel, timeout: number = 300): Promise<any> {
//   const startTime = Date.now();

//   try {
//     // Submit the generation task
//     console.log(`Submitting ${model} task...`);
//     const response = await fetch(API_ENDPOINTS.generate, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${process.env.LIBLIB_API_KEY}`,
//         'X-API-Secret': process.env.LIBLIB_API_SECRET || ''
//       },
//       body: JSON.stringify(data)
//     });

//     if (!response.ok) {
//       throw new Error(`HTTP error! status: ${response.status}`);
//     }

//     const progress = await response.json();

//     if (progress.code === 0) {
//       // Poll for task completion
//       while (true) {
//         const currentTime = Date.now();
//         if ((currentTime - startTime) > timeout * 1000) {
//           console.log(`${timeout}s task timeout, exiting polling.`);
//           return null;
//         }

//         const generateUuid = progress.data.generateUuid;
//         const statusData = { generateUuid };

//         const statusResponse = await fetch(API_ENDPOINTS.taskStatus, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             'Authorization': `Bearer ${process.env.LIBLIB_API_KEY}`,
//             'X-API-Secret': process.env.LIBLIB_API_SECRET || ''
//           },
//           body: JSON.stringify(statusData)
//         });

//         if (!statusResponse.ok) {
//           throw new Error(`HTTP error! status: ${statusResponse.status}`);
//         }

//         const statusProgress = await statusResponse.json();
//         console.log('Status response:', statusProgress);

//         if (statusProgress.data?.images && statusProgress.data.images.some((image: any) => image !== null)) {
//           console.log("Task completed, received image data.");
//           return statusProgress;
//         }

//         console.log("Task not yet completed, waiting 2 seconds...");
//         await new Promise(resolve => setTimeout(resolve, 2000));
//       }
//     } else {
//       return `Task failed, reason: code ${progress.msg}`;
//     }
//   } catch (error) {
//     console.error('Error in runGenerationTask:', error);
//     throw error;
//   }
// }


function createTaskByGenerateUuid(client: LiblibAI, generateUuid: string) {
  // 1 等待执行
  // 2 执行中
  // 3 已生图
  // 4 审核中
  // 5 成功
  // 6 失败
  // 7 超时

  return new Task(generateUuid, {
    statusGetter: async (id: string) => {
      const status = await client.getStatus(id);
      return {
        isCompleted: status.generateStatus === 5,
        progressMessage: status.generateMsg || '',
        progress: 0,
        rawData: status
      };
    },
    resultGetter: async (id: string, lastStatusResult: any) => {
      if (lastStatusResult.rawData.generateStatus === 5) {
        return lastStatusResult.rawData.images.map((image: any) => ({
          url: image.imageUrl,
          rawData: image
        }));
      } else {
        throw new Error(`Task failed, reason: code ${lastStatusResult.rawData.generateStatus}`);
      }
    },
    canceler: null
  });
}



function getWidgets(model: SupportedModel): {
  widgetableWidgets: WidgetableWidget[],
  defaultInput: Record<string, any>,
  rawData?: any
} {
  if (model === 'kontext-max-text2img' || model === 'kontext-pro-text2img') {
    return {
      widgetableWidgets: [
        {
          name: 'prompt',
          uiWeight: 12,
          outputType: 'string',
          options: {
            required: true
          }
        },
        {
          name: 'aspectRatio',
          uiWeight: 12,
          outputType: 'combo',
          options: {
            values: ['1:1', '3:4', '4:3', '16:9', '9:16'],
            required: true
          }
        },
        {
          name: 'guidance_scale',
          uiWeight: 12,
          outputType: 'number',
          options: {
            min: 1.0,
            max: 20.0,
            step: 0.1,
            required: true
          }
        },
        {
          name: 'imgCount',
          uiWeight: 12,
          outputType: 'number',
          options: {
            min: 1,
            max: 4,
            step: 1,
            required: true
          }
        }
      ],
      defaultInput: {
        prompt: '为现实主义电影摄影作品创作一张封面海报，具有艺术感染力，标题为"Liblib"。文字应用白笔书写。整体形象应具有电影海报的风格。不要使用黑白图像。',
        aspectRatio: '3:4',
        guidance_scale: 3.5,
        imgCount: 1
      },
    }
  }
  if (model === 'kontext-max-img2img' || model === 'kontext-pro-img2img') {
    return {
      widgetableWidgets: [
        {
          name: 'prompt',
          uiWeight: 12,
          outputType: 'string',
          options: {
            required: true
          }
        },
        {
          name: 'aspectRatio',
          uiWeight: 12,
          outputType: 'combo',
          options: {
            values: ['1:1', '3:4', '4:3', '16:9', '9:16'],
            required: true
          }
        },
        {
          name: 'guidance_scale',
          uiWeight: 12,
          outputType: 'number',
          options: {
            min: 1.0,
            max: 20.0,
            step: 0.1,
            required: true
          }
        },
        {
          name: 'imgCount',
          uiWeight: 12,
          outputType: 'number',
          options: {
            min: 1,
            max: 4,
            step: 1,
            required: true
          }
        },
        {
          name: 'image_list',
          uiWeight: 12,
          outputType: 'images',
          options: {
            required: true,
            maxCount: 4
          }
        }
      ],
      defaultInput: {
        prompt: '让女孩坐在第二张图的椅子上看书',
        aspectRatio: '3:4',
        guidance_scale: 3.5,
        imgCount: 1,
        image_list: []
      },
    }
  }

  throw new Error(`Unsupported model: ${model}`);
}