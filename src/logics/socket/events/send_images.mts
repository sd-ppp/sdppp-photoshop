import {Jimp} from "jimp";
import { app, constants, imaging } from "photoshop";
import { Document } from "photoshop/dom/Document";
import { Layer } from "photoshop/dom/Layer";
import i18n from "../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
import { SDPPPBounds, SpeicialIDManager, findInAllSubLayer, getLayerID, parseDocumentIdentify } from '../../util.mts';

export interface ImageBlobParams {
    width: number,
    height: number,
    components: number,
    buffer: Blob | ArrayBuffer
}

export interface sendImagesActions {
    params: {
        image_blobs?: ImageBlobParams[], 
        image_urls?: string[],
        document_identify: string,
        layer_identifies: string[],
        boundaries: SDPPPBounds[]
    },
    result: any
}

async function getActiveDocumentOrCreate(width: number, height: number) {
    if (app.activeDocument) return app.activeDocument
    let document = null;
    await runNextModalState(async () => {
        document = await app.createDocument({
            width: width,
            height: height,
            resolution: 72,
            mode: constants.NewDocumentMode.RGB,
            fill: constants.DocumentFill.TRANSPARENT
        })
    }, {
        document: null,
        "commandName": i18n('create document for sent images')
    })
    return document
}
async function getPreviewDocumentOrCreate(width: number, height: number) {
    const document = app.documents.find(document=> document.name == SpeicialIDManager.getSpecialDocumentForPreview())
    if (document) {
        if (document.width < width || document.height < height) {
            await runNextModalState(async () => {
                await document.resizeCanvas(Math.max(document.width, width), Math.max(document.height, height))
            }, {
                document: null,
                "commandName": i18n('resize document for preview')
            })
        }
        return document
    } else {
        let document: Document | null = null;
        await runNextModalState(async () => {
            document = await app.createDocument({
                width: width,
                height: height,
                resolution: 72,
                mode: constants.NewDocumentMode.RGB,
                fill: constants.DocumentFill.TRANSPARENT,
                name: SpeicialIDManager.getSpecialDocumentForPreview()
            })
        }, {
            document: null,
            "commandName": i18n('create document for preview')
        })
        return document
    }
}

let sentCount = 0;
export default async function sendImages(params: sendImagesActions['params']) {
    sentCount++;
    const imageBlobs: ImageBlobParams[] = (params.image_blobs?.length ? params.image_blobs : null) as any
    const imageURLs: string[] = (params.image_urls?.length ? params.image_urls : null) as any
    const documentIdentify = params.document_identify
    const layerIdentifies = params.layer_identifies

    // download or load from buffer
    const jimps: any[] = (
        await Promise.all((imageURLs || imageBlobs || []).map(async (t, index) => {
            if (imageURLs) {
                //@ts-ignore
                return await Jimp.read(imageURLs[index]);

            } else if (imageBlobs) {
                const buffer = imageBlobs[index].buffer instanceof Blob ? 
                    await (imageBlobs[index].buffer as Blob).arrayBuffer() : 
                    imageBlobs[index].buffer
                return new Jimp({
                    data: Buffer.from(buffer),
                    width: imageBlobs[index].width,
                    height: imageBlobs[index].height,
                })

            }
        }))
    ).filter((j: any) => j);

    // make document
    let incomingDocument = parseDocumentIdentify(documentIdentify);
    // should add unittest
    if (SpeicialIDManager.is_SPECIAL_DOCUMENT_CURRENT(documentIdentify)) {
        incomingDocument = await getActiveDocumentOrCreate(jimps[0].bitmap.width, jimps[0].bitmap.height)
    }

    if (SpeicialIDManager.is_SPECIAL_LAYER_PREVIEW_DOCUMENT(documentIdentify)) {
        incomingDocument = await getPreviewDocumentOrCreate(jimps[0].bitmap.width, jimps[0].bitmap.height)
    }
    if (!incomingDocument) throw new Error(i18n('document {0} not found'));
    const document = incomingDocument

    // make area
    const areas: { width: number, height: number, top: number, left: number }[] = jimps.map((jimp, index) => {
        if (params.boundaries && params.boundaries[index]) {
            return {
                width: params.boundaries[index].width,
                height: params.boundaries[index].height,
                top: params.boundaries[index].top,
                left: params.boundaries[index].left,
            }
        }

        let scale = 1;
        if (jimp.bitmap.height > document.height || jimp.bitmap.width > document.width) {
            scale = Math.min(document.height / jimp.bitmap.height, document.width / jimp.bitmap.width)
        }
        return {
            width: jimp.bitmap.width * scale, height: jimp.bitmap.height * scale,
            top: (document.height - jimp.bitmap.height * scale) / 2, left: (document.width - jimp.bitmap.width * scale) / 2,
            bottom: (document.height - jimp.bitmap.height * scale) / 2, right: (document.width - jimp.bitmap.width * scale) / 2
        }
    })
    jimps.forEach((pixelJimp, index) => {
        const area = areas[index];
        if (pixelJimp.bitmap.width != area.width || pixelJimp.bitmap.height != area.height) {
            const size = { w: area.width, h: area.height }
            pixelJimp.resize(size)
        }
    })

    const imageDatas = await Promise.all(jimps.map(async pixelJimp => {
        let data = pixelJimp.bitmap.data
        if (document.bitsPerChannel == "bitDepth16") {
            const mover = 7;
            const res = new Uint16Array(data.length);
            for (let i = 0; i < data.length; i += 4) {
                res[i] = (data[i] << mover) + res[i]
                res[i + 1] = (data[i + 1] << mover) + res[i + 1]
                res[i + 2] = (data[i + 2] << mover) + res[i + 2]
                res[i + 3] = data[i + 3] << mover
            }
            data = res;

        } else if (document.bitsPerChannel == "bitDepth32") {
            const res = new Float32Array(data.length);
            for (let i = 0; i < data.length; i += 4) {
                res[i] = data[i] / 255
                res[i + 1] = data[i + 1] / 255
                res[i + 2] = data[i + 2] / 255
                res[i + 3] = data[i + 3] / 255
            }
            data = res;
        } 

        return await imaging.createImageDataFromBuffer(
            data,
            {
                width: pixelJimp.bitmap.width,
                height: pixelJimp.bitmap.height,
                components: 4,
                colorProfile: 'sRGB IEC61966-2.1',
                colorSpace: "RGB"
            }
        )
    }))

    // make layers and put pixels
    const newLayers: Layer[] = []
    await runNextModalState(async (restorer) => {
        let targetLayerOrGroup: Layer | null = null
        const layerOrGroups: Layer[] = await Promise.all(
            jimps.map(async (imageId, index) => {
                const layerIdentify = layerIdentifies.length == 1 ? layerIdentifies[0] : layerIdentifies[index];
                if (!SpeicialIDManager.is_SPECIAL_LAYER_NEW_LAYER(layerIdentify)) {
                    const layerId = getLayerID(document, layerIdentify)
                    targetLayerOrGroup = findInAllSubLayer(document, layerId)
                }
                if (targetLayerOrGroup && targetLayerOrGroup.kind != constants.LayerKind.GROUP) {
                    return targetLayerOrGroup
                } else {
                    const newLayer = await document.createLayer(constants.LayerKind.NORMAL, {
                        name: `SDPPP Images ${sentCount}${jimps.length > 1 ? `_${index + 1}` : ''}`,
                    })
                    if (!newLayer) throw new Error(i18n('create layer failed'))
                    newLayers.push(newLayer)
                    if (targetLayerOrGroup /* layer is a group */) newLayer.move(targetLayerOrGroup, constants.ElementPlacement.PLACEINSIDE)
                    else newLayer.move(document.layers[0], constants.ElementPlacement.PLACEBEFORE)
                    return newLayer
                }
            })
        );
        if (newLayers.length) {
            restorer.add((success) => {
                if (success) {
                    newLayers.forEach((newLayer, index) => { newLayer.selected = false; });
                } else {
                    newLayers.forEach(newLayer => newLayer.delete())
                }
            });
        }

        await Promise.all(
            layerOrGroups.map(async (layer, index) => {
                await imaging.putPixels({
                    documentID: document.id,
                    layerID: layer.id,
                    replace: false,
                    imageData: imageDatas[index],
                    targetBounds: areas[index]
                })
            })
        )
    }, {
        commandName: i18n('show sent images'),
        document
    })

    return {}
}
