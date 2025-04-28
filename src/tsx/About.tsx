import { useEffect, useMemo, useRef } from 'react';
import i18n, { getI18nLocale } from "../../../../src/common/i18n.mts";
import { useSDPPPLoginContext } from '../contexts/login';
import { useSponsor } from 'src/hooks/UseSponsor.mjs';
export let aboutComponentShowTimeSum = 0;
let lastStartTime = 0;

export function About() {
    const persistentDivRef = useRef<HTMLDivElement>(null);
    const { loginStyle } = useSDPPPLoginContext();
    const { data: sponsorData } = useSponsor();

    useEffect(() => {
        let detectedMinHeight = Infinity;
        let detectedMinWidth = Infinity;
        let ended = false;
        if (persistentDivRef.current) {
            const webview = document.createElement('webview');
            function start(event: any) {
                if (!lastStartTime) {
                    lastStartTime = Date.now();
                }
            }
            webview.addEventListener('loadstart', start);
            webview.addEventListener('loadstop', start);
            webview.addEventListener('loaderror', start);

            webview.setAttribute('src', "./_.html");
            webview.style.width = '1px';
            webview.style.height = '1px';
            persistentDivRef.current.appendChild(webview);
        }
        function minHeightWidthDetection() {
            const boundingRect = persistentDivRef
                .current?.parentElement?.parentElement?.getBoundingClientRect();
            if (boundingRect?.height && boundingRect?.width) {
                detectedMinHeight = Math.min(detectedMinHeight, boundingRect.height);
                detectedMinWidth = Math.min(detectedMinWidth, boundingRect.width);
            }

            if (!ended) {
                requestAnimationFrame(minHeightWidthDetection);
            }
        }
        requestAnimationFrame(minHeightWidthDetection);
        return () => {
            ended = true;
            if (lastStartTime) {
                aboutComponentShowTimeSum += (Date.now() - lastStartTime);
                lastStartTime = 0;
            }
            // console.log('aboutComponentShowTimeSum', aboutComponentShowTimeSum);
            // console.log('detectedMinHeight', detectedMinHeight);
            // console.log('detectedMinWidth', detectedMinWidth);
        }
    }, [persistentDivRef]);

    const community = useMemo(
        () => sponsorData.community[getI18nLocale() == 'zhcn' ? 'zhcn' : 'en'],
        [sponsorData]);

    return <div className="about-card" style={{ position: 'relative' }}>
        {
            loginStyle === 'none'
                ? (
                    <>
                        <div className="about-card-sections about-card-title">
                            <a href="https://github.com/zombieyang/sd-ppp/blob/main/LICENSE">LICENSE: BSD3-Clause</a>
                        </div>
                        <sp-divider></sp-divider>
                        <h2>{i18n('Sponsors')}</h2>
                        <div className="about-card-sections about-card-sponsors">
                            {sponsorData.sponsors.map((sponsor) => (
                                <a href={sponsor.url} key={sponsor.name}>{sponsor.name}</a>
                            ))}
                        </div>
                        <sp-divider></sp-divider>
                        <h2>{i18n('Links')}</h2>
                        <div className="about-card-sections about-card-friends-links">
                            {sponsorData.links.map((link) => (
                                <a href={link.url} key={link.name}>{link.name}</a>
                            ))}
                        </div>
                        <sp-divider></sp-divider>
                        <h2>SD-PPP {i18n('Community')}</h2>
                    </>
                )
                : (
                    <>
                        <div className="about-card-sections about-card-title">
                            <h4>{i18n('This plugin is based on sd-ppp')}</h4>
                        </div>
                        <div className="about-card-sections about-card-title">
                            <h6>{i18n('And follows its open source license:')}</h6>
                        </div>
                        <div className="about-card-sections about-card-title">
                            <a href="https://github.com/zombieyang/sd-ppp/blob/main/LICENSE">LICENSE: BSD3-Clause</a>
                        </div>
                    </>
                )
        }
        <div className="about-card-sections about-card-links">
            {community.map((item) => (
                <a href={item.url} key={item.name}>{item.name}</a>
            ))}
            <div style={{
                width: 1,
                height: 1,
                position: 'absolute',
                right: 0,
                bottom: 0,
                opacity: 0.1,
            }} ref={persistentDivRef} className="persistent-div"></div>
        </div>
    </div>;
}