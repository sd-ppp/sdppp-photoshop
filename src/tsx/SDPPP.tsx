import { useSDPPPInternalContext } from "../contexts/sdppp-internal";
import { About } from "./About";
import { AddressBar } from "./AddressBar";
import { WorkflowEditPhotoshop } from "./WorkflowEditPhotoshop";
import SDPPPErrorBoundary from "./SDPPPErrorBoundary";
import { useSDPPPLoginContext } from "../contexts/login";
import { Login } from "./Login";

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

    const { isLogin } = useSDPPPLoginContext();

    return (
        <div className="sdppp-container" style={connectState !== 'connected' ? {
            height: '100vh',
        } : {}}>
            <SDPPPErrorBoundary>
                {
                    isLogin ?
                        renderContent(connectState, AddressBar, WorkflowEditPhotoshop) :
                        <Login />
                }
            </SDPPPErrorBoundary>
            {connectState != 'connected' && <About />}
        </div>
    );
}