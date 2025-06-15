import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import { PageStore, PageStoreData } from "../../../../src/store/page.mts";
import { useSDPPPWebview } from "./webview";
import { PhotoshopSocket } from "../logics/PhotoshopSocket.mts";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { debug } from "debug";
const log = debug('sdppp:internal');

export const DEFAULT_BACKEND_URL = "http://127.0.0.1:8188"
 
export interface SDPPPInternalContextType {
    socket: PhotoshopSocket | null,

    backendURL: string,
    setBackendURL: (backendURL: SDPPPInternalContextType['backendURL']) => void,
    connectState: 'connected' | 'disconnected' | 'connecting',
    doConnectOrDisconnect: (backendURL?: string) => void,

    lastErrorMessage: string,
    setLastErrorMessage: (lastErrorMessage: SDPPPInternalContextType['lastErrorMessage']) => void,

    autoRunning: {
        type: 'workflow' | 'page',
        value: string
    } | null,
    setAutoRunning: (autoRunning: SDPPPInternalContextType['autoRunning']) => void,

    workflowAgent: PageStore | null,
    workflowAgentSID: string,
    setWorkflowAgentSID: (workflowAgentSID: string) => void,

    comfyMultiUser: boolean,
    setComfyMultiUser: (comfyMultiUser: SDPPPInternalContextType['comfyMultiUser']) => void,

    beforeWorkflowRunHooks: (() => {})[],
    setBeforeWorkflowRunHooks: Dispatch<SetStateAction<(() => {})[]>>,
}

const SDPPPInternalContext = createContext<SDPPPInternalContextType | null>(null);

export function SDPPPInternalContextProvider({ children }: { children: ReactNode }) {
    const {
        setSrc,
        webviewAgentSID,
        prevWebviewAgentSID,
    } = useSDPPPWebview();

    const [connectState, setConnectState] = useState<SDPPPInternalContextType['connectState']>('disconnected');
    const [lastConnectErrorMessage, setLastConnectErrorMessage] = useState<SDPPPInternalContextType['lastErrorMessage']>('');
    const [backendURL, _setBackendURL] = useState<SDPPPInternalContextType['backendURL']>(localStorage.getItem('backendURL') || DEFAULT_BACKEND_URL);
    const [autoRunning, setAutoRunning] = useState<SDPPPInternalContextType['autoRunning']>(null);
    const [workflowAgentSID, setWorkflowAgentSID] = useState<string>('');
    const [comfyMultiUser, setComfyMultiUser] = useState<SDPPPInternalContextType['comfyMultiUser']>(false);
    const [socket, setSocket] = useState<PhotoshopSocket | null>(null);

    const [beforeWorkflowRunHooks, setBeforeWorkflowRunHooks] = useState<(() => {})[]>([]);

    function setBackendURL(backendURL: SDPPPInternalContextType['backendURL']) {
        _setBackendURL(backendURL.split('?')[0].split('#')[0].trim());
    }
    useEffect(() => {
        localStorage.setItem('backendURL', backendURL);
    }, [backendURL]);
    useEffect(() => {
        if (connectState === 'connected') {
            setLastConnectErrorMessage('')
            setSrc(`${backendURL}`);

            const isLocal = !!(
                backendURL.includes('localhost') ||
                backendURL.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)
            )
            log('setBackendURL:', backendURL, 'src:', isLocal);
            photoshopStore.setIsLocal(isLocal);
        } else {
            setSrc('')
            setWorkflowAgentSID('')
        }
    }, [connectState, backendURL]);

    function doConnectOrDisconnect(_backendURL?: string) {
        if (connectState === 'connected' || connectState === 'connecting') {
            if (socket) {
                socket.close()
                setSocket(null);
                // setConnectState('disconnected');
            }

        } else {
            try {
                let _socket: PhotoshopSocket = socket as PhotoshopSocket;
                if (!socket) {
                    _socket = new PhotoshopSocket(_backendURL || backendURL || DEFAULT_BACKEND_URL, {
                        setConnectState,
                        setLastErrorMessage: setLastConnectErrorMessage,
                        setBackendURL,
                        setComfyMultiUser,
                    });
                    setSocket(_socket);
                }
                _socket.connect();
                // setConnectState('connecting');

            } catch (e: any) {
                setLastConnectErrorMessage(e.stack || e.message || e);
            }
        }
    }

    useEffect(() => {
        const callback = (sid: string, cur: PageStoreData, prev: PageStoreData) => {
            if (!workflowAgentSID) { return }
            if (
                // workflowAgent disconnected
                (!cur && sid == workflowAgentSID) ||
                // map changed and found that the workflowAgentSID is not in the map anymore
                !(workflowAgentSID in photoshopPageStoreMap.getAllStore())
            ) {
                // try to find the workflowAgentSID in the map
                setWorkflowAgentSID('');
            }
        }
        photoshopPageStoreMap.subscribe('/', callback);

        return () => {
            photoshopPageStoreMap.unsubscribe(callback);
        }
    }, [workflowAgentSID]);

    useEffect(() => {
        if (!workflowAgentSID && webviewAgentSID) {
            setWorkflowAgentSID(webviewAgentSID);
        }
    }, [workflowAgentSID, webviewAgentSID]);

    useEffect(() => {
        if (webviewAgentSID && (
            !workflowAgentSID || workflowAgentSID == prevWebviewAgentSID
        )) {
            setWorkflowAgentSID(webviewAgentSID);
        }
    }, [webviewAgentSID, prevWebviewAgentSID, workflowAgentSID, setWorkflowAgentSID]);

    const [workflowAgent, setWorkflowAgent] = useState<PageStore | null>(null);
    useEffect(() => {
        if (workflowAgentSID) {
            setWorkflowAgent(photoshopPageStoreMap.getAllStore()[workflowAgentSID]);
        } else {
            setWorkflowAgent(null);
        }
    }, [workflowAgentSID]);

    return <SDPPPInternalContext.Provider value={{
        socket,

        backendURL,
        setBackendURL,
        connectState,
        doConnectOrDisconnect,

        lastErrorMessage: lastConnectErrorMessage,
        setLastErrorMessage: setLastConnectErrorMessage,

        autoRunning,
        setAutoRunning,

        comfyMultiUser,
        setComfyMultiUser,

        workflowAgent,
        workflowAgentSID,
        setWorkflowAgentSID,

        beforeWorkflowRunHooks,
        setBeforeWorkflowRunHooks,
    }}>{children}</SDPPPInternalContext.Provider>;
}

export function useSDPPPInternalContext() {
    const context = useContext(SDPPPInternalContext);
    if (!context) {
        throw new Error('useSDPPPInternalContext must be used within a SDPPPInternalContextProvider');
    }
    return context;
}