import React from "react";
import { useSDPPPInternalContext } from "../../contexts/sdppp-internal";
import { SDPPPWebpageInstance } from "../../hooks/WebpageList.mts";

interface WebPageListItemProps {
    pageInstance: SDPPPWebpageInstance
}

const WebPageListItem: React.FC<WebPageListItemProps> = ({
    pageInstance
}) => {
    const {
        autoRunning,
        workflowAgentSID,
        setWorkflowAgentSID,
    } = useSDPPPInternalContext();

    const isWorkflowAgent = workflowAgentSID == pageInstance.sid;
    const isAutoRunning = autoRunning?.value == pageInstance.sid;

    return (
        <div
            className={`agent-list-item${isWorkflowAgent ? ' selected' : ''}${isWorkflowAgent || isAutoRunning ? ' checked' : ''}`}
            onClick={() => setWorkflowAgentSID(isWorkflowAgent ? '' : pageInstance.sid)}
        >
            <span>● [{pageInstance.ssid}] {pageInstance.title}</span>
            {/* <span>● [{pageInstance.ssid}] {pageInstance.lastError ? pageInstance.lastError?.replace('sdppp PS side error:', '') : pageInstance.title}</span> */}
        </div>
    );
}

export default WebPageListItem;
