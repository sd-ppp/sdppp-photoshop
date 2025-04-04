import { createContext, useContext, useEffect } from "react";
import { SDPPPInternalContextProvider, useSDPPPInternalContext } from "./sdppp-internal";
import { SDPPPWebviewProvider, useSDPPPWebview } from "./webview";
import SDPPPErrorBoundary from "../tsx/SDPPPErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useSDPPPComfyCaller } from "../entry.mts";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { PhotoshopStore } from "../../../src/plugins/common/store/photoshop.mts";
import { useLivePainting } from "../hooks/livePainting.mts";
import { sdpppX } from "../../../src/common/sdpppX.mts";

export interface SDPPPExternalContextType {
    connectOrDisconnect: () => void,
    lastConnectErrorMessage: string,
    setAutoRunning: (autoRunning: { type: 'workflow' | 'page', value: string } | null) => void,
    autoRunning: { type: 'workflow' | 'page', value: string } | null,

    photoshopSID: string,
    webviewAgentSID: string,
    workflowAgentSID: string,
    setWorkflowAgentSID: (workflowAgentSID: string) => void,

    showWebviewDialog: () => void;
}

export const SDPPPExternalContext = createContext({} as SDPPPExternalContextType);

export function SDPPPProvider({ children }: { children: React.ReactNode }) {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>
        <SDPPPErrorBoundary>
            <SDPPPWebviewProvider>
                <SDPPPInternalContextProvider>
                    <SDPPPExternalProvider>
                        {children}
                    </SDPPPExternalProvider>
                </SDPPPInternalContextProvider>
            </SDPPPWebviewProvider>
        </SDPPPErrorBoundary>
    </QueryClientProvider>
        ;
}

export function useSDPPPExternalContext() {
    const context = useContext(SDPPPExternalContext);
    if (!context) {
        throw new Error('SDPPPExternalContext not found');
    }
    return context;
}

function SDPPPExternalProvider({ children }: { children: React.ReactNode }) {
    const webviewContext = useSDPPPWebview();
    const internalContext = useSDPPPInternalContext();

    if (sdpppX.registerTestCase) {
        (globalThis as any).sdppp_debugPhotoshopInternalContext = internalContext;
        (globalThis as any).sdppp_debugPhotoshopWebviewContext = webviewContext;
    }

    const {
        showWebviewDialog,
        webviewAgentSID,
    } = webviewContext
    const {
        autoRunning,
        setAutoRunning,
        workflowAgent,
        setWorkflowAgentSID,
        doConnectOrDisconnect,
        lastErrorMessage,
    } = internalContext
    const {
        setShouldTriggerLivePainting
    } = useLivePainting();

    useEffect(() => {
        const callback = () => {
            setShouldTriggerLivePainting(true);
        }
        photoshopStore.subscribe('/canvasStateID', callback);

        return () => {
            photoshopStore.unsubscribe(callback);
        }
    }, [setShouldTriggerLivePainting])

    return <SDPPPExternalContext.Provider value={{
        connectOrDisconnect: doConnectOrDisconnect,
        lastConnectErrorMessage: lastErrorMessage,

        setAutoRunning: setAutoRunning,
        autoRunning: autoRunning,

        photoshopSID: photoshopStore.data.sid,
        webviewAgentSID: webviewAgentSID,
        workflowAgentSID: workflowAgent?.data.sid || "",
        setWorkflowAgentSID: setWorkflowAgentSID,

        showWebviewDialog: showWebviewDialog,
    }}>
        {children}
    </SDPPPExternalContext.Provider>;
}