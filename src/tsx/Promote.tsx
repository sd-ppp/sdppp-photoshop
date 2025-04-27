import { useCallback } from "react";
import { getI18nLocale } from "../../../src/common/i18n.mts";
import { useStore } from "../../../src/common/store/store-hooks.mts";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { photoshopStore } from "../logics/ModelDefines.mts";
import { ComfyMultiUserLogin } from "./ComfyMultiUserLogin";
import { useSDPPPWebview } from "../contexts/webview";
import { shell } from "uxp";

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
    if (getI18nLocale() !== 'zhcn') return null;
    return <div className="cloud-promote-bar">
        <span className="cloud-promote-bar-left">推荐云端：</span>
        <span className="cloud-promote-bar-right">
            <span
                style={{ borderColor: 'black' }}
                onClick={() => {
                    shell.openExternal('https://cephalon.cloud/share/register-landing?invite_id=m95SDj');
                }}
            >
                <img src="./icons/cephalon.ico" />Cephalon
            </span>
            <span
                style={{ borderColor: '#f3ac40', color: 'var(--uxp-host-text-color)' }}
                onClick={() => {
                    shell.openExternal('https://www.chenyu.cn/console/login?invitationCode=BUD913');
                }}
            >
                <img src="./icons/chenyu.ico" />晨羽智云
            </span>
        </span>
    </div>

}