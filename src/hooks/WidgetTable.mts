import { useCallback, useEffect, useState } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { useStore } from "../../../src/common/store/store-hooks.mts";
import { SDPPPGraphForm } from "../../../src/common/types";
import { storeWidgetValue } from "../../../src/plugins/common/hooks/widgetable.mts";

export function useWidgetTable() {
    const {
        workflowAgent,
        socket
    } = useSDPPPInternalContext();

    const [form, setForm] = useState<SDPPPGraphForm[]>([]);

    const {state} = useStore(workflowAgent, '/currentForm');
    useEffect(() => {
        state?.currentForm && setForm(state.currentForm);
    }, [state]);

    const setWidgetValue = useCallback(async (nodeID: number, widgetIndex: number, value: any) => {
        if (!workflowAgent) { throw new Error('workflowAgent not found'); }
        const currentForm = workflowAgent.data.currentForm;

        for (let i = 0; i < currentForm.length; i++) {
            if (currentForm[i].id === nodeID) {
                currentForm[i].widgets[widgetIndex].value = value;
                storeWidgetValue(currentForm[i].title, widgetIndex, value, currentForm[i].widgets[widgetIndex].outputType);
                break;
            }
        }
        await socket?.setWidgetValue(workflowAgent, {
            values: [{
                nodeID,
                widgetIndex,
                value
            }]
        });
        workflowAgent.setCurrentForm(workflowAgent.data.currentForm);
    }, [workflowAgent, socket]);

    return {
        form,
        setWidgetValue
    }
}

export function useWorkflowRunHooks() {
    const {
        beforeWorkflowRunHooks,
        setBeforeWorkflowRunHooks,
    } = useSDPPPInternalContext();

    const addBeforeWorkflowRunHook = useCallback((hook: () => {}) => {
        setBeforeWorkflowRunHooks([...beforeWorkflowRunHooks, hook]);
    }, [beforeWorkflowRunHooks, setBeforeWorkflowRunHooks]);

    const removeBeforeWorkflowRunHook = useCallback((hook: () => {}) => {
        setBeforeWorkflowRunHooks(beforeWorkflowRunHooks.filter((h: any) => h !== hook));
    }, [beforeWorkflowRunHooks, setBeforeWorkflowRunHooks]);


    const triggerBeforeWorkflowRun = useCallback(() => {
        beforeWorkflowRunHooks.forEach(hook => hook());
    }, [beforeWorkflowRunHooks]);
    
    return {
        addBeforeWorkflowRunHook,
        removeBeforeWorkflowRunHook,
        triggerBeforeWorkflowRun,
    }
}
// function isDiffFromRemote(remoteForm: SDPPPGraphForm[] = []) {
//     if (!workflowAgent) { return false; }
//     const currentForm = workflowAgent.data.currentForm;
    
//     if (currentForm.length !== remoteForm.length) {
//         return true;
//     }
//     for (let i = 0; i < currentForm.length; i++) {
//         if (currentForm[i].id !== remoteForm[i].id) {
//             return true;
//         }
//         for (let j = 0; j < currentForm[i].widgets.length; j++) {
//             if (currentForm[i].widgets[j].value !== remoteForm[i].widgets[j].value) {
//                 return true;
//             }
//         }
//     }
//     return false;
// }