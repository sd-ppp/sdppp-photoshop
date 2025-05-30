import { useSponsor } from "src/hooks/UseSponsor.mjs";
import { getI18nLocale } from "../../../../src/common/i18n.mts";
import { useRef, useState } from "react";
import { useEffect } from "react";
import { shell } from "uxp";

export function Promote() {
    const color = document.getElementById('color_computer')?.style.color || '#777';
    const { data: sponsorData, isLoading } = useSponsor();
    const webviewRef = useRef<HTMLWebViewElement>(null);
    const [loadedError, setLoadedError] = useState(false);
    const [inited, setInited] = useState(false);
    useEffect(() => {
        if (!webviewRef.current) return;
        if (isLoading) return;
        if (inited) return;
        setInited(true);
        webviewRef.current.addEventListener('loadstop', (event) => {
            // @ts-ignore
            event.target.postMessage({
                action: 'init',
                payload: {
                    color,
                    cloud
                }
            });
        });
        webviewRef.current.addEventListener('loaderror', (event) => {
            setLoadedError(true);
        });
        webviewRef.current.addEventListener('message', (event) => {
            // @ts-ignore
            const message = event.message;
            if (!message) return;
            const data = JSON.parse(message);
            if (data.action === 'open') {
                shell.openExternal(data.payload.url);
            }
        });
    }, [webviewRef, isLoading]);
    if (isLoading || loadedError) {
        return <div style={{ height: '8px' }} />;
    }
    const src = './promote.html?color=' + color;
    const cloud = sponsorData.cloud[getI18nLocale() == 'zhcn' ? 'zhcn' : 'en'];
    if (cloud.length == 0) return null;
    return (
        <webview ref={webviewRef} className="promote-webview" style={{ width: '100%', height: '24px' }} src={src} />
    );
}

// function CloudPromote() {
//     const { data: sponsorData } = useSponsor();
//     const cloud = sponsorData.cloud[getI18nLocale() == 'zhcn' ? 'zhcn' : 'en'];
//     if (!cloud || cloud.length == 0) return null;
//     return <div className="cloud-promote-bar">
//         <span className="cloud-promote-bar-left">{i18n('Cloud')}</span>
//         <span className="cloud-promote-bar-right">
//             {cloud.map((item) => (
//                 <span
//                     key={item.name}
//                     style={{ borderColor: item.color }}
//                     onClick={() => {
//                         shell.openExternal(item.url);
//                     }}
//                 >
//                     <img src={item.icon} />{item.name}
//                 </span>
//             ))}
//         </span>
//     </div>

// }