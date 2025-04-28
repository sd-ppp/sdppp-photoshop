import { useCallback } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopStore } from "../logics/ModelDefines.mts";
import { ComfyMultiUserLogin } from "./ComfyMultiUserLogin";
import { useSDPPPWebview } from "../contexts/webview";
import { shell } from "uxp";
import { useStore } from "../../../../src/common/store/store-hooks.mts";
import i18n, { getI18nLocale } from "../../../../src/common/i18n.mts";
import { useSponsor } from "src/hooks/UseSponsor.mjs";

export function Promote() {
    const { state: photoshopStoreData } = useStore(photoshopStore, ['/uname', '/comfyUser'])
    const internalContext = useSDPPPInternalContext();
    const { toggleWebviewDialog } = useSDPPPWebview();

    const onRequestLogin = useCallback(() => {
        toggleWebviewDialog();
    }, [toggleWebviewDialog])

    return (
        <div className="promote-bar">
            <CloudPromote />
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

function CloudPromote() {
    const { data: sponsorData } = useSponsor();
    const cloud = sponsorData.cloud[getI18nLocale() == 'zhcn' ? 'zhcn' : 'en'];
    if (!cloud || cloud.length == 0) return null;
    return <div className="cloud-promote-bar">
        <span className="cloud-promote-bar-left">{i18n('Cloud')}</span>
        <span className="cloud-promote-bar-right">
            {cloud.map((item) => (
                <span
                    style={{ borderColor: item.color }}
                    onClick={() => {
                        shell.openExternal(item.url);
                    }}
                >
                    <img src={item.icon} />{item.name}
                </span>
            ))}
        </span>
    </div>

}