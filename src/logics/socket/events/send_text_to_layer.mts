import { constants } from "photoshop";
import { findInAllSubLayer, getLayerID, parseDocumentIdentify } from "../../util.mts";
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
import type { sendTextActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

export default async function sendText(params: sendTextActions['params']) {
    const documentIdentify = params.document_identify;
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));

    const layerIdentify = params.layer_identify;
    const layerID = getLayerID(document, layerIdentify);
    
    const layer = findInAllSubLayer(document, layerID);
    if (!layer || layer.kind != constants.LayerKind.TEXT) {
        throw new Error(i18n('only layer kind "TEXT" is supported, invalid layer: {0}', layerIdentify));
    }
    
    let success = false;
    await runNextModalState(async () => {
        console.log(params.text)
        layer.textItem.contents = params.text;
        success = true;
    }, {
        document: document,
        commandName: i18n('set text to layer')
    });
    
    return {
        success: success
    };
}
