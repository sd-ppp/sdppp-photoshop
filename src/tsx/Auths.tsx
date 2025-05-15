import { useCallback } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopStore } from "../logics/ModelDefines.mts";
import { ComfyMultiUserLogin } from "./agentConfig/ComfyMultiUserLogin";
import { useSDPPPWebview } from "../contexts/webview";
import { useStore } from "../../../../src/common/store/store-hooks.mts";
import { ComfyOrgLogin } from "./agentConfig/ComfyOrgLogin";

export function Auths() {
    const internalContext = useSDPPPInternalContext();
    const { toggleWebviewDialog } = useSDPPPWebview();

    const onRequestLogin = useCallback(() => {
        toggleWebviewDialog();
    }, [toggleWebviewDialog])

    return (
        <div className="auths-bar">
            <div className="identifier-bar">
                <div className="identifier-bar-left">
                    {
                        <ComfyOrgLogin />
                    }
                    {
                        internalContext.comfyMultiUser && <ComfyMultiUserLogin onRequestLogin={onRequestLogin} />
                    }
                </div>
            </div>
        </div>
    )
}