import i18n from "../../../../../../src/common/i18n.mts";
import { LayerReducer } from "./get_layers_in_group.mts";
import type { LayerReducerActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

export default async function getLinkedLayers(params: LayerReducerActions['params']): Promise<LayerReducerActions['result']> {
    return LayerReducer(
        params,
        (layer) => layer.linkedLayers || [],
        (layer) => {
            if (!layer.linkedLayers) 
                throw new Error(i18n('no linked layer for {0}', layer.name));
        }
    );
}