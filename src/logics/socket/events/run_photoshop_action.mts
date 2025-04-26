import { app } from "photoshop";
import i18n from "../../../../../../src/common/i18n.mts";
import type { RunPhotoshopActionActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";
import { runNextModalState } from "src/logics/modalStateWrapper.mjs";

export default async function runPhotoshopAction(params: RunPhotoshopActionActions['params']) {
    const { action_set: actionSetName, action: actionName } = params;

    const actionSet = app.actionTree.find(actionSet => actionSet.name === actionSetName);

    if (!actionSet) {
        throw new Error(i18n('Action set {0} not found', actionSetName));
    }
    const action = actionSet.actions.find(action => action.name === actionName);
    if (!action) {
        throw new Error(i18n('Action {0} not found', actionName));
    }

    await runNextModalState(async () => {
        await action.play();
    }, {
        commandName: i18n('sdppp Run Photoshop Action'),
        document: app.activeDocument
    });
    return {
        result: {
            success: true
        }
    }
}
