import { photoshopPageStoreMap, photoshopStore } from "../../logics/ModelDefines.mts"
import { useEffect, useState } from "react"
import { useSDPPPComfyCaller } from "../../hooks/ComfyCaller.mts"
import { useStore } from "../../../../../src/common/store/store-hooks.mts"
import i18n from "../../../../../src/common/i18n.mts"
import { sdpppX } from "../../../../../src/common/sdpppX.mts"
import { useSDPPPInternalContext } from "../../contexts/sdppp-internal"
import { useSDPPPWebview } from "../../contexts/webview"

interface ComfyLoginProps {
    onRequestLogin?: () => void,
}
export function ComfyMultiUserLogin(props: ComfyLoginProps) {
    const { state: photoshopStoreData } = useStore(photoshopStore, ['/comfyUserToken'])
    const { logout } = useSDPPPComfyCaller();
    const { workflowAgentSID, workflowAgent, comfyMultiUser } = useSDPPPInternalContext();
    const { resetWebview } = useSDPPPWebview();
    const [requestedLogin, setRequestedLogin] = useState(false);

    useEffect(() => {
        if (!workflowAgent) {
            photoshopStore.setComfyUserToken('');
            return;
        }
        const callback = (cur: string, prev: string) => {
            const prevPhotoshopStoreToken = photoshopStoreData?.comfyUserToken;
            photoshopStore.setComfyUserToken(cur);
            if (prevPhotoshopStoreToken == '' && requestedLogin) {
                resetWebview();
                setRequestedLogin(false);
            }
        }
        workflowAgent.subscribe('/comfyUserToken', callback)
        callback(workflowAgent.data.comfyUserToken, '');
        return () => {
            workflowAgent && workflowAgent.unsubscribe(callback)
        }
    }, [workflowAgent, requestedLogin, resetWebview])

    if (!comfyMultiUser) {
        return null;
    }
    if (!sdpppX.enableMU && comfyMultiUser) {
        return <div className="login-block">
            <div className="login-title">
                {i18n('Comfy multi-user: ')}
            </div>
            <div>
                {i18n('ComfyUI with --multi-user is only available for sponsors')}
            </div>
        </div>
    }

    const isLoggedIn = workflowAgent && photoshopStoreData?.comfyUserToken;
    const userName = photoshopStoreData?.comfyUserToken?.split('_')[0] || '';
        
    return (
        <div className="login-block">
            <div className={`login-title${!isLoggedIn ? " login-title-secondary" : ""}`}>
                {i18n('Comfy multi-user: ') + (isLoggedIn ? userName : '')}
            </div>
            {isLoggedIn ? (
                <div className="logout-btn action-button" onClick={() => {
                    logout(workflowAgentSID);
                    setRequestedLogin(false);
                }}>{i18n('Logout')}</div>
            ) : (
                <div className="logout-btn action-button" onClick={() => {
                    setRequestedLogin(true);
                    props.onRequestLogin?.();
                }}>{i18n('Not Login')}</div>
            )}
        </div>
    )
}
