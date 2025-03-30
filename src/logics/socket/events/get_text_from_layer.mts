import { constants } from "photoshop";
import { findInAllSubLayer, getLayerID, parseDocumentIdentify } from "../../util.mts";
import i18n from "../../../../../src/common/i18n.mts";

export interface getTextActions {   
    params: {
        document_identify: string,
        layer_identify: string,
    },
    result: {
        text: string
    }
}
export default async function getText(params: getTextActions['params']) {
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));

    const layerIdentify = params.layer_identify
    const layerID = getLayerID(document, layerIdentify);
    
    const returnData = {
        text: ''
    }
    const layer = findInAllSubLayer(document, layerID);
    if (!layer || layer.kind != constants.LayerKind.TEXT) throw new Error(i18n('only layer kind "TEXT" is supported, invalid layer: {0}', layerIdentify));
    returnData.text = layer.textItem.contents;
    
    return {
        text: returnData.text
    }
};