import { useSDPPPComfyCaller } from "src/entry.mjs";
import i18n from "../../../../../src/common/i18n.mts";
import { useStore } from "../../../../../src/common/store/store-hooks.mts";
import { useSDPPPInternalContext } from "../../contexts/sdppp-internal";

export function ComfyOrgLogin() {
    const { workflowAgent } = useSDPPPInternalContext();
    const { state } = useStore(workflowAgent, ['/comfyOrgAPIKey', '/comfyOrgLoggedIn'])
    const { setComfyOrgAPIKey } = useSDPPPComfyCaller();

    if (!state) {
        return null;
    }
    if (state.comfyOrgLoggedIn && !state.comfyOrgAPIKey) {
        return (
            <div className="login-block">
                <div className="api-key-title">ComfyOrg API Key</div>
                <div>{i18n('Logged in by email/password')}</div>
            </div>
        )
    }

    return (
        <div className="login-block">
            <div className="api-key-title">ComfyOrg API Key</div>
            <div className="logout-btn action-button" onClick={() => {
                const apiKey = prompt(i18n('Please input API key (will reload Runner)'));
                if (apiKey) {
                    setComfyOrgAPIKey(apiKey);
                }
            }}>
                {i18n('Set API Key')}
            </div>
        </div>
    )
}
