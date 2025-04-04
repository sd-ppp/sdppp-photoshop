import { assert } from 'chai';
import sendImages from '../../src/logics/socket/events/send_images.mts';
import { app, constants, imaging } from 'photoshop';
import { makeDocumentIdentify } from '../../../src/common/photoshop/identify.mts';
import { SpeicialIDManager } from '../../../src/common/photoshop/specialLayer.mts';
import { runNextModalState } from '../../src/logics/modalStateWrapper.mts';
import { Document } from 'photoshop/dom/Document';
import { Layer } from 'photoshop/dom/Layer';

describe('SendImages', () => {
    let UTDocument: Document;
    let testLayer1: Layer;
    let UTDocumentIdentify: string = '';
    let originLayers: Layer[] = [];
    before(async () => {
        await runNextModalState(async () => {
            //@ts-ignore
            UTDocument = await app.createDocument({
                name: 'UT-SendImages.psd',
                width: 512,
                height: 512
            });
    
            if (!UTDocument) {
                throw new Error('create UT-SendImages.psd failed');
            }
            //@ts-ignore
            testLayer1 = await UTDocument.createLayer();
            if (!testLayer1) {
                throw new Error('create testLayer1 failed');
            }
            testLayer1.name = 'SD';
            const fakeBuffer = new Uint8Array(512 * 512 * 4);
            for (let i = 0; i < fakeBuffer.length; i++) {
                fakeBuffer[i] = 255;
            }
            const imageData = await imaging.createImageDataFromBuffer(fakeBuffer, {
                width: 512,
                height: 512,
                components: 4,
                colorProfile: 'sRGB IEC61966-2.1',
                colorSpace: "RGB"
            });
            imaging.putPixels({
                imageData: imageData,
                layerID: testLayer1.id,
                targetBounds: {
                    left: 0,
                    top: 0,
                    width: 512,
                    height: 512
                }
            })
        }, {
            commandName: 'prepareUTDocument',
            document: null
        })

        UTDocumentIdentify = makeDocumentIdentify(UTDocument.id, UTDocument.name);
        originLayers = UTDocument.layers.slice(0);
    })
    after(async () => {
        await runNextModalState(async () => {
            await UTDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
        }, {
            commandName: 'closeUTDocument',
            document: null
        })
    });
    afterEach(async () => {
        const diffLayers = UTDocument.layers.filter(layer => !originLayers.some(originLayer => originLayer.id === layer.id));
        await runNextModalState(async (restorer) => {
            for (const layer of diffLayers) {
                await layer.delete();
            }
        }, {
            commandName: 'ut restore',
            document: UTDocument
        });
    });

    it('should send single image successfully', async () => {
        const testLayer = UTDocument.layers.find(layer => layer.name === 'SD');
        if (!testLayer) {
            throw new Error('SD layer not found');
        }

        const imageBlob = new Uint8Array(512 * 512 * 4);
        // Fill with some test data
        for (let i = 0; i < imageBlob.length; i += 4) {
            imageBlob[i] = 255;     // R
            imageBlob[i + 1] = 0;   // G
            imageBlob[i + 2] = 0;   // B
            imageBlob[i + 3] = 255; // A
        }

        const params = {
            image_blobs: [{
                width: 512,
                height: 512,
                components: 4,
                buffer: new Blob([imageBlob.buffer])
            }],
            document_identify: UTDocumentIdentify,
            layer_identifies: [SpeicialIDManager.get_SPECIAL_LAYER_NEW_LAYER()],
            boundaries: [{
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: 512,
                height: 512
            }]
        };

        const result = await sendImages(params);
        const diffLayers = UTDocument.layers.filter(layer => !originLayers.some(originLayer => originLayer.id === layer.id));
        assert.equal(diffLayers.length, 1);
    });

    it('should throw error when document not found', async () => {
        const params = {
            image_blobs: [{
                width: 512,
                height: 512,
                components: 4,
                buffer: new Blob([new Uint8Array(0).buffer])
            }],
            document_identify: 'invalid_doc',
            layer_identifies: [SpeicialIDManager.get_SPECIAL_LAYER_NEW_LAYER()],
            boundaries: []
        };

        let error: string | null = null;
        try {
            await sendImages(params);
            assert.fail('Should have thrown an error');
        } catch (e: any) {
            error = e.stack || e.message || e;
        }
        assert.isNotNull(error);
        assert.include(error, 'document');
        assert.include(error, 'not found');
    });

    it('should handle multiple images', async () => {
        const testLayer = UTDocument.layers.find(layer => layer.name === 'SD');
        if (!testLayer) {
            throw new Error('SD layer not found');
        }

        const imageBlob = new Uint8Array(100 * 100 * 4);
        const params = {
            image_blobs: [
                {
                    width: 100,
                    height: 100,
                    components: 4,
                    buffer: new Blob([imageBlob.buffer])
                },
                {
                    width: 100,
                    height: 100,
                    components: 4,
                    buffer: new Blob([imageBlob.buffer])
                }
            ],
            document_identify: UTDocumentIdentify,
            layer_identifies: [
                SpeicialIDManager.get_SPECIAL_LAYER_NEW_LAYER(),
                SpeicialIDManager.get_SPECIAL_LAYER_NEW_LAYER()
            ],
            boundaries: [
                {
                    left: 0,
                    top: 0,
                    right: 100,
                    bottom: 100,
                    width: 100,
                    height: 100
                },
                {
                    left: 100,
                    top: 0,
                    right: 200,
                    bottom: 100,
                    width: 100,
                    height: 100
                }
            ]
        };

        const result = await sendImages(params);
        assert.deepEqual(result, {});
    });
});
