import React from "react";
import i18n from "../../../../../src/common/i18n.mjs";
import WebPageListItem from "./WebPageListItem";
import { useSDPPPWebpageList } from "../../hooks/WebpageList.mts";
import AgentIcon from "../../../../photoshop/src/tsx/icons/AgentIcon";
import { useSDPPPInternalContext } from "../../contexts/sdppp-internal";
import { useSDPPPWebview } from "../../contexts/webview";

const WebPageList: React.FC = () => {
    const {
        workflowAgentSID,
        setWorkflowAgentSID,
    } = useSDPPPInternalContext();
    const {
        webviewAgentSID
    } = useSDPPPWebview();

    const { pageInstances } = useSDPPPWebpageList();

    return (
        <>
            <div className="client-panel-title">
                {i18n('Runner')}
            </div>
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
