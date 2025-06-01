import { useEffect, useRef, useState } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { DEFAULT_BACKEND_URL } from "../contexts/sdppp-internal";
import CogIcon from "../../../photoshop/src/tsx/icons/CogIcon";
import { useAgentState } from "src/hooks/AgentState.mjs";
import { useSDPPPContext } from "src/entry.mjs";
import i18n from "../../../../src/common/i18n.mts";
import { useSDPPPWebview } from "src/contexts/webview";
import { AgentConfigDialog } from "./agentConfig/Dialog";
import { photoshopStore } from "src/logics/ModelDefines.mjs";
import { useSDPPPLoginContext } from "src/contexts/login";

export function AddressBar() {
    const { backendURL, setBackendURL, connectState, doConnectOrDisconnect } = useSDPPPInternalContext();
    const inputDisable = (connectState === 'connected' || connectState === 'connecting') ? { disabled: true } : {};

    useEffect(() => {
        if (backendURL && connectState === 'disconnected') {
            setTimeout(() => {
                doConnectOrDisconnect();
            }, 1000);
        }
    }, []);

    const isUnmounting = useRef(false);
    useEffect(() => {
        return () => {
            isUnmounting.current = true;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (connectState === 'connected' && isUnmounting.current) {
                doConnectOrDisconnect();
            }
        };
    }, [connectState]);

    return <>
        {connectState === 'connected' ?
            <ConnectConfigBar />
            : <sp-textfield
                id="url-bar"
                label="backendURL"
                onInput={(ev: any) => { setBackendURL(ev.currentTarget.value); }}
                {...inputDisable}
                value={backendURL || ''}
                placeholder={DEFAULT_BACKEND_URL}
            ></sp-textfield>
        }
        <sp-action-button
            id="connect-btn"
            onClick={() => { doConnectOrDisconnect(); }}
        >{connectState !== 'disconnected' ? '⊗' : '→'}</sp-action-button>
    </>;
}

function ConnectConfigBar() {
    const [message, setMessage] = useState<string>('');
    const [error, setError] = useState<string>('');

    const {
        workflowAgentSID,
    } = useSDPPPContext();
    const {
        comfyMultiUser
    } = useSDPPPInternalContext();
    const {
        webviewAgentSID,
        timeoutError,
        loadError,
        toggleWebviewDialog,
    } = useSDPPPWebview();
    const agentConfigDialogRef = useRef<HTMLDialogElement>(null);

    const {
        ssid,
        lastError,
        progress,
        executingNodeTitle,
        queueSize,
    } = useAgentState(workflowAgentSID);
    const { loggedInUsername, hasAuthingLogin, isLogin } = useSDPPPLoginContext();

    let queueText = workflowAgentSID && queueSize ? `(${queueSize})` : '';

    useEffect(() => {
        if (!workflowAgentSID) {
            if (comfyMultiUser && !photoshopStore.data.comfyUserToken) {
                setMessage(i18n('--multi-user Not Login!'));
            } else if (timeoutError || loadError) {
                setError(i18n('Error: {0}', loadError || i18n('timeout')));
            }

        } else if (workflowAgentSID) {
            if (progress) {
                setMessage(`(${progress}% - ${executingNodeTitle}...)`);
            } else {
                setMessage('');
                setError('');
            }
        }
    }, [workflowAgentSID, lastError, progress, executingNodeTitle, timeoutError, loadError, comfyMultiUser]);

    let runnerName = '';
    if (webviewAgentSID == workflowAgentSID) {
        runnerName = i18n('PS Webview');
    } else if (workflowAgentSID && ssid) {
        runnerName = i18n('Browser {0}', ssid);
    } else {
        runnerName = i18n('Loading...');
    }

    return <div className="connect-configuration" onClick={() => {
        agentConfigDialogRef.current?.show();
    }}>
        <dialog ref={agentConfigDialogRef} style={{
            margin: '0',
            width: '480px',
            height: '540px',
            padding: '8px'
        }} onClick={(e) => {
            e.stopPropagation();
        }}>
            <AgentConfigDialog onRequestLogin={async () => {
                agentConfigDialogRef.current?.close();
                await new Promise(resolve => setTimeout(resolve, 300));
                toggleWebviewDialog();
            }} />
        </dialog>
        <div className="connect-config-content">
            {hasAuthingLogin ? <span>用户名：{isLogin ? loggedInUsername : '未登录'}</span> : <span>⏵ {i18n('Runner')}: {runnerName} {queueText}</span>}
            {error && <span className="connect-config-error">{error}</span>}
            {!error && message && <span className="connect-config-message">{message}</span>}
        </div>
        <div className="connect-config-actions">
            <CogIcon size={.8} />
        </div>

        {progress ? <div className="connect-config-progress" style={{ width: `${progress}%` }}></div> : ''}
    </div>
}
