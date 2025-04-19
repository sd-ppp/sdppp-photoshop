import { imaging } from "photoshop";
import { host } from "uxp";
import type { Document } from "photoshop/dom/Document";
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
import { parseDocumentIdentify } from '../../util.mjs';
import { alignPixelBit, padAndTrimToDesireBounds } from "./get_image.mjs";
import type { Bounds } from "photoshop/dom/objects/Bounds";
import type { getSelectionActions, PixelsAndSize } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

async function getSelectionData(document: Document, bounds: any) {
    let options = {
        documentID: document.id,
        sourceBounds: bounds,
    }
    let selection = await imaging.getSelection(options)
    let imageData = selection.imageData
    const dataFromAPI = await imageData.getData({})
    Promise.resolve().then(() => { imageData.dispose() })
    return {
        dataFromAPI,
        width: imageData.width,
        height: imageData.height,
    }
}

export default async function getSelection(params: getSelectionActions['params']) {
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));
    // Get Photoshop version
    const majorVersion = parseInt(host.version.split('.')[0]);
    if (!isNaN(majorVersion) && majorVersion < 25) {
        throw new Error(i18n('GetSelection need Photoshop version 25+'));
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

    if (!document.selection?.bounds) {
        const arr = new Uint8Array(desireBounds.width * desireBounds.height)
        arr.fill(255)
        return {
            blob: arr,
            width: desireBounds.width,
            height: desireBounds.height
        };
    }
    let selectionData = null;
    await runNextModalState(async (restorer) => {
        let selectionDataFromAPI: PixelsAndSize<Uint8Array> = await getSelectionData(document, desireBounds) as any;
        selectionDataFromAPI = alignPixelBit(selectionDataFromAPI)
        const bounds = document.selection.bounds || {
            left: 0,
            top: 0,
            right: document.width,
            bottom: document.height,
        } as Bounds
        selectionData = selectionDataFromAPI && padAndTrimToDesireBounds(selectionDataFromAPI, bounds, desireBounds, 1)
    }, { document, commandName: 'SDPPP getSelection' });

    return {
        blob: selectionData,
        width: desireBounds.width,
        height: desireBounds.height,
    }
}
