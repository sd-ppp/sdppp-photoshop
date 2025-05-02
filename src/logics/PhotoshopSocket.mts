import { Socket, SocketConstructor, SocketMixin } from "../../../../src/common/socket/Socket.mts";
import { MainStoreHolderSocket } from "../../../../src/common/socket/mixins/MainStoreHolder.mts";
import { StoreMapHolderSocket } from "../../../../src/common/socket/mixins/StoreMapHolder.mts";
import { __GLOBAL_API_LEVEL__ } from "../../../../src/common/version.mts";
// import { WorkflowCaller, WorkflowCallerSocket } 
import { photoshopPageStoreMap, photoshopStore } from "./ModelDefines.mts";
import { PhotoshopCalleeSocket } from "./socket/PhotoshopCallee.mts";
import i18n from "../../../../src/common/i18n.mts";
import { WorkflowCallerSocket } from "../../../../src/socket/WorkflowCaller.mts";
import { WorkflowCaller } from "../../../../src/socket/WorkflowCallerInterface.mjs";
import { PhotoshopCallee } from "../../../../src/socket/PhotoshopCalleeInterface.mjs";

export class PhotoshopSocket extends (SocketMixin(
    MainStoreHolderSocket(photoshopStore, 'photoshop'),
    StoreMapHolderSocket(photoshopPageStoreMap, 'comfy'),
    WorkflowCallerSocket,
    PhotoshopCalleeSocket
) as SocketConstructor<Socket & WorkflowCaller & PhotoshopCallee>) {
    constructor(backendURL: string,
        {
            setConnectState, setLastErrorMessage, setBackendURL, setComfyMultiUser
        }: {
            setConnectState: (connectState: 'connected' | 'disconnected' | 'connecting') => void,
            setLastErrorMessage: (lastErrorMessage: string) => void,
            setBackendURL: (backendURL: string) => void,
            setComfyMultiUser: (comfyMultiUser: boolean) => void,
        }
    ) {
        super(backendURL);
        this.socket.on('connect_error', async (error: any) => {
            if (this.socket.active) {
                let errorMessage = error.message;
                try {
                    const controller = new AbortController();
                    const timeoutId = setTimeout(() => controller.abort(), 1500);
                    // @ts-ignore
                    const httpTest = await fetch(backendURL + this.socket._opts.path, { 
                        method: 'GET',
                        signal: controller.signal
                    });
                    clearTimeout(timeoutId);
                    if (httpTest.status == 502) {
                        errorMessage = i18n('502: Maybe the server is not running');
                    } else if (httpTest.status == 404) {
                        errorMessage = i18n('404: Maybe SDPPP is not installed or failed to run in ComfyUI');
                    }
                } catch (e: any) {
                    if (e.message == 'Network request failed') {
                        errorMessage = i18n('Timeout, Maybe the URL is wrong');
                    }
                }
                setLastErrorMessage(i18n(`{0}. reconnecting...`, errorMessage))
                setConnectState('connecting');
            } else {
                setLastErrorMessage(error.message)
                setConnectState('disconnected');
            }
        });
        this.socket.on('sdppp_inited', (payload: any) => {
            setBackendURL(backendURL);
            setConnectState('connected');
            if (payload.multi_user) {
                setComfyMultiUser(payload.multi_user);
            }
        })
        this.socket.on('disconnect', (...args: any[]) => {
            setConnectState('disconnected');
            setComfyMultiUser(false);
            photoshopStore.setComfyUserToken('');
        });
    }
}