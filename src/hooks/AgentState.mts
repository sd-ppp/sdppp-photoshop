import { useStore } from "../../../src/common/store/store-hooks.mts";
import { PageStore } from "../../../src/sdsystem/common/store/page.mts";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";

export function useAgentState(agentSID: string) {
    const agent = photoshopPageStoreMap.getStore(agentSID);
    const { state: workflowAgentState } = useStore(agent as PageStore, ['/']);
    if (!workflowAgentState) {
        return {};
    }

    return {
        sid: agentSID,
        ssid: workflowAgentState.ssid,
        title: workflowAgentState.title,
        lastError: workflowAgentState.lastError,
        isWebview: !!workflowAgentState.webviewFromSid,
        isCurrentUser: !workflowAgentState.comfyUserToken || workflowAgentState.comfyUserToken == photoshopStore.data.comfyUserToken,
        progress: workflowAgentState.progress,
        executingNodeTitle: workflowAgentState.executingNodeTitle,
        queueSize: workflowAgentState.queueSize,
    };
}