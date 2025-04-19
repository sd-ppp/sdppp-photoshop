import { app, constants } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import type { Layer } from "photoshop/dom/Layer";
import { storage } from "uxp";
import i18n from "../../../../src/common/i18n.mts";
import { SpeicialIDManager } from "../../../../src/common/photoshop/specialLayer.mts";
import { makeLayerIdentify } from "../../../../src/common/photoshop/identify.mts";
export interface SDPPPBounds {
    left: number,
    top: number,
    right: number,
    bottom: number,
    width: number,
    height: number
}

export { SpeicialIDManager };

export function getSelectedLayerIdentify(): string {
    const layer = app.activeDocument?.activeLayers?.[0];
    if (!layer) return SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS();
    return makeLayerIdentify(layer.id, layer.name);
}

export function unTrimImageData(
    intersectImageDataArray: Uint8Array,
    toImageDataArray: any,
    fromImageBounds: any,
    toImageBounds: any,
    components: number
) {
    const fromLeft = fromImageBounds.left;
    const fromTop = fromImageBounds.top;
    const fromRight = fromImageBounds.right;
    const fromBottom = fromImageBounds.bottom;
    const fromWidth = fromRight - fromLeft;
    const fromHeight = fromBottom - fromTop;

    const toLeft = toImageBounds.left;
    const toTop = toImageBounds.top;
    const toRight = toImageBounds.right;
    const toBottom = toImageBounds.bottom;
    const toWidth = toRight - toLeft;
    const toHeight = toBottom - toTop;

    const intersectLeft = Math.max(fromLeft, toLeft);
    const intersectTop = Math.max(fromTop, toTop);
    const intersectRight = Math.min(fromRight, toRight);
    const intersectBottom = Math.min(fromBottom, toBottom);
    const intersectWidth = intersectRight - intersectLeft;
    const intersectHeight = intersectBottom - intersectTop;

    const toLength = toWidth * toHeight * components;
    if (toImageDataArray.length !== toLength) {
        throw new Error(`toImageDataArray.length(${toImageDataArray.length}) !== toLength(${toLength})`);
    }
    const intersectLength = intersectWidth * intersectHeight * components;
    if (intersectImageDataArray.length !== intersectLength) {
        throw new Error(`fromImageDataArray.length(${intersectImageDataArray.length}) !== fromLength(${intersectLength})`);
    }

    for (let i = 0; i < toLength; i += components) {
        const currentLeft = (i / components) % toWidth + toLeft;
        const currentTop = Math.floor((i / components) / toWidth) + toTop;
        if (
            currentLeft >= fromLeft &&
            currentLeft < fromRight &&
            currentTop >= fromTop &&
            currentTop < fromBottom
        ) {
            const fromIndex = ((currentTop - intersectTop) * intersectWidth + (currentLeft - intersectLeft)) * components;
            for (let j = 0; j < components; j++) {
                toImageDataArray[i + j] = intersectImageDataArray[fromIndex + j];
            }
        }
    }
    return toImageDataArray;
}

function getDocumentOrLayerID(name: string) {
    if (typeof name != 'string') throw new Error('not a invalid identifer: ' + name);
    const split = name.split('(id:')
    const layerID = split.pop();
    if (!layerID) throw new Error(i18n(`invalid name: {0}`, name));
    return parseInt(layerID.trim().slice(0, -1));
}

export function getDocumentID(name: string) {
    if (SpeicialIDManager.is_SPECIAL_DOCUMENT_CURRENT(name)) {
        return -1;
    }
    return getDocumentOrLayerID(name);
}
export function getLayerID(document: Document, name: string) {
    if (SpeicialIDManager.is_SPECIAL_LAYER_USE_CANVAS(name))
        return 0;
    if (SpeicialIDManager.is_SPECIAL_LAYER_SELECTED_LAYER(name))
        return document.activeLayers.length > 0 ? document.activeLayers[0].id : 0;
    if (SpeicialIDManager.is_SPECIAL_LAYER_NEW_LAYER(name))
        return -2;
    return getDocumentOrLayerID(name);
}

export function getAllSubLayer(layer: Layer | Document, level = 0, parentPath = ''): {
    layer: Layer,
    path: string,
    level: number
}[] {
    if (!layer?.layers) return [];
    return layer.layers.reduce((ret: any, layer: Layer) => {
        const path = level == 0 ? `/${layer.name}` : `${parentPath}/${layer.name}`;
        ret.push({
            layer,
            path: path,
            level: level
        });
        return ret.concat(getAllSubLayer(layer, level + 1, path));
    }, []);
}

export function findInAllSubLayerByName(rootLayer: Document | Layer, name: string): Layer | null {
    if (!rootLayer.layers) return null;
    for (let i = 0; i < rootLayer.layers.length; i++) {
        if (rootLayer.layers[i].name === name) return rootLayer.layers[i];

        const result = findInAllSubLayerByName(rootLayer.layers[i], name)
        if (result) return result;
    }
    return null;
}

export function findInAllSubLayer(rootLayer: Document | Layer, layerid: number): Layer | null {
    if (!rootLayer.layers) return null;
    for (let i = 0; i < rootLayer.layers.length; i++) {
        if (rootLayer.layers[i].id === layerid) return rootLayer.layers[i];

        const result = findInAllSubLayer(rootLayer.layers[i], layerid)
        if (result) return result;
    }
    return null;
}

export async function getRasterizedLayer(document: Document, layerID: number): Promise<[Layer | null, boolean]> {
    if (layerID <= 0) return [null, false];
    let layer: Layer | null = findInAllSubLayer(document, layerID)
    if (!layer) throw new Error(i18n('layer not found {0}', layerID));
    if (layer.kind == constants.LayerKind.GROUP) {
        const mergedLayer = await mergeGroupLayer(layer, document)
        if (!mergedLayer) throw new Error(i18n('merge group failed'));
        return [mergedLayer, true];

    } else if (layer.kind == constants.LayerKind.GRADIENTFILL) {
        const dupLayer = await layer.duplicate(document);
        await dupLayer?.rasterize(constants.RasterizeType.ENTIRELAYER)

        return [dupLayer, true];
    }
    return [layer, false];

}

export async function mergeGroupLayer(layer: Layer, document: Document) {
    // layer is folder
    let visibleOriginal = true;
    if (!layer.visible) {
        layer.visible = true;
        visibleOriginal = false;
    }
    const dupLayer = await layer.duplicate(document);
    const mergedLayer = await dupLayer?.merge()
    if (!visibleOriginal) layer.visible = false

    return mergedLayer || null
}

export function parseDocumentIdentify(documentIdentify: string): Document | null {
    return (SpeicialIDManager.is_SPECIAL_DOCUMENT_CURRENT(documentIdentify) ?
        app.activeDocument :
        app.documents.find(document => document.id == getDocumentID(documentIdentify))
    ) || null
}

export function getLayerInfoFromLayer(document: Document, layer: Layer): {
    name: string,
    opacity: number,
    boundary: SDPPPBounds,
    isGroup: boolean
} {
    return {
        name: layer.name,
        opacity: layer.opacity / 100,
        boundary: {
            left: layer.bounds?.left || 0,
            top: layer.bounds?.top || 0,
            right: document.width - (layer.bounds?.right || 0),
            bottom: document.height - (layer.bounds?.bottom || 0),
            width: layer.bounds?.width || 0,
            height: layer.bounds?.height || 0
        },
        isGroup: layer.kind == constants.LayerKind.GROUP
    };
}


export async function getUserName() {
    const dataFolderPath = (await storage.localFileSystem.getDataFolder()).nativePath;
    let userName = "";
    if (dataFolderPath.startsWith("/")) {
        userName = dataFolderPath.split("/")[2];
    } else {
        userName = dataFolderPath.split("\\")[2];
    }
    return userName.slice(0, 3);
}

export function getSDPPPUID() {
    let uid = localStorage.getItem('sdppp_uid')
    if (!uid || uid.length != 3) {
        uid = makeid(3);
        localStorage.setItem('sdppp_uid', uid)
    }
    return uid;
}



export function makeid(length: number) {
    let result = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}
