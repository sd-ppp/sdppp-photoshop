import { writeFile, mkdir, readFile } from 'fs/promises';
import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { SDPPPLiblib } from '../liblib';

// 下载图片的辅助函数
async function downloadImage(url: string, filePath: string): Promise<void> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const buffer = await response.arrayBuffer();
        await writeFile(filePath, Buffer.from(buffer));
    } catch (error) {
        console.error(`Failed to download image from ${url}:`, error);
        throw error;
    }
}

describe('liblib', () => {
    const testCases: { model: 'kontext-max-text2img' | 'kontext-pro-text2img' | 'kontext-max-img2img' | 'kontext-pro-img2img' }[] = [
        { model: 'kontext-max-text2img' },
        { model: 'kontext-pro-text2img' },
        { model: 'kontext-max-img2img' },
        { model: 'kontext-pro-img2img' }
    ];
    const client = new SDPPPLiblib({
        apiKey: process.env.LIBLIB_API_KEY || '',
        apiSecret: process.env.LIBLIB_API_SECRET || ''
    });

    testCases.forEach(({ model }) => {
        it(`should fetch widgetableWidgets for ${model}`, async () => {
            const result = await client.getWidgets(model);
            expect(result).toHaveProperty('widgetableWidgets');
            expect(result).toHaveProperty('defaultInput');
            expect(Array.isArray(result.widgetableWidgets)).toBe(true);
            expect(result.widgetableWidgets.length).toBeGreaterThan(0);
            
            result.widgetableWidgets.forEach((widget: any) => {
                expect(widget).toHaveProperty('name');
                expect(typeof widget.name).toBe('string');
                expect(widget).toHaveProperty('uiWeight');
                expect(typeof widget.uiWeight).toBe('number');
                expect(widget).toHaveProperty('outputType');
                expect(['string', 'number', 'boolean', 'images', 'combo', 'mask'].includes(widget.outputType)).toBe(true);
                if (widget.options) {
                    expect(typeof widget.options).toBe('object');
                }
            });

            // 针对不同模型做更细致的结构校验
            if (model === 'kontext-max-text2img' || model === 'kontext-pro-text2img') {
                const names = result.widgetableWidgets.map((w: any) => w.name);
                expect(names).toContain('prompt');
                expect(names).toContain('aspectRatio');
                expect(names).toContain('guidance_scale');
                expect(names).toContain('imgCount');
                
                // 检查 defaultInput
                expect(result.defaultInput).toHaveProperty('prompt');
                expect(result.defaultInput).toHaveProperty('aspectRatio');
                expect(result.defaultInput).toHaveProperty('guidance_scale');
                expect(result.defaultInput).toHaveProperty('imgCount');
            }

            if (model === 'kontext-max-img2img' || model === 'kontext-pro-img2img') {
                const names = result.widgetableWidgets.map((w: any) => w.name);
                expect(names).toContain('prompt');
                expect(names).toContain('aspectRatio');
                expect(names).toContain('guidance_scale');
                expect(names).toContain('imgCount');
                expect(names).toContain('image_list');
                
                // 检查 defaultInput
                expect(result.defaultInput).toHaveProperty('prompt');
                expect(result.defaultInput).toHaveProperty('aspectRatio');
                expect(result.defaultInput).toHaveProperty('guidance_scale');
                expect(result.defaultInput).toHaveProperty('imgCount');
                expect(result.defaultInput).toHaveProperty('image_list');
                expect(Array.isArray(result.defaultInput.image_list)).toBe(true);
            }
        });
    });

    it('should run kontext model', async () => {
        const buffer = await readFile(join(import.meta.dirname, `testoutput/liblib.text2img.test.0.png`))
        const imageUrl = await client.uploadImage(buffer, 'png')
        console.log(imageUrl)
        // // 确保testoutput目录存在
        // const testOutputDir = join(import.meta.dirname, 'testoutput');
        // await mkdir(testOutputDir, { recursive: true });

        // const { defaultInput: defaultInputTxt2Img } = await client.getWidgets('kontext-pro-text2img');
        // const taskTxt2Img = await client.run('kontext-pro-text2img', defaultInputTxt2Img);

        // // 检查任务对象
        // expect(taskTxt2Img).toBeDefined();
        // expect(taskTxt2Img).toHaveProperty('taskId');
        // expect(taskTxt2Img).toHaveProperty('promise');
        // expect(typeof taskTxt2Img.taskId).toBe('string');
        // expect(taskTxt2Img.promise).toBeInstanceOf(Promise);

        // // 等待任务完成并获取结果
        // const output = await taskTxt2Img.promise as Array<{ url: string; rawData: any }>;
        
        // // 验证输出
        // expect(output).toBeDefined();
        // expect(Array.isArray(output)).toBe(true);
        // expect(output.length).toBeGreaterThan(0);

        // // 检查每个输出项的格式并下载图片
        // for (let index = 0; index < output.length; index++) {
        //     const item = output[index];
        //     expect(item).toHaveProperty('url');
        //     expect(item).toHaveProperty('rawData');
        //     expect(typeof item.url).toBe('string');
        //     expect(item.url).toMatch(/^https?:\/\//); // 应该是有效的URL
            
        //     // 下载图片到testoutput目录
        //     const imageUrl = item.url;
        //     const fileName = `liblib.text2img.test.${index}.png`;
        //     const filePath = join(testOutputDir, fileName);
            
        //     try {
        //         await downloadImage(imageUrl, filePath);
        //         console.log(`Successfully downloaded image to: ${filePath}`);
        //     } catch (error) {
        //         console.error(`Failed to download image ${index}:`, error);
        //         // 如果下载失败，至少保存URL到文件
        //         const urlFileName = `liblib.text2img.test.${index}.url.txt`;
        //         const urlFilePath = join(testOutputDir, urlFileName);
        //         await writeFile(urlFilePath, imageUrl).catch(console.error);
        //     }
        // }


        // const { defaultInput: defaultInputImg2Img } = await client.getWidgets('kontext-pro-img2img');
        // const buffer = await readFile(join(import.meta.dirname, `testoutput/liblib.text2img.test.0.png`))
        // const imageUrl = await client.uploadImage(buffer, 'png')
        // defaultInputImg2Img.image_list = [imageUrl] as any;
        // defaultInputImg2Img.prompt = '改为水墨画风格';

        // const taskImg2Img = await client.run('kontext-pro-img2img', defaultInputImg2Img);
        // const outputImg2Img = await taskImg2Img.promise as Array<{ url: string; rawData: any }>;
        // for (let index = 0; index < outputImg2Img.length; index++) {
        //     const item = outputImg2Img[index];
        //     expect(item).toHaveProperty('url');
        //     expect(item).toHaveProperty('rawData');
        //     expect(typeof item.url).toBe('string');
        //     expect(item.url).toMatch(/^https?:\/\//);
        //     const fileName = `liblib.img2img.test.${index}.png`;
        //     const filePath = join(testOutputDir, fileName);
        //     await downloadImage(item.url, filePath);
        // }
    });

    it('should throw error for unsupported model', async () => {
        await expect(client.getWidgets('unsupported-model' as any)).rejects.toThrow('Unsupported model: unsupported-model');
    });
});
