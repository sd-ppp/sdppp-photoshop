import { useCallback } from "react";
import { useSDPPPExternalContext } from "../contexts/sdppp-external";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { useWorkflowRunHooks } from "./WidgetTable.mts";

export function useSDPPPComfyCaller() {
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

    const saveWorkflow = useCallback((workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        if (!lastOpenedWorkflow) {
            throw new Error('lastOpenedWorkflow not found');
        }
        socket?.saveWorkflow(workflowAgent, {
            workflow_path: lastOpenedWorkflow,
            from_sid: photoshopStore.data.sid
        });
    }, [socket, lastOpenedWorkflow]);

    const callForPSDExtract = useCallback((workflowAgentSID: string) => {
        socket?.callForPSDExtract(workflowAgentSID, {
            from_sid: photoshopStore.data.sid
        })
    }, [socket]);

    const logout = useCallback((workflowAgentSID: string) => {
        const workflowAgent = photoshopPageStoreMap.getStore(workflowAgentSID);
        if (!workflowAgent) {
            throw new Error('workflowAgent not found');
        }
        socket?.logout(workflowAgent);
    }, [socket]);

    const uploadImage = useCallback(async (image: Uint8Array, filename: string) => {
        return await socket?.uploadImage(photoshopStore.data.sid, {
            image,
            filename,
            overwrite: true
        })
    }, [socket]);

    return {
        lastOpenedWorkflow,
        openWorkflow,
        reopenWorkflow,
        saveWorkflow,
        runPage: useCallback(async (agentSID?: string, size: number = 1) => {
            console.log('runPage', agentSID, size)
            if (!agentSID && !workflowAgentSID) return;
            await pageInstanceRun(agentSID || workflowAgentSID, size);
        }, [pageInstanceRun, workflowAgentSID]),
        runWorkflow: useCallback(async (workflowPath: string, size: number, agentSID?: string) => {
            console.log('runWorkflow', workflowPath, size, agentSID, workflowAgentSID)
            await triggerBeforeWorkflowRun();
            if (!agentSID && !workflowAgentSID) return;
            await openWorkflow(agentSID || workflowAgentSID, workflowPath);
            await pageInstanceRun(
                agentSID || workflowAgentSID,
                size
            );
        }, [triggerBeforeWorkflowRun, openWorkflow, pageInstanceRun, workflowAgentSID]),
        callForPSDExtract,
        logout,
        uploadImage
    }
}