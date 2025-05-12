import React, { useEffect, useState } from 'react';

// 定义接口
interface SponsorItem {
    name: string;
    url: string;
}

interface CloudItem extends SponsorItem {
    icon: string;
    color: string;
}

interface CommunitySection {
    en: SponsorItem[];
    zhcn: SponsorItem[];
}

interface CloudSection {
    en: CloudItem[];
    zhcn: CloudItem[];
}

interface License {
    name: string;
    url: {
        en: string;
        zhcn: string;
    };
}

interface Site {
    en: {
        name: string;
        url: string;
    };
    zhcn: {
        name: string;
        url: string;
    };
}

interface SponsorData {
    site?: Site;
    LICENSE: License;
    sponsors: SponsorItem[];
    links: SponsorItem[];
    community: CommunitySection;
    cloud: CloudSection;
}

// 默认数据
const DEFAULT_DATA: SponsorData = {
    // "site": {
    //     "en": {
    //         "name": "Site: SDPPP.com",
    //         "url": "https://github.com/zombieyang/sd-ppp"
    //     },
    //     "zhcn": {
    //         "name": "官方网站：SDPPP.com",
    //         "url": "https://gitee.com/zombieyang/sd-ppp"
    //     }
    // },
    "LICENSE": {
        "name": "BSD3-Clause",
        "url": {
            "en": "https://github.com/zombieyang/sd-ppp/blob/main/LICENSE",
            "zhcn": "https://gitee.com/zombieyang/sd-ppp/blob/main/LICENSE"
        }
    },
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
                "name": "晨羽智云",
                "url": "https://www.chenyu.cn/console/login?invitationCode=BUD913",
                "icon": "icons/chenyu.ico",
                "color": "var(--uxp-host-text-color-secondary)"
            },
            {
                "name": "Cephalon",
                "url": "https://cephalon.cloud/share/register-landing?invite_id=m95SDj",
                "icon": "icons/cephalon.ico",
                "color": "var(--uxp-host-text-color-secondary)"
            }
        ]
    }
};

// 存储键名
const STORAGE_KEY = 'sponsorData';

// 远程数据源
const DATA_SOURCES = {
    GITEE: "https://gitee.com/zombieyang/sd-ppp/raw/main/sponsors.json",
    GITHUB: "https://raw.githubusercontent.com/zombieyang/sd-ppp/refs/heads/main/sponsors.json"
};

// 超时时间（毫秒）
const TIMEOUT_MS = 5000;

/**
 * 从localStorage获取数据
 */
function getDataFromLocalStorage(): SponsorData | null {
    try {
        const storedData = localStorage.getItem(STORAGE_KEY);
        if (storedData) {
            return JSON.parse(storedData);
        }
    } catch (error) {
        console.warn('Failed to parse sponsor data from localStorage:', error);
    }
    return null;
}

/**
 * 将数据保存到localStorage
 */
function saveDataToLocalStorage(data: SponsorData): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
        console.warn('Failed to save sponsor data to localStorage:', error);
    }
}

/**
 * 验证数据格式是否符合预期
 */
function validateSponsorData(data: any): data is SponsorData {
    try {
        // 检查基本结构
        if (!data || typeof data !== 'object') {
            console.warn('Invalid sponsor data: not an object');
            return false;
        }

        // 检查LICENSE对象
        if (!data.LICENSE || typeof data.LICENSE !== 'object') {
            console.warn('Invalid sponsor data: LICENSE is not an object');
            return false;
        }

        // 检查LICENSE.name
        if (!data.LICENSE.name) {
            console.warn('Invalid sponsor data: LICENSE.name is missing');
            return false;
        }

        // 检查LICENSE.url
        if (!data.LICENSE.url || typeof data.LICENSE.url !== 'object') {
            console.warn('Invalid sponsor data: LICENSE.url is not an object');
            return false;
        }

        // 检查LICENSE.url.en
        if (!data.LICENSE.url.en) {
            console.warn('Invalid sponsor data: LICENSE.url.en is missing');
            return false;
        }

        // 检查LICENSE.url.zhcn
        if (!data.LICENSE.url.zhcn) {
            console.warn('Invalid sponsor data: LICENSE.url.zhcn is missing');
            return false;
        }

        // 检查sponsors数组
        if (!Array.isArray(data.sponsors)) {
            console.warn('Invalid sponsor data: sponsors is not an array');
            return false;
        }
        
        // 检查links数组
        if (!Array.isArray(data.links)) {
            console.warn('Invalid sponsor data: links is not an array');
            return false;
        }
        
        // 检查community对象
        if (!data.community || typeof data.community !== 'object') {
            console.warn('Invalid sponsor data: community is not an object');
            return false;
        }
        
        // 检查community.en和community.zhcn数组
        if (!Array.isArray(data.community.en) || !Array.isArray(data.community.zhcn)) {
            console.warn('Invalid sponsor data: community.en or community.zhcn is not an array');
            return false;
        }
        
        // 检查cloud对象
        if (!data.cloud || typeof data.cloud !== 'object') {
            console.warn('Invalid sponsor data: cloud is not an object');
            return false;
        }
        
        // 检查cloud.en和cloud.zhcn数组
        if (!Array.isArray(data.cloud.en) || !Array.isArray(data.cloud.zhcn)) {
            console.warn('Invalid sponsor data: cloud.en or cloud.zhcn is not an array');
            return false;
        }
        
        // 检查cloud.zhcn中的对象是否包含必要的属性
        for (const item of data.cloud.zhcn) {
            if (!item.name || !item.url || !item.icon || !item.color) {
                console.warn('Invalid sponsor data: cloud.zhcn item missing required properties');
                return false;
            }
        }
        
        return true;
    } catch (error) {
        console.warn('Error validating sponsor data:', error);
        return false;
    }
}

/**
 * 从远程获取数据
 */
async function fetchSponsorData(url: string): Promise<SponsorData | null> {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Fetch failed with status: ${response.status}`);
        }
        const data = await response.json();
        return validateSponsorData(data) ? data : null;
    } catch (error) {
        console.warn(`Failed to fetch from ${url}:`, error);
        return null;
    }
}

// 创建一个全局变量来存储数据，确保只请求一次
let sponsorDataPromise: Promise<SponsorData> | null = null;

/**
 * 获取赞助商数据的Hook
 */
export function useSponsor(): { data: SponsorData, isLoading: boolean } {
    const [isLoading, setIsLoading] = React.useState(true);
    // 如果已经有一个请求在进行中，直接返回该Promise
    if (!sponsorDataPromise) {
        // 尝试从localStorage获取数据
        const cachedData = getDataFromLocalStorage();
        
        // 创建一个新的Promise，同时请求两个源
        sponsorDataPromise = new Promise<SponsorData>((resolve) => {
            // 创建一个标志，用于确保只解析一次
            let resolved = false;

            // 从Gitee获取数据
            fetchSponsorData(DATA_SOURCES.GITEE)
                .then(data => {
                    if (!resolved && data) {
                        resolved = true;
                        // 保存到localStorage
                        saveDataToLocalStorage(data);
                        resolve(data);
                        setIsLoading(false);
                    }
                });

            // 从GitHub获取数据
            fetchSponsorData(DATA_SOURCES.GITHUB)
                .then(data => {
                    if (!resolved && data) {
                        resolved = true;
                        // 保存到localStorage
                        saveDataToLocalStorage(data);
                        resolve(data);
                        setIsLoading(false);
                    }
                });

            // 设置一个超时，如果两个请求都失败，则使用缓存数据或默认数据
            setTimeout(() => {
                if (!resolved) {
                    resolved = true;
                    if (cachedData && validateSponsorData(cachedData)) {
                        resolve(cachedData);
                        setIsLoading(false);
                    } else {
                        console.warn('Using default data as fallback');
                        resolve(DEFAULT_DATA);
                        setIsLoading(false);
                    }
                }
            }, TIMEOUT_MS);
        });
    }

    // 使用React的useState来存储数据
    const [data, setData] = React.useState<SponsorData>(() => {
        // 初始化时尝试从localStorage获取数据
        const cachedData = getDataFromLocalStorage();
        return (cachedData && validateSponsorData(cachedData)) ? cachedData : DEFAULT_DATA;
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
                    setData((cachedData && validateSponsorData(cachedData)) ? cachedData : DEFAULT_DATA);
                });
        }
    }, []);

    let [retIsLoading, setRetIsLoading] = useState(true)
    useEffect(() => {
        if (retIsLoading && !isLoading) {
            setRetIsLoading(isLoading);
        }
    }, [isLoading]);
    // return { data: DEFAULT_DATA };
    return { data, isLoading: retIsLoading };
}
