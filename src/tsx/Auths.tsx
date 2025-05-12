import { useCallback } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopStore } from "../logics/ModelDefines.mts";
import { ComfyMultiUserLogin } from "./ComfyMultiUserLogin";
import { useSDPPPWebview } from "../contexts/webview";
import { useStore } from "../../../../src/common/store/store-hooks.mts";

export function Auths() {
    const { state: photoshopStoreData } = useStore(photoshopStore, ['/uname', '/comfyUser'])
    const internalContext = useSDPPPInternalContext();
    const { toggleWebviewDialog } = useSDPPPWebview();

    const onRequestLogin = useCallback(() => {
        toggleWebviewDialog();
    }, [toggleWebviewDialog])

    return (
        <div className="auths-bar">
            <div className="identifier-bar">
                <div className="identifier-bar-left">
                    <sp-label>(Photoshop ID: {photoshopStoreData?.uname})</sp-label>
                </div>
                {
                    internalContext.comfyMultiUser && <ComfyMultiUserLogin onRequestLogin={onRequestLogin} />
                }
            </div>
        </div>
    )
}