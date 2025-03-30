import { action, app } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import { makeDocumentIdentify, makeLayerIdentify } from "../../../src/common/photoshop/identify.mts";
import { getAllSubLayer, getSDPPPUID } from "./util.mts";
import { photoshopStore } from "./ModelDefines.mts";
import type { PhotoshopDataDocument } from "../../../src/plugins/common/store/photoshop.mts";


(async () => {
    photoshopStore.setUName(getSDPPPUID());
    fetchDocuments();
})().catch(console.error)


function notifyCanvasStateChange() {
    const historyStates = app.activeDocument?.historyStates;
    historyStates && photoshopStore.setCanvasStateID(historyStates[historyStates.length - 1].id)
}
function notifySelectionStateChange() {
    const historyStates = app.activeDocument?.historyStates;
    historyStates && photoshopStore.setSelectionStateID(historyStates[historyStates.length - 1].id)
}
function notifyHistoryStateChange() {
    const historyStates = app.activeDocument?.historyStates;
    historyStates && photoshopStore.setHistoryStateID(historyStates[historyStates.length - 1].id)
}

action.addNotificationListener(['set'], (name, args) => {
    if (args._target[0]._property == 'selection') {
        notifySelectionStateChange();
    }
})
action.addNotificationListener(['historyStateChanged'], (args: any) => {
    notifyHistoryStateChange()
    if (
        args.commandID == 5004 // nudge
        || args.commandID == 5002 // move
    ) {
        notifyCanvasStateChange();
    }
})
action.addNotificationListener(['toolModalStateChanged'], (name, args) => {
    if (args.state._value == 'exit' && (
        args.kind._value == 'paint' // pen tool, darken tool, lighten tool, blur tool, eraser...
        // || args.kind._value == 'mouse' // move tool
    )) {
        // console.log('changed by paint');
        notifyCanvasStateChange()
    }
})
action.addNotificationListener(['modalStateChanged'], (name, args) => {
    if (args.state._value == 'exit') {
        // console.log('changed by modal state')
        notifyCanvasStateChange()
    }
})
action.addNotificationListener(['show', 'hide', 'transform', 'fill', 'crop'], () => {
    // console.log('change by show hide')
    notifyCanvasStateChange()
})
action.addNotificationListener(['delete', 'move', 'copyToLayer'], () => {
    fetchDocuments()
    // console.log('change by make move copyToLayer')
    notifyCanvasStateChange()//
})
action.addNotificationListener(['newDocument', 'open', 'close', 'make', 'modalJavaScriptScopeExit'],
    fetchDocuments
)

// 发到非当前文档会触发这个, 所以只能每帧检测s
// action.addNotificationListener(['select'], (name, args) => {
//     if (args._target[0]._ref == 'document') {
//         notifyCanvasStateChange()
//         notifySelectionStateChange()
//     }
// })
let lastCurrentDocumentID = app.activeDocument?.id;
function checkCurrentDocument() {
    if (lastCurrentDocumentID != app.activeDocument?.id) {
        notifyCanvasStateChange()
        notifySelectionStateChange()
    }
    lastCurrentDocumentID = app.activeDocument?.id
    requestAnimationFrame(checkCurrentDocument)
}
requestAnimationFrame(checkCurrentDocument)

setInterval(fetchDocuments, 5000);

function fetchDocuments() {
    try {
        if (!app.activeDocument) return;
        photoshopStore.setDocument(
            app.activeDocument.id,
            app.documents.reduce((ret: PhotoshopDataDocument, document: Document) => {
                ret[document.id] = {
                    name: document.name,
                    id: document.id,
                    identify: makeDocumentIdentify(document.id, document.name),
                    layers: getAllSubLayer(document).map(layerAndPath => {
                        return {
                            level: layerAndPath.level,
                            id: layerAndPath.layer.id,
                            name: layerAndPath.layer.name,
                            identify: makeLayerIdentify(layerAndPath.layer.id, layerAndPath.layer.name, layerAndPath.level),
                            fullPath: layerAndPath.path
                        };
                    })
                }
                return ret;
            }, {})
        )
    } catch (e) {
        console.error(e)
    }
}
