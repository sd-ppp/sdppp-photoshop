import i18n from "../../../../../src/common/i18n.mts";
import { useSDPPPLoginContext } from "src/contexts/login";
import { sdpppX } from "../../../../../src/common/sdpppX.mts";

export function AuthingLogin() {
    const { loggedInUsername, logout } = useSDPPPLoginContext();

    return (
        <div className="login-block">
            <div className="api-key-title">{sdpppX['插件名字']} ID: {loggedInUsername || '未登录'}</div>
            <div className="logout-btn action-button" onClick={() => {
                logout();
            }}>
                {loggedInUsername ? i18n('Logout') : i18n('Login')}
            </div>
        </div>
    )
}
