import './polyfill';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './tsx/App.jsx'

import './index.css'
import './sdk/sdppp-ps-sdk.js'

declare const sdpppSDK: any;
sdpppSDK.init();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <App />
    </StrictMode>,
)
