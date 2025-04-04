import { useCallback } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { useSDPPPComfyCaller } from "./ComfyCaller.mts";
import { photoshopPageStoreMap } from "../logics/ModelDefines.mts";

export function useLivePainting() {
    const {
        autoRunning,
        workflowAgent
    } = useSDPPPInternalContext();

    const {
        runWorkflow,
        runPage
    } = useSDPPPComfyCaller();

    let autoRunningCooldown = false;
    const tryDoLivePainting = useCallback(async () => {
        if (autoRunningCooldown) return;
        if (autoRunning) {
            if (autoRunning.type == 'workflow') {
                if (workflowAgent && !workflowAgent.data.executingNodeTitle) {
                    runWorkflow(autoRunning.value, workflowAgent.data.sid, 1);
                    setTimeout(() => {
                        autoRunningCooldown = false
                    }, 1000)
                }

            } else if (autoRunning.type == 'page') {
                const pageStore = photoshopPageStoreMap.getStore(autoRunning.value);
                if (pageStore && !pageStore.data.executingNodeTitle) {
                    autoRunningCooldown = true
                    runPage(autoRunning.value);
                    setTimeout(() => {
                        autoRunningCooldown = false
                    }, 1000)
                }
            }
        }
    }, [autoRunning, workflowAgent, runWorkflow, runPage]);
    return {
        tryDoLivePainting
    }
}