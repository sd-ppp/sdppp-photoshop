import { useCallback, useEffect, useRef, useState } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { useSDPPPComfyCaller } from "./ComfyCaller.mts";
import { photoshopPageStoreMap } from "../logics/ModelDefines.mts";

export function useLivePainting() {
    const [shouldTriggerLivePainting, setShouldTriggerLivePainting] = useState(false);
    const [autoRunningCooldown, setAutoRunningCooldown] = useState(false);
    const cooldownTimeout = useRef<NodeJS.Timeout | null>(null);

    const {
        autoRunning,
        workflowAgent
    } = useSDPPPInternalContext();

    const {
        runWorkflow,
        runPage
    } = useSDPPPComfyCaller();

    useEffect(() => {
        if (autoRunning && shouldTriggerLivePainting && !autoRunningCooldown) {
            setShouldTriggerLivePainting(false);
            if (autoRunning.type == 'workflow') {
                if (workflowAgent && !workflowAgent.data.executingNodeTitle) {
                    runWorkflow(autoRunning.value, workflowAgent.data.sid, 1);
                    cooldownTimeout.current = setTimeout(() => {
                        setAutoRunningCooldown(false);
                    }, 1000)
                }

            } else if (autoRunning.type == 'page') {
                const pageStore = photoshopPageStoreMap.getStore(autoRunning.value);
                if (pageStore && !pageStore.data.executingNodeTitle) {
                    setAutoRunningCooldown(true);
                    runPage(autoRunning.value);
                    cooldownTimeout.current = setTimeout(() => {
                        setAutoRunningCooldown(false);
                    }, 1000)
                }
            }
        }
    }, [shouldTriggerLivePainting, autoRunningCooldown, autoRunning, workflowAgent, runWorkflow, runPage]);

    useEffect(() => {
        return () => {
            if (cooldownTimeout.current) {
                clearTimeout(cooldownTimeout.current);
            }
        };
    }, []);


    return {
        setShouldTriggerLivePainting
    }
}