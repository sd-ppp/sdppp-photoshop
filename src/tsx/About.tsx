import { useEffect, useRef } from 'react';
import i18n from "../../../src/common/i18n.mts";

export let aboutComponentShowTimeSum = 0;
let lastStartTime = 0;

export function About() {
    const persistentDivRef = useRef<HTMLDivElement>(null);

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

            webview.setAttribute('src', "./sdppp.html");
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

    return <div className="about-card" style={{ position: 'relative' }}>
        {
            false
                ? (
                    <>
                        <div className="about-card-sections about-card-title">
                            <a href="https://github.com/zombieyang/sd-ppp/blob/main/LICENSE">LICENSE: BSD3-Clause</a>
                        </div>
                        <sp-divider></sp-divider>
                        <h2>{i18n('Sponsors')}</h2>
                        <div className="about-card-sections about-card-sponsors">
                            <a href="https://www.douyin.com/user/MS4wLjABAAAAge-jhN-wHFrwqHneTDIIun6NKeAnDbo9loqCjrtyaVBu2zWCm2a2NhhbeF15pTbF">沐沐AI</a>
                        </div>
                        <sp-divider></sp-divider>
                        <h2>{i18n('Links')}</h2>
                        <div className="about-card-sections about-card-friends-links">
                            <a href="https://www.xiaohongshu.com/user/profile/59f1fcc411be101aba7f048f">猫咪老师Reimagined</a>
                            <a href="https://space.bilibili.com/590784254">来真的</a>
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
            <a href="https://github.com/zombieyang/sd-ppp">Github</a>
            <a href={i18n('https://www.youtube.com/@Github-Zombeeyang/videos')}>{i18n('Youtube')}</a>
            <a href={i18n('https://discord.gg/9HeGjDvEmn')}>{i18n('Discord')}</a>
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