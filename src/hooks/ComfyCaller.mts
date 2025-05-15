import { useCallback } from "react";
import { useSDPPPExternalContext } from "../contexts/sdppp-external";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { useWorkflowRunHooks } from "./WidgetTable.mts";
import { action } from "photoshop";

export function useSDPPPComfyCaller(): {
    openWorkflow: (workflowAgentSID: string, workflow_path: string, reset: boolean) => Promise<void>;
    reopenWorkflow: (workflowAgentSID: string) => Promise<void>;
    saveWorkflow: (workflowAgentSID: string) => Promise<void>;
    runPage: (agentSID?: string, size?: number) => Promise<void>;
    runWorkflow: (workflowPath: string, agentSID?: string, size?: number) => Promise<void>;
    callForPSDExtract: (workflowAgentSID: string) => Promise<void>;
    logout: (workflowAgentSID: string) => Promise<void>;
    uploadImage: (image: Uint8Array, filename: string) => Promise<{
        name: string;
        type: string;
        subfolder: string;
    } | undefined>;
    interrupt: () => Promise<void>;
    clearQueue: () => Promise<void>;
    reboot: () => Promise<{
        success: boolean,
        error?: string
    } | undefined>;
    setComfyOrgAPIKey: (apiKey: string) => Promise<void>;
} {
    const {
        socket,
    } = useSDPPPInternalContext();
    const {
        workflowAgentSID
    } = useSDPPPExternalContext();
    const {
        triggerBeforeWorkflowRun
    } = useWorkflowRunHooks();


    const setComfyOrgAPIKey = useCallback(async (apiKey: string) => {
        await socket?.setComfyOrgAPIKey(workflowAgentSID, apiKey);
    }, [socket, workflowAgentSID]);

    const openWorkflow = useCallback(async (workflowAgentSID: string, workflow_path: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        try {
            await socket?.openWorkflow(workflowAgent, {
                workflow_path,
                from_sid: photoshopStore.data.sid,
                reset: true
            });
        } catch (error) {
            console.error(error);
        }
    }, [socket]);

    const reopenWorkflow = useCallback(async (workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent || !workflowAgent.data.widgetTableStructure.widgetTablePath) {
            throw new Error('workflow not found');
        }
        if (!workflowAgent.data.widgetTableStructure.widgetTablePersisted) {
            throw new Error('workflow is not savable');
        }
        await openWorkflow(workflowAgentSID, workflowAgent.data.widgetTableStructure.widgetTablePath);
    }, [openWorkflow]);

    const pageInstanceRun = useCallback((sid: string, size: number = 1) => {
        socket?.pageInstanceRun(sid, photoshopStore.data.sid, size);
    }, [socket]);

    const saveWorkflow = useCallback(async (workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        if (!workflowAgent.data.widgetTableStructure.widgetTablePath) {
            throw new Error('workflow not found');
        }
        await socket?.saveWorkflow(workflowAgent, {
            workflow_path: workflowAgent.data.widgetTableStructure.widgetTablePath,
            from_sid: photoshopStore.data.sid
        });
    }, [socket]);

    const callForPSDExtract = useCallback(async (workflowAgentSID: string) => {
        await socket?.callForPSDExtract(workflowAgentSID, {
            from_sid: photoshopStore.data.sid
        })
    }, [socket]);

    const logout = useCallback(async (workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        await socket?.logout(workflowAgent);
    }, [socket]);

    const uploadImage = useCallback(async (image: Uint8Array, filename: string) => {
        return await socket?.uploadImage(photoshopStore.data.sid, {
            image,
            filename,
            overwrite: true
        })
    }, [socket]);


    (globalThis as any)['sdppp_action_run'] = async (arg: any, { workflowPath }: { workflowPath?: string }) => {
        if (workflowPath) {
            runWorkflow(workflowPath);
        } else {
            runPage();
        }
    };

    const _runPage = useCallback(async (agentSID?: string, size: number = 1) => {
        if (!agentSID && !workflowAgentSID) return;
        await triggerBeforeWorkflowRun();
        await pageInstanceRun(agentSID || workflowAgentSID, size);
    }, [pageInstanceRun, workflowAgentSID, triggerBeforeWorkflowRun]);

    const runPage = useCallback(async (agentSID?: string, size: number = 1) => {
        await _runPage(agentSID || workflowAgentSID, size);
        // @ts-ignore
        action.recordAction?.({
            "name": "sdppp_run",
            "methodName": "sdppp_action_run"
        }, {})
    }, [_runPage]);

    const runWorkflow = useCallback(async (workflowPath: string, agentSID?: string, size: number = 1) => {
        if (!agentSID && !workflowAgentSID) return;
        await openWorkflow(agentSID || workflowAgentSID, workflowPath);
        _runPage(agentSID || workflowAgentSID, size);
        // @ts-ignore
        action.recordAction?.({
            "name": "sdppp_run_" + workflowPath,
            "methodName": "sdppp_action_run"
        }, { workflowPath })
    }, [openWorkflow, runPage, workflowAgentSID]);

    const interrupt = useCallback(async () => {
        if (!workflowAgentSID) return;
        await socket?.interrupt(workflowAgentSID);
    }, [socket, workflowAgentSID]);

    const clearQueue = useCallback(async () => {
        if (!workflowAgentSID) return;
        await socket?.clearQueue(workflowAgentSID);
    }, [socket, workflowAgentSID]);

    const reboot = useCallback(async () => {
        if (!workflowAgentSID) return;
        return await socket?.reboot(workflowAgentSID);
    }, [socket, workflowAgentSID]);

    return {
        openWorkflow,
        reopenWorkflow,
        saveWorkflow,
        runPage,
        runWorkflow,
        callForPSDExtract,
        logout,
        uploadImage,
        interrupt,
        clearQueue,
        reboot,
        setComfyOrgAPIKey
    }
}