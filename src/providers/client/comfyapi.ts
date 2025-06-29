export interface ComfyAPIRequest {
  url: string;
  basePrompt: string;
  nodeValues: Record<number, Record<number, any>>; // nodeid => { widgetIndex => value }
}

/**
 * comfyAPI的请求规则是：
 * 1. 先发送queue请求，返回executionID。任务会异步执行。
 * 2. 发送get请求，获取任务状态。
 * 3. 如果请求包含图片，需要先调用upload接口，返回imagePath。
 */

export function request(request: ComfyAPIRequest) {
    const { url, basePrompt, nodeValues } = request;

    const prompt = basePrompt;

    const body = {
      prompt,
    }
}


export function uploadImage(image: string) {

}


 

// public static async prompt(comfyui: ComfyServer, payload: ComfyPrompt) {
//   return await postJSON(comfyui.getBaseUrl() + "/prompt", payload);
// }
// public static async queue(comfyui: ComfyServer) {
//   return await get(comfyui.getBaseUrl() + "/queue");
// }
// public static async history(comfyui: ComfyServer) {
//   return await get(comfyui.getBaseUrl() + "/history");
// }
// public static async view(comfyui: ComfyServer, filename: string): Promise<string> {
//   const ab: ArrayBuffer = await get(comfyui.getBaseUrl() + '/view?subfolder=&type=output&filename=' + filename);
//   return Buffer.from(ab).toString('base64');
// }
// public static async progress(comfyui: ComfyServer, param: { skip_current_image: boolean } = { skip_current_image: true }) {
//   return { progress: 0 };
//   // return await comfyui.get("/sdapi/v1/progress" + (param.skip_current_image ? `?skip_current_image=1` : '?skip_current_image=0'))

// }

// public static async interrupt(comfyui: ComfyServer) {
//   return await postJSON(comfyui.getBaseUrl() + "/interrupt", {})

// }
// // public static async extraBatchImages(comfyui: ComfyServer, param: ExtraParam) {
// //     return await comfyui.post("/sdapi/v1/extra-batch-images", param)

// // }
// public static async objectInfo(comfyui: ComfyServer): Promise<string[]> {
//   return await get(comfyui.getBaseUrl() + "/object_info")
// }
// public static async uploadImage(comfyui: ComfyServer, imgBase64: string): Promise<any> {
//   return await postForm(comfyui.getBaseUrl() + '/upload/image', {
//       image: new Blob([Buffer.from(imgBase64, 'base64')])
//   })
// }

// public static async headBaseURL(comfyui: ComfyServer): Promise<number> {
//   return await head(comfyui.getBaseUrl())
// }