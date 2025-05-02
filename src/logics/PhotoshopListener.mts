import { action, app } from "photoshop";
import { getSDPPPUID } from "./util.mts";
import { photoshopStore } from "./ModelDefines.mts";
import { fetchDocuments, notifyCanvasChange, notifyDocumentChange, notifyLayerChange, notifySelectionChange } from "./PhotoshopDocumentStore.mts";

(async () => {
    photoshopStore.setUName(getSDPPPUID());
    fetchDocuments();
})().catch(console.error)

action.addNotificationListener(['historyStateChanged'], (args: any) => {
    notifyHistoryStateChange()
    if (
        args.commandID == 5004 // nudge
        || args.commandID == 5002 // move
    ) {
        notifyCanvasStateChange();
        notifyLayerChange(app.activeDocument?.activeLayers.map(layer => layer.id));
    }
})
action.addNotificationListener(['toolModalStateChanged'], (name, args, ...rest) => {
    if (args.state._value == 'exit' && (
        args.kind._value == 'paint' // pen tool, darken tool, lighten tool, blur tool, eraser...
        // || args.kind._value == 'mouse' // move tool
    )) {
        // console.log('changed by paint');
        notifyCanvasStateChange();
        notifyLayerChange(app.activeDocument?.activeLayers.map(layer => layer.id));
    }
})
action.addNotificationListener(['modalStateChanged'], (name, args) => {
    if (args.state._value == 'exit') {
        // console.log('changed by modal state')
        notifyCanvasStateChange();
        notifyLayerChange(app.activeDocument?.activeLayers.map(layer => layer.id));
    }
})
action.addNotificationListener(['show', 'hide', 'transform', 'fill', 'crop'], () => {
    // console.log('change by show hide')
    notifyCanvasStateChange();
    notifyLayerChange(app.activeDocument?.activeLayers.map(layer => layer.id));
})
action.addNotificationListener(['delete', 'move', 'copyToLayer'], () => {
    fetchDocuments();
    // console.log('change by make move copyToLayer')
    notifyCanvasStateChange();
    notifyLayerChange(app.activeDocument?.activeLayers.map(layer => layer.id));
})
action.addNotificationListener(['newDocument', 'open', 'close', 'make', 'modalJavaScriptScopeExit'],
    () => fetchDocuments()
)

// 发到非当前文档会触发这个, 所以只能每帧检测activeDocument and activeLayer
// action.addNotificationListener(['select'], (name, args) => {
//     if (args._target[0]._ref == 'document') {
//         notifyCanvasStateChange()
//         notifySelectionStateChange()
//     }
// })
function notifyCanvasStateChange() {
    const historyStates = app.activeDocument?.historyStates;
    historyStates && photoshopStore.setCanvasStateID(historyStates[historyStates.length - 1].id);
    notifyCanvasChange();
}
function notifyHistoryStateChange() {
    const historyStates = app.activeDocument?.historyStates;
    historyStates && photoshopStore.setHistoryStateID(historyStates[historyStates.length - 1].id)
}
function notifySelectionStateChange() {
    photoshopStore.setSelectionStateID(selectionAreaID + '_' + lastCurrentDocumentID + '_' + lastCurrentLayerID)
}
let lastCurrentDocumentID = app.activeDocument?.id;
let lastCurrentLayerID = app.activeDocument?.activeLayers.map(layer => layer.id).join(',');
let selectionAreaID = 0
action.addNotificationListener(['set'], (name, args) => {
    if (args._target[0]._property == 'selection') {
        selectionAreaID++;
        notifySelectionStateChange();
        notifySelectionChange()
    }
})
function checkCurrentDocument() {
    const activeLayers = app.activeDocument?.activeLayers.map(layer => layer.id).join(',');
    if (lastCurrentDocumentID != app.activeDocument?.id) {
        notifyDocumentChange();
    }
    if (
        lastCurrentDocumentID != app.activeDocument?.id ||
        lastCurrentLayerID != activeLayers
    ) {
        lastCurrentDocumentID = app.activeDocument?.id
        lastCurrentLayerID = activeLayers
        notifySelectionStateChange()
        notifySelectionChange()

    } else {
        lastCurrentDocumentID = app.activeDocument?.id
        lastCurrentLayerID = activeLayers
    }
    requestAnimationFrame(checkCurrentDocument)
}
requestAnimationFrame(checkCurrentDocument)
setInterval(() => fetchDocuments(), 5000);

