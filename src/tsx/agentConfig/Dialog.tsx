import { useSDPPPLoginContext } from "src/contexts/login";
import i18n, { isValidI18nKey } from "../../../../../src/common/i18n.mts";
import { AuthingLogin } from "./AuthingLogin";
import { ComfyMultiUserLogin } from "./ComfyMultiUserLogin";
import { ComfyOrgLogin } from "./ComfyOrgLogin";
import { WebPageList } from "./WebPageList";
import { useSDPPPWebview } from "../../contexts/webview";
import { photoshopStore } from "../../logics/ModelDefines.mts";
import { DEFAULT_BACKEND_URL, useSDPPPInternalContext } from "../../contexts/sdppp-internal";
import { useEffect, useRef, useState } from "react";
import { useSDPPPContext } from "src/entry.mjs";
import { CloudControl } from "./CloudControl";
import AIProviders from "src/hooks/CloudControls/AIProviders";
import { useStore } from "zustand";

export function AgentConfigDialog({ onRequestLogin }: { onRequestLogin: () => void }) {
    const { timeoutError } = useSDPPPWebview();
    const { hasAuthingLogin } = useSDPPPLoginContext();
    const { connectState } = useSDPPPInternalContext();
    const [connectedAfter1s, setConnectedAfter1s] = useState(false);
    useEffect(() => {
        if (connectState === 'connected') {
            setTimeout(() => {
                setConnectedAfter1s(true);
            }, 1000);
        } else {
            setConnectedAfter1s(false);
        }
    }, [connectState]);
    const xiangongApiKey = useStore(AIProviders, (state) => state.xiangong.apiKey)
    const chenyuApiKey = useStore(AIProviders, (state) => state.chenyu.apiKey)

    return <div className="client-panel">
        {connectedAfter1s && (!hasAuthingLogin || timeoutError) && <WebPageList />}
        {!xiangongApiKey && !chenyuApiKey && <div className="client-panel-block connect-address">
            <div className="client-panel-title">
                连接指定地址
            </div>
            <AddressBar />
        </div>}
        {
            (connectState !== 'connected' || xiangongApiKey || chenyuApiKey) &&
            <CloudControl />
        }
        <sp-divider />
        <div className="client-panel-block app-login-container">
            <div className="client-panel-title">
                {i18n('Login/Auth')}
            </div>
            {hasAuthingLogin && <AuthingLogin />}
            <ComfyMultiUserLogin onRequestLogin={onRequestLogin} />
            <ComfyOrgLogin />
            <sp-label>photoshop id: {photoshopStore.data.uname}</sp-label>
        </div>
    </div>
}

// let agentConfigDialog: HTMLDialogElement | null = null;

// function createDialog() {
//     const dialog = document.createElement('dialog')
//     dialog.className = 'sdppp-webview'
//     dialog.style.padding = '0'
//     dialog.style.margin = '0'
//     dialog.style.width = '480px'
//     dialog.style.height = '540px'
//     dialog.style.padding = '8px'
//     document.body.appendChild(dialog)
//     agentConfigDialog = dialog;

//     const root = createRoot(dialog);
//     root.render(<AgentConfigDialog />);

//     // const webview = document.createElement('webview')
//     // webview.style.position = 'relative';
//     // webview.style.width = '1024px'
//     // webview.style.height = '768px'
//     // dialog.appendChild(webview)
//     // agentDialogWebview = webview;

//     return dialog
//   }

// export function showAgentConfigDialog() {
//     if (!agentConfigDialog) {
//         createDialog()
//     }
//     agentConfigDialog?.showModal()
// }

export function AddressBar() {
    const {
        backendURL, setBackendURL,
        connectState, doConnectOrDisconnect,
    } = useSDPPPInternalContext();
    const {
        lastConnectErrorMessage
    } = useSDPPPContext()
    const inputDisable = (connectState === 'connected' || connectState === 'connecting') ? { disabled: true } : {};

    // useEffect(() => {
    //     if (backendURL && connectState === 'disconnected') {
    //         setTimeout(() => {
    //             doConnectOrDisconnect();
    //         }, 1000);
    //     }
    // }, []);

    // const isUnmounting = useRef(false);
    // useEffect(() => {
    //     return () => {
    //         isUnmounting.current = true;
    //     };
    // }, []);

    // useEffect(() => {
    //     return () => {
    //         if (connectState === 'connected' && isUnmounting.current) {
    //             doConnectOrDisconnect();
    //         }
    //     };
    // }, [connectState]);

    useEffect(() => {
        setTimeout(() => {
            if (backendURL && backendURL != DEFAULT_BACKEND_URL)
                doConnectOrDisconnect();
        }, 1000);
    }, []);

    return <><div className="connect-box">
        <div className={"status-bar " + connectState}>
            <div className="status-icon" title={i18n(connectState)}>⬤</div>
        </div>
        <sp-textfield
            id="url-bar"
            label="backendURL"
            onInput={(ev: any) => { setBackendURL(ev.currentTarget.value); }}
            {...inputDisable}
            value={backendURL || ''}
            placeholder={DEFAULT_BACKEND_URL}
        ></sp-textfield>
        <sp-action-button
            id="connect-btn"
            onClick={() => { doConnectOrDisconnect(); }}
        >{connectState !== 'disconnected' ? '⊗' : '→'}</sp-action-button>
    </div>

        {
            lastConnectErrorMessage ? (
                <div>
                    <sp-label class="error-label">
                        {isValidI18nKey(lastConnectErrorMessage) ? i18n(lastConnectErrorMessage as any) : lastConnectErrorMessage}
                    </sp-label>
                </div>
            ) : ''
        }
    </>;
}