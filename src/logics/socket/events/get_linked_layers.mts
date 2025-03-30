import i18n from "../../../../../src/common/i18n.mts";
import { LayerReducer, LayerReducerActions } from "./get_layers_in_group.mts";


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