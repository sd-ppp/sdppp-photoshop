import { useEffect, useRef } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { DEFAULT_BACKEND_URL } from "../contexts/sdppp-internal";

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
    </>;
}