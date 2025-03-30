import { useMemo } from "react";
import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { About } from "./About";
import { AddressBar } from "./AddressBar";
import { WorkflowEditPhotoshop } from "./WorkflowEditPhotoshop";
import SDPPPErrorBoundary from "./SDPPPErrorBoundary";

interface SDPPPProps {
    renderContent: (
        connectState: 'connected' | 'disconnected' | 'connecting',
        addressBar: typeof AddressBar,
        workflowEditor: typeof WorkflowEditPhotoshop
    ) => React.ReactNode
}

export function SDPPP({
    renderContent
}: SDPPPProps) {
    const { 
        connectState
    } = useSDPPPInternalContext();

    const renderedContent = useMemo(() => {
        return renderContent(connectState, AddressBar, WorkflowEditPhotoshop);
    }, [connectState]);

    return (
        <>
            <SDPPPErrorBoundary>    
                {renderedContent}
            </SDPPPErrorBoundary>
            {connectState != 'connected' && <About />}
        </>
    );
}