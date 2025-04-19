import { Socket, SocketConstructor } from "../../../../../src/common/socket/Socket.mts";
import type { PhotoshopCalleeActions, PSDActions, getImageActions, sendImagesActions, getSelectionActions, getTextActions, sendTextActions, getLayerInfoActions, getDocumentInfoActions, LayerReducerActions } from "../../../../../src/socket/PhotoshopCalleeInterface.mts";
import type { PhotoshopCallerActions } from "../../../../../src/socket/PhotoshopCallerInterface.mts";
import getDocumentInfo from "./events/get_document_info.mts";
import getImage from "./events/get_image.mts";
import getLayerInfo from "./events/get_layer_info.mjs";
import getLayersInGroup from "./events/get_layers_in_group.mjs";
import getLinkedLayers from "./events/get_linked_layers.mjs";
import getSelection from "./events/get_selection.mjs";
import getText from "./events/get_text_from_layer.mjs";
import PSD from "./events/psd.mjs";
import sendImages from "./events/send_images.mjs";
import sendText from "./events/send_text_to_layer.mts";

interface PhotoshopCalleePayload {
    action: keyof PhotoshopCalleeActions;
    params: PhotoshopCalleeActions[keyof PhotoshopCalleeActions]['params'];
}

export function PhotoshopCalleeSocket(SocketClass: SocketConstructor<Socket>) {
    return class extends SocketClass {
        constructor(url: string) {
            super(url);

            this.socket.on('B_photoshop', async (payload: PhotoshopCalleePayload, callback: any) => {
                const { action, params } = payload;
                let res;
                try {
                    console.log('B_photoshop start', action);
                    const start = Date.now();
                    if (action === 'psd') {
                        res = await PSD(params as PSDActions['params']);
                    } else if (action === 'getImage') {
                        res = await getImage(params as getImageActions['params']);
                    } else if (action === 'sendImages') {
                        res = await sendImages(params as sendImagesActions['params']);
                    } else if (action === 'getSelection') {
                        res = await getSelection(params as getSelectionActions['params']);
                    } else if (action === 'getText') {
                        res = await getText(params as getTextActions['params']);
                    } else if (action === 'sendText') {
                        res = await sendText(params as sendTextActions['params']);
                    } else if (action === 'getLayerInfo') {
                        res = await getLayerInfo(params as getLayerInfoActions['params']);
                    } else if (action === 'getDocumentInfo') {
                        res = await getDocumentInfo(params as getDocumentInfoActions['params']);
                    } else if (action === 'getLinkedLayers') {
                        res = await getLinkedLayers(params as LayerReducerActions['params']);
                    } else if (action === 'getLayersInGroup') {
                        res = await getLayersInGroup(params as LayerReducerActions['params']);
                    }
                    const end = Date.now();
                    console.log('B_photoshop end', action, end - start);
                } catch (e: any) {
                    console.error(e);
                    callback({ error: e.stack || e.message || e });
                    return;
                }
                callback(res)
            });
        }

        public async callForPSDExtract(sid: string, params: PhotoshopCallerActions['extractPSD']['params']) {
            return new Promise((resolve, reject) => {
                this.socket.emit("F_photoshop", {
                    action: 'extractPSD',
                    sid: sid,
                    params: {
                        from_sid: params.from_sid
                    }
                }, (res: any)=> {
                    if (res.error) {
                        return reject(new Error(res.error))
                    }
                    resolve(res);
                })
            })
        }
        
        public async uploadImage(sid: string, params: PhotoshopCallerActions['uploadImage']['params']): Promise<PhotoshopCallerActions['uploadImage']['result']> {
            return new Promise((resolve, reject) => {
                this.socket.emit("F_photoshop", {
                    action: 'uploadImage',
                    sid: sid,
                    params: params
                }, (res: any) => {
                    if (res.error) {
                        return reject(new Error(res.error))
                    }
                    resolve(res);
                })
            })
        }
    };
}