import { createContext, useContext, useEffect, useState } from "react";
import { SDPPPInternalContextProvider, useSDPPPInternalContext } from "./sdppp-internal";
import { SDPPPWebviewProvider, useSDPPPWebview } from "./webview";
import SDPPPErrorBoundary from "../tsx/SDPPPErrorBoundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { photoshopStore } from "../logics/ModelDefines.mts";
import { useLivePainting } from "../hooks/livePainting.mts";
import { sdpppX } from "../../../src/common/sdpppX.mts";
import { SDPPPLoginProvider, useSDPPPLoginContext } from "./login";

export interface SDPPPExternalContextType {
    logout: () => void,

    connectOrDisconnect: () => void,
    lastConnectErrorMessage: string,
    setAutoRunning: (autoRunning: { type: 'workflow' | 'page', value: string } | null) => void,
    autoRunning: { type: 'workflow' | 'page', value: string } | null,

    photoshopSID: string,
    webviewAgentSID: string,
    workflowAgentSID: string,
    setWorkflowAgentSID: (workflowAgentSID: string) => void,

    toggleWebviewDialog: () => void;
}

export const SDPPPExternalContext = createContext({} as SDPPPExternalContextType);

export function SDPPPProvider({ 
    children,
    loginAppID,
    loginStyle,
    loginBannerTop,
    loginBannerBottom,
 }: { 
    children: React.ReactNode,
    loginAppID: string,
    loginStyle: 'invitation' | 'password',
    loginBannerTop?: React.ReactNode,
    loginBannerBottom?: React.ReactNode,
 }) {
    const queryClient = new QueryClient();
    return <QueryClientProvider client={queryClient}>
        <SDPPPErrorBoundary>
            <SDPPPWebviewProvider>
                <SDPPPLoginProvider loginAppID={loginAppID} loginStyle={loginStyle} loginBannerTop={loginBannerTop} loginBannerBottom={loginBannerBottom}>
                    <SDPPPInternalContextProvider>
                        <SDPPPExternalProvider>
                            {children}
                        </SDPPPExternalProvider>
                    </SDPPPInternalContextProvider>
                </SDPPPLoginProvider>
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
    const { logout } = useSDPPPLoginContext();

    if (sdpppX.registerTestCase) {
        (globalThis as any).sdppp_debugPhotoshopInternalContext = internalContext;
        (globalThis as any).sdppp_debugPhotoshopWebviewContext = webviewContext;
    }

    const {
        toggleWebviewDialog,
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
        logout: logout,

        connectOrDisconnect: doConnectOrDisconnect,
        lastConnectErrorMessage: lastErrorMessage,

        setAutoRunning: setAutoRunning,
        autoRunning: autoRunning,

        photoshopSID: photoshopStore.data.sid,
        webviewAgentSID: webviewAgentSID,
        workflowAgentSID: workflowAgent?.data.sid || "",
        setWorkflowAgentSID: setWorkflowAgentSID,

        toggleWebviewDialog,
    }}>
        {children}
    </SDPPPExternalContext.Provider>;
}