import React from "react";
import i18n from "../../../../../src/common/i18n.mjs";
import WebPageListItem from "./WebPageListItem";
import { useSDPPPWebpageList } from "../../hooks/WebpageList.mts";
import { useSDPPPInternalContext } from "../../contexts/sdppp-internal";
import { useSDPPPWebview } from "../../contexts/webview";

const WebPageList: React.FC = () => {
    const {
        workflowAgentSID,
        setWorkflowAgentSID,
        backendURL,
    } = useSDPPPInternalContext();
    const {
        webviewAgentSID
    } = useSDPPPWebview();

    const { pageInstances } = useSDPPPWebpageList();
    const { timeoutError } = useSDPPPWebview();

    return (
        <>
            {
                timeoutError ?
                    <div className="client-panel-title">
                        {i18n('Webview load timeout, please switch to a different runner')}
                    </div>
                    : <div className="client-panel-title">
                        {i18n('Runner')} ({backendURL})
                    </div>
            }
            <sp-label>{i18n('Open ComfyUI in the browser to see more options')}</sp-label>
            <div className="agent-list">
                <div
                    className={`agent-list-item${workflowAgentSID == webviewAgentSID ? ' selected' : ''}`}
                    onClick={() => setWorkflowAgentSID(webviewAgentSID)}
                >
                    <span>● {i18n("PS Webview")}</span>
                </div>
                {pageInstances.map((item) => (
                    <WebPageListItem key={item.sid} pageInstance={item} />
                ))}
            </div>
        </>
    );
};

export { WebPageList };
