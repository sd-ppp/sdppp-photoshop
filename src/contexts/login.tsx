import { useEffect, useState, createContext, useContext, ReactNode, useCallback, useRef, useMemo } from "react";
import i18n from "../../../../src/common/i18n.mts";

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
    hasAuthingLogin: boolean,
    loginStyle: 'invitation' | 'password' | 'trialable-password' | 'none',
    loginBannerTop: ReactNode | null,
    loginBannerBottom: ReactNode | null,
    isLogin: boolean,
    loggedInUsername: string,
    logout: () => void,
    login: (username: string, password: string) => Promise<LoginResult>,
    setIsTrialing: (isTrialing: boolean) => void,
    isTrialing: boolean,
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
    const [isTrialing, setIsTrialing] = useState(false);

    const authingLogin = useCallback(async (username: string, password: string = 'sdppp123456'): Promise<LoginResult> => {
        try {
            const response = await fetch('https://tophotel.top/api/users/loginByUsername', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "username": username,
                    "password": password
                })
            });

            const data = await response.json();
            if (response.ok) {
                return {
                    success: true,
                    token: data.data.token // 登录成功后，本地存储的登录票据。用于下次启动时的验证
                };

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
    }, [])

    const verifyToken = useCallback(async (token: string) => {
        if (!token) {
            throw new Error('Token is required');
        }
        // 构建请求URL和参数
        const url = `https://tophotel.top/api/users/checkToken`;

        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': `Bearer ${token}`
                } 
            });

            if (!response.ok) {
                throw new Error(`Verification failed with status: ${response.status}`);
            }

            return (await response.json()).status == 0;
        } catch (error) {
            console.error('Token verification error:', error);
            throw error;
        }
    }, [])

    const getUserInfo = useCallback(async (token: string): Promise<UserInfoResult> => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return {
            data: {
                lastLogin: "0",
            },
            success: true,
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
        if (verifyResult) {
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
        } else if (loginAppID) { 
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
        hasAuthingLogin: !!loginAppID,
        loginStyle: loginStyle || 'none',
        loginBannerBottom: loginBannerBottom || null,
        loginBannerTop: loginBannerTop || null,
        isLogin,
        loggedInUsername: isLogin ? localStorage.getItem('last-username') || '' : '',
        logout: () => {
            localStorage.removeItem('token')
            setIsLogin(false)
            setIsTrialing(false)
        },
        login,
        setIsTrialing,
        isTrialing,
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

