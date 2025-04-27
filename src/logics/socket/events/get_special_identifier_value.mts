import { SpeicialIDManager } from "../../../../../../src/common/photoshop/specialLayer.mts";
import { getSpecialIdentifierValueActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";
import { makeDocumentIdentify, makeLayerIdentify } from "../../../../../../src/common/photoshop/identify.mts";
import { app, constants } from "photoshop";
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
export default async function getSpecialIdentifierValue(params: getSpecialIdentifierValueActions['params']) {
    const { identifier } = params;
    if (SpeicialIDManager.is_SPECIAL_DOCUMENT_CURRENT(identifier)) {
        if (!app.activeDocument) {
            if (params.width && params.height) {
                let document = await getActiveDocumentOrCreate(params.width, params.height)
                if (document) {
                    return {
                        value: makeDocumentIdentify(document.id, document.name)
                    }
                }
            }
            throw new Error(i18n("document {0} not found", identifier))

        }
        return {
            value: makeDocumentIdentify(app.activeDocument.id, app.activeDocument.name)
        }

    } else if (SpeicialIDManager.is_SPECIAL_LAYER_SELECTED_LAYER(identifier)) {
        if (!app.activeDocument) return {
            error: i18n("document {0} not found", 'current')
        }
        const firstActiveLayer = app.activeDocument.activeLayers[0];
        if (!firstActiveLayer) return {
            error: i18n("layer not found {0}", identifier)
        }
        return {
            value: makeLayerIdentify(firstActiveLayer.id, firstActiveLayer.name)
        }
    }
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