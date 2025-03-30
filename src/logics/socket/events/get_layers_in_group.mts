import { constants } from "photoshop";
import { SDPPPBounds, SpeicialIDManager, findInAllSubLayer, getLayerID, parseDocumentIdentify } from "../../util.mjs";
import { Layer } from "photoshop/dom/Layer";
import getLayerInfo, { getLayerInfoActions } from "./get_layer_info.mjs";
import i18n from "../../../../../src/common/i18n.mts";
import { makeLayerIdentify } from "../../../../../src/common/photoshop/identify.mts";

export interface LayerReducerActions {
    params: {
        document_identify: string,
        layer_identifies: string[],
        select: string
    },
    result: {
        layer_identifies: string[],
        layer_boundaries: SDPPPBounds[],
        layer_infos: getLayerInfoActions['result'][]
    }
}

export async function LayerReducer(
    params: LayerReducerActions['params'],
    getLayersForReduce: (layer: Layer) => Layer[],
    validateLayer: (layer: Layer) => void
): Promise<LayerReducerActions['result']> {
    const select = params.select || 'all'
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));

    const layerIdentifies = params.layer_identifies
    const layerWithLayerInfos = await Promise.all(layerIdentifies.map(async (layerIdentify) => {
        const layerID = getLayerID(document, layerIdentify);
        if (SpeicialIDManager.is_SPECIAL_LAYER_USE_CANVAS(layerIdentify)) 
            throw new Error(i18n('layer not found: {0}', layerIdentify));

        let layer: Layer | null = findInAllSubLayer(document, layerID)
        if (!layer) throw new Error(i18n('layer not found {0}', layerIdentify));
        
        validateLayer(layer);
        const targetLayers = getLayersForReduce(layer);
        
        if (select === 'first' && targetLayers.length === 0) 
            throw new Error(i18n('no first related layer in {0}', layerIdentify));

        const resultLayerIdentifies = targetLayers
            .filter((layer, i) => {
                if (select === 'first') return i === 0;
                if (select === 'text') return layer.kind === constants.LayerKind.TEXT;
                if (select === 'image') return layer.kind === constants.LayerKind.NORMAL;
                return true;
            })
            .map(layer => makeLayerIdentify(layer.id, layer.name));

        return {
            layer_identifies: resultLayerIdentifies,
            layer_infos: await Promise.all(resultLayerIdentifies.map((identify) => 
                getLayerInfo({
                    document_identify: documentIdentify,
                    layer_identify: identify
                })
            ))
        }
    }));

    const result: LayerReducerActions['result'] = {
        layer_identifies: [],
        layer_boundaries: [],
        layer_infos: []
    }

    layerWithLayerInfos.forEach(({ layer_identifies, layer_infos }) => {
        result.layer_identifies.push(...layer_identifies);
        result.layer_boundaries.push(...layer_infos.map(info => info.boundary));
        result.layer_infos.push(...layer_infos);
    });

    return result;
}

export default async function getLayersInGroup(params: LayerReducerActions['params']): Promise<LayerReducerActions['result']> {
    return LayerReducer(
        params,
        (layer) => layer.layers || [],
        (layer) => {
            if (layer.kind != constants.LayerKind.GROUP) 
                throw new Error(i18n('layer {0} is not a group', layer.name));
            if (!layer.layers) 
                throw new Error(i18n('layer {0} is not a group', layer.name));
        }
    );
}