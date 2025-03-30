import { app, core } from "photoshop";
import { Document } from "photoshop/dom/Document";
import { Layer } from "photoshop/dom/Layer";

export class ModalStateRestorer {
    private promise: Promise<any>;
    public restore: (success: boolean) => void;

    constructor() {
        this.restore = () => { };
        this.promise = new Promise(resolve => {
            this.restore = resolve;
        })
    }

    public add(fn: (success: boolean) => void) {
        this.promise.then(fn)
    }
}

core.setExecutionMode({ enableErrorStacktraces: true })

let modalStatePromise: Promise<any> = Promise.resolve();
export async function runNextModalState(fn: (restorer: ModalStateRestorer, ...args: any[]) => Promise<any>, options: {
    commandName: string,
    document: Document | null,
    dontRecoverSelection?: boolean
}) {
    const dontRecoverSelection = options.dontRecoverSelection || false;

    let restorer = new ModalStateRestorer();
    let anyLayerSelectedChanged = false;
    let activeLayers: Layer[] = [];
    let formerActiveLayersVisible: boolean[] = [];
    let commandName = options.commandName

    if (!dontRecoverSelection) {
        app.activeDocument.activeLayers.forEach(layer => activeLayers.push(layer));
        if (options.document && app.activeDocument.id != options.document.id) {
            options.document.activeLayers.forEach(layer => activeLayers.push(layer));
        }
        formerActiveLayersVisible = activeLayers.map(layer => layer.visible);

        // the selection layer will become visible after modal state
        restorer.add(() => {
            activeLayers.forEach((formerActiveLayer) => {
                if (!formerActiveLayer.selected) {
                    formerActiveLayer.selected = true
                    anyLayerSelectedChanged = true
                }
            });
            activeLayers.forEach((formerActiveLayer, index) => {
                formerActiveLayer.visible = formerActiveLayersVisible[index];
            })
        });
    }

    let suspensionID: any = null 
    modalStatePromise = modalStatePromise.catch(e => e)
        .then(() => {
            return new Promise<void>(resolve => {
                checkModal();
                function checkModal() {
                    if (!core.isModal()) resolve();
                    else requestAnimationFrame(checkModal);
                }
            })
        })
        .then(() => core.executeAsModal(async function (executionContext, ...args: any[]) {
            suspensionID = options.document ? await executionContext.hostControl.suspendHistory({
                "documentID": options.document.id,
                "name": commandName
            }) : null;
            restorer.add(async () => {
                await new Promise(requestAnimationFrame) // if some action and resumeHistory happened in same tick, the action history would not be suspend.
                if (!anyLayerSelectedChanged) {
                    suspensionID && executionContext.hostControl.resumeHistory(suspensionID);
                } else {
                    // would do this below.
                }
            })
            try {
                const ret = await fn(restorer, executionContext, ...args);
                restorer.restore(true);
                return ret;

            } catch (e: any) {
                restorer.restore(false);
                throw e;
            }
        }, { commandName, interactive: true }))

    let res = null;
    let error = null;
    try {
        await modalStatePromise;
    } catch(e) {
        error = e;
    }
    
    if (anyLayerSelectedChanged) {
        modalStatePromise = core.executeAsModal(async (executionContext) => {
            activeLayers.forEach((layer, index) => {
                layer.visible = formerActiveLayersVisible[index]
            })
            suspensionID && executionContext.hostControl.resumeHistory(suspensionID);
        }, {
            commandName,
            interactive: true
        })
        await modalStatePromise
    }

    if (error) throw error;
    return res
}
