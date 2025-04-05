import { useCallback } from "react";
import { useSDPPPExternalContext } from "../contexts/sdppp-external";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { useWorkflowRunHooks } from "./WidgetTable.mts";

export function useSDPPPComfyCaller(): {
    lastOpenedWorkflow: string;
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
} {
    const {
        socket,
        lastOpenedWorkflow,
        setLastOpenedWorkflow
    } = useSDPPPInternalContext();
    const {
        workflowAgentSID
    } = useSDPPPExternalContext();
    const {
        triggerBeforeWorkflowRun
    } = useWorkflowRunHooks();


    const openWorkflow = useCallback(async (workflowAgentSID: string, workflow_path: string, reset: boolean = false) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        try {
            await socket?.openWorkflow(workflowAgent, {
                workflow_path,
                from_sid: photoshopStore.data.sid,
                reset
            });
            setLastOpenedWorkflow(workflow_path);
        } catch (error) {
            setLastOpenedWorkflow('')
        }
    }, [socket, setLastOpenedWorkflow]);

    const reopenWorkflow = useCallback(async (workflowAgentSID: string) => {
        if (!lastOpenedWorkflow) {
            throw new Error('lastOpenedWorkflow not found');
        }
        await openWorkflow(workflowAgentSID, lastOpenedWorkflow, true);
    }, [openWorkflow, lastOpenedWorkflow]);

    const pageInstanceRun = useCallback((sid: string, size: number = 1) => {
        socket?.pageInstanceRun(sid, photoshopStore.data.sid, size);
    }, [socket]);

    const saveWorkflow = useCallback(async (workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        if (!lastOpenedWorkflow) {
            throw new Error('lastOpenedWorkflow not found');
        }
        await socket?.saveWorkflow(workflowAgent, {
            workflow_path: lastOpenedWorkflow,
            from_sid: photoshopStore.data.sid
        });
    }, [socket, lastOpenedWorkflow]);

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

    const runPage = useCallback(async (agentSID?: string, size: number = 1) => {
        if (!agentSID && !workflowAgentSID) return;
        await triggerBeforeWorkflowRun();
        await pageInstanceRun(agentSID || workflowAgentSID, size);
    }, [pageInstanceRun, workflowAgentSID, triggerBeforeWorkflowRun]);

    const runWorkflow = useCallback(async (workflowPath: string, agentSID?: string, size: number = 1) => {
        if (!agentSID && !workflowAgentSID) return;
        await openWorkflow(agentSID || workflowAgentSID, workflowPath);
        await runPage(agentSID || workflowAgentSID, size);
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
        lastOpenedWorkflow,
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
        reboot
    }
}