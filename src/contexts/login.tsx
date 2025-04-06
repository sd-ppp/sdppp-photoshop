import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef, useMemo } from "react";
import i18n from "../../../src/common/i18n.mts";

const verifyInterval = 15000

export type LoginResult = {
    success: true,
    token: string,
} | {
    success: false,
    message: string,
}

export type UserInfoResult = {
    data: {
        lastLogin: string,
    },
    success: true,
} | {
    message: string,
    success: false,
}

interface LogixContextType {
    loginStyle: 'invitation' | 'password' | 'none',
    loginBannerTop: ReactNode | null,
    loginBannerBottom: ReactNode | null,
    isLogin: boolean,
    logout: () => void,
    login: (username: string, password: string) => Promise<LoginResult>,
}

export const SDPPPLoginContext = createContext({} as LogixContextType);

export function SDPPPLoginProvider({
    children, 
    loginAppID, 
    loginStyle,
    loginBannerTop,
    loginBannerBottom,
}: {
    children: ReactNode, 
    loginAppID: string, 
    loginStyle?: 'invitation' | 'password',
    loginBannerTop?: ReactNode,
    loginBannerBottom?: ReactNode,
}) {
    const [isLogin, setIsLogin] = useState(!loginAppID);

    const authingLogin = useCallback(async (username: string, password: string = 'sdppp123456'): Promise<LoginResult> => {
        try {
            const response = await fetch('https://api.authing.cn/api/v3/signin', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-authing-app-id': loginAppID,
                    'x-authing-sdk-version': 'web:3.0.0'
                },
                body: JSON.stringify({
                    connection: 'PASSWORD',
                    passwordPayload: {
                        username: username, // 或使用 phone 或 username 取决于登录方式
                        password: password
                    }
                })
            });

            const data = await response.json();
            if (response.ok) {
                if (data.statusCode === 200) {
                    return {
                        success: true,
                        token: data.data.access_token // 登录成功后，本地存储的登录票据。用于下次启动时的验证
                    };
                } else if (data.statusCode === 403) {
                    return {
                        success: false,
                        message: i18n('Verification Error'),
                    };
                }
            } else {
                return {
                    success: false,
                    message: JSON.stringify(data),
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.toString(),
            };
        }
        return {
            success: false,
            message: '登录失败',
        }
    }, [])

    const verifyToken = useCallback(async (token: string) => {
        if (!token) {
            throw new Error('Token is required');
        }
        const tokenType = 'access_token'
        // 构建请求URL和参数
        const url = `https://api.authing.cn/oidc/token/introspection`;

        // 构建表单数据 - 不使用URLSearchParams
        const formData = `token=${encodeURIComponent(token)}&token_type_hint=${encodeURIComponent(tokenType)}&client_id=${encodeURIComponent(loginAppID)}`;

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error(`Verification failed with status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }, [])

    const getUserInfo = useCallback(async (token: string): Promise<UserInfoResult> => {
        try {
            const response = await fetch('https://api.authing.cn/api/v3/get-profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-authing-app-id': loginAppID
                }
            });

            const data = await response.json();
            if (data.statusCode === 200) {
                return {
                    data: data.data,
                    success: true,
                };
            } else {
                return {
                    message: data.message,
                    success: false,
                };
            }
        } catch (error: any) {
            return {
                success: false,
                message: error,
            };
        }
    }, [])

    async function login(username: string, password: string = 'sdppp123456') {
        const loginResult = await authingLogin(username, password)
        if (loginResult.success) {
            const userInfo = await getUserInfo(loginResult.token)
            if (userInfo.success) {
                localStorage.setItem('token', loginResult.token)
                localStorage.setItem('lastLogin', new Date(userInfo.data.lastLogin).getTime().toString())
                setIsLogin(true)
            }
        }
        return loginResult
    }

    async function verify(token: string) {
        if (!localStorage.getItem('lastLogin')) {
            return false
        }
        const verifyResult = await verifyToken(token)
        if (verifyResult.active) {
            const userInfo = await getUserInfo(token)
            if (userInfo.success) {
                const remoteLastLogin = new Date(userInfo.data.lastLogin).getTime().toString()
                const localLastLogin = localStorage.getItem('lastLogin')
                return remoteLastLogin === localLastLogin;

            } else {
                return false;
            }
        }
        return false
    }
    useEffect(() => {
        if (!isLogin) {
            let usertoken = localStorage.getItem('token')
            if (!usertoken) return;
            verify(usertoken)
                .then((result: boolean) => {
                    if (result) {
                        setIsLogin(true)
                    }
                })
        } else {
            const interval = setInterval(() => {
                const usertoken = localStorage.getItem('token')
                if (!usertoken) return;
                verify(usertoken)
                    .then((result: boolean) => {
                        if (!result) {
                            setIsLogin(false)
                        }
                    })
            }, verifyInterval)
            return () => {
                clearInterval(interval)
            }
        }
    }, [isLogin])

    return <SDPPPLoginContext.Provider value={{
        loginStyle: loginStyle || 'none',
        loginBannerBottom: loginBannerBottom || null,
        loginBannerTop: loginBannerTop || null,
        isLogin,
        logout: () => {
            localStorage.removeItem('token')
            setIsLogin(false)
        },
        login,
    }}>
        {children}
    </SDPPPLoginContext.Provider>;
}
// 自定义Hook用于访问Context
export function useSDPPPLoginContext() {
    const context = useContext(SDPPPLoginContext);
    if (!context) {
        throw new Error("useSDPPPLogin must be used within a SDPPPLoginProvider");
    }
    return context;
}

