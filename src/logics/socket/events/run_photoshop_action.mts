import { action, app, constants } from "photoshop";
import i18n from "../../../../../../src/common/i18n.mts";
import type { RunPhotoshopActionOnLayerActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";
import { runNextModalState } from "src/logics/modalStateWrapper.mjs";
import { findInAllSubLayer, getLayerID, parseDocumentIdentify, SpeicialIDManager } from "src/logics/util.mjs";

export default async function runPhotoshopActionOnLayer(params: RunPhotoshopActionOnLayerActions['params']) {
    const { action_set: actionSetName, action: actionName } = params;
    const { document_identify, layer_identify } = params;

    const actionSet = app.actionTree.find(actionSet => actionSet.name === actionSetName);

    if (!actionSet) {
        throw new Error(i18n('Action set {0} not found', actionSetName));
    }
    const actionForPlay = actionSet.actions.find(action => action.name === actionName);
    if (!actionForPlay) {
        throw new Error(i18n('Action {0} not found', actionName));
    }

    let incomingDocument = parseDocumentIdentify(document_identify);
    if (!incomingDocument) {
        throw new Error(i18n('document {0} not found', document_identify));
    }
    const document = incomingDocument;
    const layerId = getLayerID(document, params.layer_identify);
    const layer = findInAllSubLayer(document, layerId);

    if (layer) {
        await runNextModalState(async () => {
            document.activeLayers.forEach(_layer => {
                _layer.selected = false;
            });
            layer.selected = true;
        }, {
            commandName: i18n('select layer'),
            dontRecoverSelection: true,
            document: app.activeDocument
        });
    }
    await runNextModalState(async () => {
        await actionForPlay.play();
    }, {
        commandName: i18n('run Photoshop Action'),
        document: app.activeDocument
    });
    return {
        result: {
            success: true
        }
    }
}
