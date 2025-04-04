import { assert } from 'chai';
import { app, constants } from 'photoshop';
import { makeDocumentIdentify } from '../../../src/common/photoshop/identify.mts';
import { openPSD } from './util.mts';
import { SpeicialIDManager } from '../../../src/common/photoshop/specialLayer.mts';
import { runNextModalState } from '../../src/logics/modalStateWrapper.mts';
import getLayerInfo from '../../src/logics/socket/events/get_layer_info.mts';

describe('ParseLayerInfo', async () => {
    afterEach(async () => {
        await runNextModalState(async () => {
            await app.activeDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
        }, {
            commandName: 'closeUTDocument',
            document: null
        })
    });
    it('simple-background-layer', async () => {
        //@ts-ignore
        await openPSD(import('./test-psd/single-background.psd'), 'single-background.psd');

        const result = await getLayerInfo({
            document_identify: makeDocumentIdentify(app.activeDocument?.id, app.activeDocument?.name),
            layer_identify: SpeicialIDManager.get_SPECIAL_LAYER_SELECTED_LAYER()
        })
        assert.deepEqual(result, { "isGroup": false, "identify": "### Selected Layer ###", "name": "Background", "opacity": 1, "boundary": { "left": 0, "top": 0, "right": 0, "bottom": 0, "width": 4, "height": 4 } })
    })
})