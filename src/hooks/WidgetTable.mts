import { useCallback } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";

export function useWidgetTable() {
    const {
        workflowAgent,
        socket
    } = useSDPPPInternalContext();

    const setWidgetValue = useCallback(async (nodeID: number, widgetIndex: number, value: any) => {
        if (!workflowAgent) { throw new Error('workflowAgent not found'); }
        await socket?.setWidgetValue(workflowAgent, {
            values: [{
                nodeID,
                widgetIndex,
                value
            }]
        });
        const widgetTableID = workflowAgent.data.widgetTableStructure.widgetTableID;
        const widgetTablePath = workflowAgent.data.widgetTableStructure.widgetTablePath;
        const widgetTablePersisted = workflowAgent.data.widgetTableStructure.widgetTablePersisted;
        const widgetTableKey = `${widgetTableID}_${widgetTablePath}_${widgetTablePersisted}`;
        const outputType = workflowAgent.data.widgetTableStructure.nodes[nodeID].widgets[widgetIndex].outputType;
        storeWidgetValue(widgetTableKey, nodeID, widgetIndex, value, outputType);
    }, [workflowAgent, socket]);

    return {
        setWidgetValue
    }
}

export function useWorkflowRunHooks() {
    const {
        beforeWorkflowRunHooks,
        setBeforeWorkflowRunHooks,
    } = useSDPPPInternalContext();

    const addBeforeWorkflowRunHook = useCallback((hook: () => {}) => {
        setBeforeWorkflowRunHooks(beforeWorkflowRunHooks => {
            const newBeforeWorkflowRunHooks = [...beforeWorkflowRunHooks, hook]
            return newBeforeWorkflowRunHooks
        });
        return () => {
            setBeforeWorkflowRunHooks((beforeWorkflowRunHooks: (() => {})[]) => {
                const newBeforeWorkflowRunHooks = beforeWorkflowRunHooks.filter((h: any) => h !== hook)
                return newBeforeWorkflowRunHooks
            });
        }
    }, [setBeforeWorkflowRunHooks]);


    const triggerBeforeWorkflowRun = useCallback(async () => {
        for (let i = 0; i < beforeWorkflowRunHooks.length; i++) {
            await beforeWorkflowRunHooks[i]();
        }
    }, [beforeWorkflowRunHooks]);

    return {
        addBeforeWorkflowRunHook,
        triggerBeforeWorkflowRun,
    }
}

function storeWidgetValue(widgetTableKey: string, nodeID: number, widgetIndex: number, value: any, outputType: string) {
    const data = localStorage.getItem(`widgetValue_${widgetTableKey}`);
    const dataObj = data ? JSON.parse(data) : {};
    dataObj[nodeID] = dataObj[nodeID] || [];
    dataObj[nodeID][widgetIndex] = {
        value,
        outputType
    }
    localStorage.setItem(`widgetValue_${widgetTableKey}`, JSON.stringify(dataObj));
}