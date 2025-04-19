import { action, app, constants } from 'photoshop';
import { storage } from 'uxp';
import i18n from "../../../../../../src/common/i18n.mts";
import { runNextModalState } from '../../modalStateWrapper.mjs';
import { parseDocumentIdentify } from '../../util.mts';
import type { PSDActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

let rejectExtractCount = 0;
let lastExtract = 0;
const COOLDOWN = 5000;

export default async function PSD(params: PSDActions['params']) {
    const documentIdentify = params.document_identify
    let document = documentIdentify ? parseDocumentIdentify(documentIdentify) : null;

    if (params.action === 'get') {
        let data: any
        await runNextModalState(async function (restorer) {
            if (!document) document = await createDocument();
            if (!document) throw new Error(i18n('create document failed'))

            document = await document.duplicate();
            restorer.add(async () => {
                document?.close();
            });

            const tempFolder = await storage.localFileSystem.getTemporaryFolder();
            let entry = await tempFolder.createEntry("sdppp.psd", { overwrite: true });
            await document.saveAs.psd(entry, { maximizeCompatibility: false, typename: 'PhotoshopSaveOptions' } as any);

            data = await entry.read({ format: storage.formats.binary });
        }, {
            commandName: i18n('sdppp get PSD'),
            document
        })
        if (!data) return { error: 'save Document failed' }

        return { data };

    } else if (params.action === 'extract') {
        if (
            Date.now() - lastExtract < COOLDOWN ||
            rejectExtractCount > 2 ||
            !confirm(i18n(`{0} wants to extract a PSD file to Photoshop, are you sure?`, params.fromSSID))
        ) {
            rejectExtractCount++;
            if (rejectExtractCount == 3) {
                if (!confirm(i18n('should sdppp refuse extracting PSD to Photoshop in this session anymore?'))) {
                    rejectExtractCount--;
                }
            }
            return;
        }
        lastExtract = Date.now();
        const blob: Blob = params.data;
        await runNextModalState(async function () {
            if (!document) document = await app.createDocument({
                width: 512,
                height: 512,
                resolution: 72,
                mode: constants.NewDocumentMode.RGB,
                fill: constants.DocumentFill.TRANSPARENT
            })
            if (!document) throw new Error(i18n('document {0} not found', documentIdentify))
            app.activeDocument = document;
            document.selection?.deselect();

            const buffer = await blob.arrayBuffer();

            const tempFolder = await storage.localFileSystem.getTemporaryFolder();
            let entry = await tempFolder.createEntry("sdppp.psd", { overwrite: true });
            await entry.write(buffer, { format: storage.formats.binary });
            let token = storage.localFileSystem.createSessionToken(entry);

            const newLayer = await document.createLayer(constants.LayerKind.NORMAL, {
                name: 'sdppp',
            })
            if (!newLayer) throw new Error(i18n('create layer failed'))
            newLayer.move(document.layers[0], constants.ElementPlacement.PLACEBEFORE)

            await action.batchPlay(
                [
                    {
                        "_obj": "placeEvent",
                        "null": {
                            "_kind": "local", "_path": token
                        },
                        "freeTransformCenterState": { "_enum": "quadCenterState", "_value": "QCSAverage" },
                        "offset": {
                            "_obj": "offset",
                            "horizontal": { "_unit": "pixelsUnit", "_value": 0.0 },
                            "vertical": { "_unit": "pixelsUnit", "_value": 0.0 }
                        },
                    },
                    { "_obj": "placedLayerConvertToLayers" },
                    { "_obj": "ungroupLayersEvent", "_target": [{ "_enum": "ordinal", "_ref": "layer" }] }

                ],
                {
                    synchronousExecution: true
                })
        }, {
            commandName: i18n('sdppp extract PSD'),
            document,
            dontRecoverSelection: true
        })

    } else {
        throw new Error(i18n('invalid action: {0}', params.action));
    }
}

async function createDocument() {
    return await app.createDocument({
        width: 512,
        height: 512,
        resolution: 72,
        mode: constants.NewDocumentMode.RGB,
        fill: constants.DocumentFill.TRANSPARENT
    })
}
