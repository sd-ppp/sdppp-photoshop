import { photoshopStore } from "../logics/ModelDefines.mts"
import { useEffect, useState } from "react"
import { useSDPPPInternalContext } from "../contexts/sdppp-internal"
import { useSDPPPWebview } from "../contexts/webview"
import { useSDPPPExternalContext } from "../contexts/sdppp-external"
import { useSDPPPComfyCaller } from "../hooks/ComfyCaller.mts"
import { useStore } from "../../../src/common/store/store-hooks.mts"
import i18n from "../../../src/common/i18n.mts"

interface LoginProps {
    onRequestLogin?: () => void,
}
export function ComfyLogin(props: LoginProps) {
    const { state: photoshopStoreData } = useStore(photoshopStore, ['/uname', '/comfyUser'])
    const internalContext = useSDPPPInternalContext();

    return (
        <div className="identifier-bar">
            <div className="identifier-bar-left">
                <sp-label>(Photoshop ID: {photoshopStoreData?.uname})</sp-label>
            </div>
            {
                internalContext.comfyMultiUser && <ComfyMultiUserLogin onRequestLogin={props.onRequestLogin} />
            }
        </div>
    )
}
interface ComfyLoginProps {
    onRequestLogin?: () => void,
}
export function ComfyMultiUserLogin(props: ComfyLoginProps) {
    const enableMU = (globalThis as any).sdppp.MU;
    const { state: photoshopStoreData } = useStore(photoshopStore, ['/comfyUserToken'])
    const { logout } = useSDPPPComfyCaller();
    const { workflowAgent } = useSDPPPInternalContext();
    const { workflowAgentSID } = useSDPPPExternalContext();
    const webviewContext = useSDPPPWebview();
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
                webviewContext.resetWebview();
                setRequestedLogin(false);
            }
        }
        workflowAgent.subscribe('/comfyUserToken', callback)
        callback(workflowAgent.data.comfyUserToken, '');
        return ()=> {
            workflowAgent && workflowAgent.unsubscribe(callback)
        }
    }, [workflowAgent, requestedLogin, webviewContext.resetWebview])
    if (!enableMU) {
        return '';
    }

    return (
        <div className="identifier-bar-right">
            {
                workflowAgent && photoshopStoreData?.comfyUserToken ? (
                    <>
                        <sp-label>{i18n('User: ') + photoshopStoreData?.comfyUserToken.split('_')[0]}</sp-label> 
                        <sp-label><a onClick={()=> {
                            logout(workflowAgentSID);
                            setRequestedLogin(false);
                        }}>{i18n('Logout')}</a></sp-label>
                    </>
                ) : (
                    <a onClick={() => {
                        setRequestedLogin(true);
                        props.onRequestLogin?.();
                        // editDialogShow({
                        //     999: {
                        //         id: 999,
                        //         name: 'username',
                        //         value: '',
                        //         type: 'combo',
                        //         options: {
                        //             values: users ? Object.keys(users) : []
                        //         }
                        //     }
                        // }, (form) => {
                        //     const user = form[999].value;
                        //     if (user) {
                        //         photoshopStore.setComfyUser(user);
                        //         photoshopInternalStore.setComfyUserToken(users[user]);
                        //     }
                        // }, () => { })
                    }}>{i18n('--multi-user activated, Not Login!')}</a>
                )
            }
        </div>
    )
}
