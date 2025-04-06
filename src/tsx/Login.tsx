import { useState } from "react";
import i18n from "../../../src/common/i18n.mts";
import { useSDPPPLoginContext } from "../contexts/login.tsx";

export function Login() {
    const { login, loginStyle } = useSDPPPLoginContext()

    const [username, setUsername] = useState(localStorage.getItem('last-username') || '');
    const [password, setPassword] = useState('');
    const [loginErrorMessage, setLoginErrorMessage] = useState('');

    return (
        <div className="login-container">
            <div className="login-container-login-title">
                <img src="./icons/logo.png" alt="logo" />
                <h3>沐沐AI</h3>
            </div>
            <div className="login-container-login">
                <div className="login-form">
                    {
                        loginStyle === 'invitation' ? (
                            <div className="login-form-item">
                                <label htmlFor="username">{i18n('Invitation Code')}</label>
                                <sp-textfield
                                    type="text"
                                    id="username"
                                    placeholder={i18n('Please input invitation code')}
                                    value={username}
                                    onInput={(e: any) => setUsername(e.target.value)}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="login-form-item">
                                    <label htmlFor="username">{i18n('Username')}</label>
                                    <sp-textfield
                                        type="text"
                                        id="username"
                                        placeholder={i18n('Please input username')}
                                        value={username}
                                        onInput={(e: any) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="login-form-item">
                                    <label htmlFor="password">{i18n('Password')}</label>
                                    <sp-textfield
                                        type="password"
                                        id="password"
                                        placeholder={i18n('Please input password')}
                                        value={password}
                                        onInput={(e: any) => setPassword(e.target.value)}
                                    />
                                </div>
                            </>
                        )
                    }
                    <div className="login-error-message">
                        {loginErrorMessage}
                    </div>
                    <button
                        className="login-button"
                        onClick={async () => {
                            const result = await login(username, password)
                            if (result.success) {
                                setLoginErrorMessage('')
                                localStorage.setItem('last-username', username)
                            } else {
                                setLoginErrorMessage(result.message)
                            }
                        }}
                    >
                        {i18n('Login')}
                    </button>
                </div>
            </div>
        </div>
    )
}