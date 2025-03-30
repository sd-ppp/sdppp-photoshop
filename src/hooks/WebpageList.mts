import { useState, useEffect } from "react";
import { photoshopPageStoreMap, photoshopStore } from "../logics/ModelDefines.mts";
import { PageStoreData } from "../../../src/sdsystem/common/store/page.mts";
import { useStore } from "../../../src/common/store/store-hooks.mts";

export interface SDPPPWebpageInstance {
    sid: string,
    ssid: string,
    title: string,
    lastError: string,
    isWebview: boolean,
    isCurrentUser: boolean
}

export function useSDPPPWebpageList(): {
    pageInstances: SDPPPWebpageInstance[]
} {
    const [pageInstances, setPageInstances] = useState<Record<string, PageStoreData>>({});

    const { state: photoshopStoreState } = useStore(photoshopStore, '/comfyUserToken')
    const photoshopStoreComfyUserToken = photoshopStoreState?.comfyUserToken;


    useEffect(() => {
        let unmounted = false;

        const pageInstancesCallback = (sid: string, cur: PageStoreData, prev: PageStoreData) => {
            if (unmounted) return;
            setPageInstances(prevState => {
                const newPageInstances = { ...prevState };
                if (cur == null) {
                    delete newPageInstances[sid];
                } else {
                    newPageInstances[sid] = cur;
                }
                return newPageInstances;
            });
        }
        photoshopPageStoreMap.subscribe('/', pageInstancesCallback);

        return () => {
            unmounted = true;
            photoshopPageStoreMap.unsubscribe(pageInstancesCallback);
        };
    }, []);

    return {
        pageInstances: Object
            .entries(pageInstances)
            .map(([sid, item]) => {
                return {
                    sid,
                    ssid: sid.slice(0, 4),
                    title: item.title,
                    lastError: item.lastError,
                    isWebview: !!item.webviewFromSid,
                    isCurrentUser: !item.comfyUserToken || item.comfyUserToken == photoshopStoreComfyUserToken
                }
            })
            .filter(item => !item.isWebview && (!photoshopStoreComfyUserToken || item.isCurrentUser))
    }
}