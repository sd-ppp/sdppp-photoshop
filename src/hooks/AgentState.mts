import { useStore } from "../../../../src/common/store/store-hooks.mts";
import { PageStore } from "../../../../src/store/page.mts";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";

export function useAgentState(agentSID?: string): {
    sid: string,
    ssid: string,
    title: string,
    lastError: string,
    isWebview: boolean,
    progress: number,   
    executingNodeTitle: string,
    queueSize: number,
} {
    const agent = agentSID ? photoshopPageStoreMap.getStore(agentSID) : null;
    const { state: workflowAgentState } = useStore(agent || null, ['/']);
    if (!workflowAgentState || !agentSID) {
        return {
            sid: '',
            ssid: '',
            title: '',
            lastError: '',
            isWebview: false,
            progress: 0,
            executingNodeTitle: '',
            queueSize: 0,
        };
    }

    return {
        sid: agentSID,
        ssid: workflowAgentState.ssid,
        title: workflowAgentState.title,
        lastError: workflowAgentState.lastError,
        isWebview: !!workflowAgentState.webviewFromSid,
        progress: workflowAgentState.progress,
        executingNodeTitle: workflowAgentState.executingNodeTitle,
        queueSize: workflowAgentState.queueSize,
    };
}