import { constants, imaging } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import type { imaging as imagingType } from "photoshop/dom/ImagingModule";
import type { Layer } from "photoshop/dom/Layer";
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
import { SDPPPBounds, SpeicialIDManager, getLayerID, getRasterizedLayer, parseDocumentIdentify, unTrimImageData } from '../../util.mjs';
import { Jimp, JimpInstance, JimpMime } from "jimp";
import type { Bounds } from "photoshop/dom/objects/Bounds";
import type { getImageActions, PixelsAndSize } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

function applyLayerDataWithTransparent(pixelData: Uint8Array, maskData: Uint8Array | null): Uint8Array {
    for (let i = 0, length = pixelData.length / 4; i < length; i++) {
        const maskPixel = maskData ? maskData[i] / 255 : 1;
        pixelData[4 * i + 3] = maskPixel * pixelData[4 * i + 3];

        if (!pixelData[4 * i + 3]) {
            pixelData[4 * i] = pixelData[4 * i + 1] = pixelData[4 * i + 2] = 0;
        }
    }
    return pixelData;
}

function fixAlphaChannel(pixelDataWithSize: PixelsAndSize<Uint8Array>): PixelsAndSize<Uint8Array> {
    if (pixelDataWithSize.dataFromAPI.length != pixelDataWithSize.width * pixelDataWithSize.height * 3) {
        throw new Error(i18n('unsupported channel counts: {0}', pixelDataWithSize.dataFromAPI.length / (pixelDataWithSize.width * pixelDataWithSize.height)));
    }
    const uint8Data = new Uint8Array(pixelDataWithSize.width * pixelDataWithSize.height * 4);

    for (let i = 0; i < pixelDataWithSize.width * pixelDataWithSize.height; i++) {
        uint8Data[i * 4] = pixelDataWithSize.dataFromAPI[i * 3];
        uint8Data[i * 4 + 1] = pixelDataWithSize.dataFromAPI[i * 3 + 1];
        uint8Data[i * 4 + 2] = pixelDataWithSize.dataFromAPI[i * 3 + 2];
        uint8Data[i * 4 + 3] = 255;
    }

    return {
        dataFromAPI: uint8Data,
        width: pixelDataWithSize.width,
        height: pixelDataWithSize.height
    }
}

export function alignPixelBit(pixelAndSize: PixelsAndSize<Uint8Array | Uint16Array | Float32Array>): PixelsAndSize<Uint8Array> {
    if (pixelAndSize.dataFromAPI instanceof Uint8Array) {
        return pixelAndSize as PixelsAndSize<Uint8Array>;
    }
    const { dataFromAPI, width, height } = pixelAndSize;
    const uint8Data = new Uint8Array(dataFromAPI.length);
    for (let i = 0; i < dataFromAPI.length; i++) {
        if (dataFromAPI instanceof Uint16Array) {
            if (dataFromAPI[i] == 32768) {
                uint8Data[i] = 255;
            } else {
                uint8Data[i] = Math.floor((dataFromAPI[i]) / 128);
            }

        } else {
            // For Float32Array, it's HDR color, doesn't know how to convert yet.
            throw new Error('32-bit color not supported');
        }
    }
    return {
        dataFromAPI: uint8Data,
        width,
        height
    };
}

// ps returns trimmed data so need padding
export function padAndTrimToDesireBounds(
    pixelDataAndSize: PixelsAndSize<Uint8Array>,
    originBound: Bounds,
    desireBounds: any,
    components: number = 4
): Uint8Array {

    if (
        pixelDataAndSize.width == desireBounds.width &&
        pixelDataAndSize.height == desireBounds.height &&
        pixelDataAndSize.dataFromAPI.length == desireBounds.width * desireBounds.height * components
    )
        return pixelDataAndSize.dataFromAPI;
    let resPixelData = new Uint8Array(desireBounds.width * desireBounds.height * components);
    unTrimImageData(
        pixelDataAndSize.dataFromAPI,
        resPixelData,
        originBound,
        desireBounds,
        components
    )
    return resPixelData;
}

async function getPixelsData(document: Document, layer: Layer | null, bounds: any) {
    let options: any = {
        documentID: document.id,
        applyAlpha: false,
        hasAlpha: true,
        sourceBounds: bounds,
        // componentSize: 8, // Error Code -1 above PS 25.5 if psd in 16bit
        colorSpace: "RGB",
    }
    if (document.mode !== constants.DocumentMode.RGB) {
        Object.assign(options, { colorProfile: 'sRGB IEC61966-2.1' });
    }
    if (layer) options.layerID = layer.id
    let pixels = await imaging.getPixels(options)
    let imageData = pixels.imageData
    const dataFromAPI = await imageData.getData({})
    Promise.resolve().then(() => { imageData.dispose() })
    return {
        dataFromAPI,
        width: imageData.width,
        height: imageData.height,
    }
}
async function getMaskData(document: Document, layer: Layer | null, bounds: any) {
    if (!layer) return null;
    let options = {
        documentID: document.id,
        sourceBounds: bounds,
        layerID: layer.id
    }
    let mask: imagingType.GetLayerMaskResult | null = null;
    try {
        mask = await imaging.getLayerMask(options)
    } catch (e) { console.warn(e); return null; }
    let imageData = mask.imageData
    if (!imageData) return null;
    const dataFromAPI = await imageData.getData({})
    Promise.resolve().then(() => { imageData.dispose() })
    return {
        dataFromAPI,
        width: imageData.width,
        height: imageData.height,
    }
}

async function getJimpImage(params: getImageActions['params']): Promise<JimpInstance> {
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));

    const layerIdentify = params.layer_identify
    const layerID = getLayerID(document, layerIdentify);

    if (params.boundary) {
        if (
            params.boundary.right + params.boundary.left +
            params.boundary.bottom + params.boundary.top +
            params.boundary.width + params.boundary.height
            != document.width + document.height
        ) {
            throw new Error('The boundary is not for this document');
        }
    }

    const desireBounds = params.boundary ? {
        left: params.boundary.left,
        top: params.boundary.top,
        right: document.width - params.boundary.right,
        bottom: document.height - params.boundary.bottom,
        width: params.boundary.width,
        height: params.boundary.height,

    } : {
        left: 0,
        top: 0,
        right: document.width,
        bottom: document.height,
        width: document.width,
        height: document.height,
    };

    const returnData: {
        pixelData: Uint8Array | null,
        width: number,
        height: number
    } = {
        pixelData: null,
        width: 0,
        height: 0,
    }

    let mergedLayer: Layer | null = null;
    let pixelDataFromAPI, maskDataFromAPI;
    let originBound: Bounds = {
        left: 0,
        top: 0,
        right: document.width,
        bottom: document.height,
    } as Bounds;
    let layerWithoutTransparent: boolean = false;
    await runNextModalState(async (restorer) => {
        let [layer, isGroup] = await getRasterizedLayer(document, layerID);
        if (isGroup) mergedLayer = layer;
        if (mergedLayer != null) { restorer.add(() => { (mergedLayer as Layer).delete(); }) }

        [pixelDataFromAPI, maskDataFromAPI] = await Promise.all([
            getPixelsData(document, layer, desireBounds),
            getMaskData(document, layer, desireBounds)
        ])
        originBound = layer?.bounds ?? originBound as Bounds;
        layerWithoutTransparent = false;
        if (layer) {
            layerWithoutTransparent = layer.transparentPixelsLocked;
        } else if (SpeicialIDManager.is_SPECIAL_LAYER_USE_CANVAS(layerIdentify)) {
            layerWithoutTransparent = document.layers.every(layer => layer.transparentPixelsLocked);
        }
    }, {
        commandName: i18n("get content of layer {0}", layerIdentify),
        document
    })

    if (!pixelDataFromAPI) { throw new Error(i18n(`get pixel of {0} failed`, layerIdentify)); }
    pixelDataFromAPI = alignPixelBit(pixelDataFromAPI)
    if (layerWithoutTransparent)
        pixelDataFromAPI = fixAlphaChannel(pixelDataFromAPI)

    returnData.pixelData = padAndTrimToDesireBounds(pixelDataFromAPI, originBound, desireBounds)

    let maskData = null;
    if (maskDataFromAPI) {
        maskDataFromAPI = alignPixelBit(maskDataFromAPI)
        maskData = padAndTrimToDesireBounds(maskDataFromAPI, originBound, desireBounds, 1)
    }
    // handle layer data with mask
    returnData.pixelData = applyLayerDataWithTransparent(returnData.pixelData, maskData)
    returnData.width = desireBounds.width;
    returnData.height = desireBounds.height;

    // do resize
    const jimpImage = new Jimp({
        data: Buffer.from(returnData.pixelData),
        width: desireBounds.width,
        height: desireBounds.height,
    });
    if (params.max_wh && (
        desireBounds.width > params.max_wh || desireBounds.height > params.max_wh
    )) {
        const scaleRatio = params.max_wh / Math.max(desireBounds.width, desireBounds.height);
        jimpImage.scale(scaleRatio);
    }

    return jimpImage
}

async function getImage(params: getImageActions['params']): Promise<getImageActions['result']> {
    const jimpImage = await getJimpImage(params);
    
    // Extract alpha channel data from the bitmap
    const width = jimpImage.bitmap.width;
    const height = jimpImage.bitmap.height;
    const alphaData = new Uint8Array(width * height);
    
    // Copy alpha values from RGBA data (every 4th byte)
    for (let i = 0; i < width * height; i++) {
        alphaData[i] = jimpImage.bitmap.data[i * 4 + 3];
    }
    
    // Create a pure black image with the same dimensions
    const blackImage = new Jimp({
        width: width,
        height: height,
    });
    
    // Copy the alpha channel from the original image to the black image
    for (let i = 0; i < width * height; i++) {
        blackImage.bitmap.data[i * 4 + 3] = jimpImage.bitmap.data[i * 4 + 3];
    }
    
    const ret = {
        jpegData: new Uint8Array(await jimpImage.getBuffer(JimpMime.jpeg, {
            quality: params.quality,
        })),
        alphaData: new Uint8Array(await blackImage.getBuffer(JimpMime.png)),
    }
    
    // if (params.quality) {
    //     ret.jpegData = await jimpImage.getBuffer(JimpMime.jpeg, { quality: params.quality });
    // }
    return ret
}
getImage.getJimpImage = getJimpImage

export default getImage