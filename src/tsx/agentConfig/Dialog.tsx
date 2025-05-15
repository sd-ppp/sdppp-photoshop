import i18n from "../../../../../src/common/i18n.mts";
import { ComfyMultiUserLogin } from "./ComfyMultiUserLogin";
import { ComfyOrgLogin } from "./ComfyOrgLogin";
import { WebPageList } from "./WebPageList";

export function AgentConfigDialog({onRequestLogin}: {onRequestLogin: () => void}) {
    return <div className="client-panel">
        <WebPageList />
        <div className="app-login-container">
            <div className="client-panel-title">
                {i18n('Login/Auth')}
            </div>
            <ComfyMultiUserLogin onRequestLogin={onRequestLogin} />
            <ComfyOrgLogin />
        </div>
    </div>
}

// let agentConfigDialog: HTMLDialogElement | null = null;

// function createDialog() {
//     const dialog = document.createElement('dialog')
//     dialog.className = 'sdppp-webview'
//     dialog.style.padding = '0'
//     dialog.style.margin = '0'
//     dialog.style.width = '480px'
//     dialog.style.height = '540px'
//     dialog.style.padding = '8px'
//     document.body.appendChild(dialog)
//     agentConfigDialog = dialog;

//     const root = createRoot(dialog);
//     root.render(<AgentConfigDialog />);
  
//     // const webview = document.createElement('webview')
//     // webview.style.position = 'relative';
//     // webview.style.width = '1024px'
//     // webview.style.height = '768px'
//     // dialog.appendChild(webview)
//     // agentDialogWebview = webview;
  
//     return dialog
//   }

// export function showAgentConfigDialog() {
//     if (!agentConfigDialog) {
//         createDialog()
//     }
//     agentConfigDialog?.showModal()
// }
