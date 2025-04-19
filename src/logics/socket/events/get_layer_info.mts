import type { Layer } from "photoshop/dom/Layer";
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from "../../modalStateWrapper.mjs";
import { SDPPPBounds, SpeicialIDManager, getLayerID, getLayerInfoFromLayer, getRasterizedLayer, parseDocumentIdentify } from "../../util.mjs";
import type { getLayerInfoActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";
export default async function getLayerInfo(params: getLayerInfoActions['params']): Promise<getLayerInfoActions['result']> {
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));
    if (!params.layer_identify) throw new Error(i18n('get_layer_info: layer_identify required'));

    let returnData: getLayerInfoActions['result'] = { 
        name: '',
        opacity: 0,
        boundary: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            width: document.width,
            height: document.height,
        },
        isGroup: false,
        identify: ''
    };
    await runNextModalState(async (restorer) => {
        let layer: Layer | null = null;
        let layerIdentify = params.layer_identify;
        let isGroup: boolean = false;
        if (params.layer_identify) {
            layerIdentify = params.layer_identify
            const layerID = getLayerID(document, layerIdentify);

            if (SpeicialIDManager.is_SPECIAL_LAYER_USE_CANVAS(layerIdentify)) {
                returnData = {
                    name: '',
                    opacity: 1,
                    boundary: {
                        left: 0,
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: document.width,
                        height: document.height,
                    },
                    isGroup: true,
                    identify: layerIdentify,
                }
                return returnData;
            }

            [layer, isGroup] = await getRasterizedLayer(document, layerID);
            restorer.add(() => {
                if (layer && isGroup) {
                    layer.delete();
                }
            })
        }

        if (!layer) throw new Error(i18n('layer not found: {0}', params.layer_identify));
        returnData = Object.assign({
            isGroup: isGroup,
            identify: layerIdentify || ''
        }, getLayerInfoFromLayer(document, layer));
    }, {
        commandName: i18n("get layer info"),
        document
    });
    return returnData
};
