import React from 'react';

const DEFAULT_DATA = {
    "sponsors": [
        {
            "name": "四喜AI",
            "url": "https://v.douyin.com/hD2X7S717uw/"
        },
        {
            "name": "沐沐AI",
            "url": "https://v.douyin.com/k6yKDEcVgP8/"
        }
    ],
    "links": [
        {
            "name": "猫咪老师Reimagined",
            "url": "https://www.xiaohongshu.com/user/profile/59f1fcc411be101aba7f048f"
        },
        {
            "name": "来真的",
            "url": "https://space.bilibili.com/590784254"
        },
        {
            "name": "哑狗Egao",
            "url": "https://space.bilibili.com/284721975"
        }
    ],
    "community": {
        "en": [
            {
                "name": "Github",
                "url": "https://github.com/zombieyang/sd-ppp"
            },
            {
                "name": "Discord",
                "url": "https://discord.gg/9HeGjDvEmn"
            },
            {
                "name": "Youtube",
                "url": "https://www.youtube.com/@Github-Zombeeyang/videos"
            }
        ],
        "zhcn": [
            {
                "name": "Github",
                "url": "https://github.com/zombieyang/sd-ppp"
            },
            {
                "name": "QQ频道",
                "url": "https://pd.qq.com/s/5m42umo28"
            },
            {
                "name": "Bilibili",
                "url": "https://space.bilibili.com/44908313"
            }
        ]
    },
    "cloud": {
        "en": [],
        "zhcn": [
            {
                "name": "Cephalon",
                "url": "https://cephalon.cloud/share/register-landing?invite_id=m95SDj",
                "icon": "https://cephalon.cloud/favicon.ico",
                "color": "#000000"
            },
            {
                "name": "晨羽智云",
                "url": "https://www.chenyu.cn/console/login?invitationCode=BUD913",
                "icon": "https://www.chenyu.cn/favicon.ico",
                "color": "#f3ac40"
            }
        ]
    }
}
// end DEFAULT_DATA

// 尝试从localStorage获取数据
function getDataFromLocalStorage() {
    try {
        const storedData = localStorage.getItem('sponsorData');
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.warn('Failed to parse sponsor data from localStorage:', error);
    }
    return null;
}

// 将数据保存到localStorage
function saveDataToLocalStorage(data: any) {
    try {
        localStorage.setItem('sponsorData', JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save sponsor data to localStorage:', error);
    }
}

// 创建一个全局变量来存储数据，确保只请求一次
let sponsorDataPromise: Promise<any> | null = null;

export function useSponsor(): { data: {
    sponsors: {
        name: string;
        url: string;
    }[];
    links: {
        name: string;
        url: string;
    }[];
    community: {
        en: {
            name: string;
            url: string;
        }[];
        zhcn: {
            name: string;
            url: string;
        }[];
    };
    cloud: {
        en: {
            name: string;
            url: string;
            icon: string;
            color: string;
        }[];
        zhcn: {
            name: string;
            url: string;
            icon: string;
            color: string;
        }[];
    };
} } {
    // 如果已经有一个请求在进行中，直接返回该Promise
    if (!sponsorDataPromise) {
        // 尝试从localStorage获取数据
        const cachedData = getDataFromLocalStorage();
        
        // 创建一个新的Promise，同时请求两个源
        sponsorDataPromise = new Promise((resolve) => {
            // 创建一个标志，用于确保只解析一次
            let resolved = false;

            // 从Gitee获取数据
            fetch("https://gitee.com/zombieyang/sd-ppp/raw/main/sponsors.json")
                .then(response => {
                    if (!response.ok) throw new Error('Gitee fetch failed');
                    return response.json();
                })
                .then(data => {
                    if (!resolved) {
                        resolved = true;
                        // 保存到localStorage
                        saveDataToLocalStorage(data);
                        resolve(data);
                    }
                })
                .catch(error => {
                    console.warn('Failed to fetch from Gitee:', error);
                });

            // 从GitHub获取数据
            fetch("https://raw.githubusercontent.com/zombieyang/sd-ppp/refs/heads/main/sponsors.json")
                .then(response => {
                    if (!response.ok) throw new Error('GitHub fetch failed');
                    return response.json();
                })
                .then(data => {
                    if (!resolved) {
                        resolved = true;
                        // 保存到localStorage
                        saveDataToLocalStorage(data);
                        resolve(data);
                    }
                })
                .catch(error => {
                    console.warn('Failed to fetch from GitHub:', error);
                });

            // 设置一个超时，如果两个请求都失败，则使用缓存数据或默认数据
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    if (cachedData) {
                        resolve(cachedData);
                    } else {
                        resolve(DEFAULT_DATA);
                    }
                }
            }, 15000); // 15秒超时
        });
    }

    // 使用React的useState来存储数据
    const [data, setData] = React.useState(() => {
        // 初始化时尝试从localStorage获取数据
        const cachedData = getDataFromLocalStorage();
        return cachedData || DEFAULT_DATA;
    });

    React.useEffect(() => {
        // 确保sponsorDataPromise不为null
        if (sponsorDataPromise) {
            sponsorDataPromise
                .then(result => {
                    setData(result);
                })
                .catch(error => {
                    console.error('Error in useSponsor:', error);
                    // 出错时尝试使用缓存数据
                    const cachedData = getDataFromLocalStorage();
                    setData(cachedData || DEFAULT_DATA);
                });
        }
    }, []);

    return { data };
}
