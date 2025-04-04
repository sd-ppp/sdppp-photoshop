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
    const [localForm, setLocalForm] = useState<SDPPPGraphForm[]>([]);

    useEffect(() => {
        if (isDiffFromRemote(localForm, form)) {
            setLocalForm(form);
        }
    }, [form]);

    const { state } = useStore(workflowAgent, '/currentForm');
    useEffect(() => {
        state?.currentForm && setForm(state.currentForm);
    }, [state]);

    const setWidgetValue = useCallback(async (nodeID: number, widgetIndex: number, value: any) => {
        if (!workflowAgent) { throw new Error('workflowAgent not found'); }
        for (let i = 0; i < localForm.length; i++) {
            if (localForm[i].id === nodeID) {
                localForm[i].widgets[widgetIndex].value = value;
                storeWidgetValue(localForm[i].title, widgetIndex, value, localForm[i].widgets[widgetIndex].outputType);
                break;
            }
        }
        setLocalForm([...localForm]);
        await socket?.setWidgetValue(workflowAgent, {
            values: [{
                nodeID,
                widgetIndex,
                value
            }]
        });
    }, [workflowAgent, socket, localForm]);

    return {
        form: localForm,
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


    const triggerBeforeWorkflowRun = useCallback(async () => {
        for (let i = 0; i < beforeWorkflowRunHooks.length; i++) {
            await beforeWorkflowRunHooks[i]();
        }
    }, [beforeWorkflowRunHooks]);

    return {
        addBeforeWorkflowRunHook,
        removeBeforeWorkflowRunHook,
        triggerBeforeWorkflowRun,
    }
}
function isDiffFromRemote(localForm: SDPPPGraphForm[], remoteForm: SDPPPGraphForm[] = []) {
    if (localForm.length !== remoteForm.length) {
        // console.log('found diff: length', localForm.length, remoteForm.length)
        return true;
    }
    for (let i = 0; i < localForm.length; i++) {
        if (localForm[i].id !== remoteForm[i].id) {
            // console.log('found diff: id', i, localForm[i].id, remoteForm[i].id)
            return true;
        }
        for (let j = 0; j < localForm[i].widgets.length; j++) {
            if (localForm[i].widgets[j].value !== remoteForm[i].widgets[j].value) {
                // console.log('found diff: widget value', i, j, localForm[i].widgets[j].value, remoteForm[i].widgets[j].value)
                return true;
            }
        }
    }
    return false;
}