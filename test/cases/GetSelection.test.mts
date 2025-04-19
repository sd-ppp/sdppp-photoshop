import { assert } from 'chai';
import { action, app, constants } from 'photoshop';
import { openPSD } from './util.mts';
import { SpeicialIDManager } from '../../../../src/common/photoshop/specialLayer.mts';
import { runNextModalState } from '../../src/logics/modalStateWrapper.mts';
import getSelection from '../../src/logics/socket/events/get_selection.mts';

describe('GetSelection', async () => {
    it('simple-background-layer', async () => {
        //@ts-ignore
        await openPSD(import('./test-psd/single-background.psd'), 'single-background.psd');

        await runNextModalState(async () => {
            await action.batchPlay([
                {
                    "_obj": "set",
                    "_target": [
                        { "_property": "selection", "_ref": "channel" }
                    ],
                    "to": {
                        "_obj": "rectangle",
                        "bottom": { "_unit": "pixelsUnit", "_value": 3.0 },
                        "left": { "_unit": "pixelsUnit", "_value": 1.0 },
                        "right": { "_unit": "pixelsUnit", "_value": 4.0 },
                        "top": { "_unit": "pixelsUnit", "_value": 1.0 }
                    }
                }
            ], {
                synchronousExecution: true
            })
        }, {
            commandName: 'getSelection',
            document: app.activeDocument
        })

        const result = await getSelection({
            document_identify: SpeicialIDManager.get_SPECIAL_DOCUMENT_CURRENT(),
            boundary: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 4,
                height: 4
            }
        })
        // const result = await getLayerInfo({
        //     document_identify: makeDocumentIdentify(app.activeDocument?.id, app.activeDocument?.name),
        //     layer_identify: SpeicialIDManager.get_SPECIAL_LAYER_SELECTED_LAYER()
        // })
        const expect = [
            0,
            0,
            0,
            0,
            0,
            255,
            255,
            255,
            0,
            255,
            255,
            255,
            0,
            0,
            0,
            0,
        ]
        result.blob?.forEach((value, index) => {
            assert.equal(value, expect[index], `index: ${index}, value: ${value}, expect: ${expect[index]}`)
        })
    })
    afterEach(async () => {
        await runNextModalState(async () => {
            await app.activeDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
        }, {
            commandName: 'closeUTDocument',
            document: null
        })
    });
})