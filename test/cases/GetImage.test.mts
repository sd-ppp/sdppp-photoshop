import { assert } from 'chai';
import { app, constants, imaging } from 'photoshop';
import { makeDocumentIdentify, makeLayerIdentify } from '../../../../src/common/photoshop/identify.mts';
import { Document } from 'photoshop/dom/Document';
import { Layer } from 'photoshop/dom/Layer';
import { compareImageBlobAndPng, openPSD } from './util.mts';
import { SpeicialIDManager } from '../../../../src/common/photoshop/specialLayer.mts';
import { runNextModalState } from '../../src/logics/modalStateWrapper.mts';
import getImage from '../../src/logics/socket/events/get_image.mts';

describe('GetImage', async () => {
    describe('test psd with different color bit', () => {
        afterEach(async () => {
            await runNextModalState(async () => {
                await app.activeDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
            }, {
                commandName: 'closeUTDocument',
                document: null
            })
        });
        it('16bitpsd', async () => {
            //@ts-ignore
            const pngBuffer = (await import('./test-psd/bittest.png')).default;
            //@ts-ignore
            await openPSD(import('./test-psd/bittest-16.psd'), 'sdppp-ut-16bit.psd');

            const result = await getImage({
                document_identify: SpeicialIDManager.get_SPECIAL_DOCUMENT_CURRENT(),
                layer_identify: SpeicialIDManager.get_SPECIAL_LAYER_SELECTED_LAYER()
            })
            assert(!!result.pngData)
            await compareImageBlobAndPng(result.pngData, pngBuffer)
        })
        it('32bitpsd', async () => {
            //@ts-ignore
            await openPSD(import('./test-psd/bittest-32.psd'), 'sdppp-ut-32bit.psd');

            try {
                const result = await getImage({
                    document_identify: SpeicialIDManager.get_SPECIAL_DOCUMENT_CURRENT(),
                    layer_identify: SpeicialIDManager.get_SPECIAL_LAYER_SELECTED_LAYER()
                })
                assert(false);
            } catch (e: any) {
                assert(e.message.includes('32-bit color not supported'))
            }
        })
    })
    describe('8bit', () => {
        let UTDocument: Document;
        let UTDocumentIdentify: string = '';
        before(async () => {
            //@ts-ignore
            await openPSD(import('./test-psd/ut.psd'), 'sdppp-ut.psd');

            UTDocument = app.activeDocument as Document;
            UTDocumentIdentify = makeDocumentIdentify(UTDocument.id, UTDocument.name);
        })
        after(async () => {
            await runNextModalState(async () => {
                await app.activeDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
            }, {
                commandName: 'closeUTDocument',
                document: null
            })
        })
        it('should throw error when document not found', async () => {
            const params = {
                document_identify: 'invalid_doc',
                layer_identify: 'layer1'
            };

            let error: string | null = null;
            try {
                await getImage(params);
                assert.fail('Should have thrown an error');
            } catch (e: any) {
                error = e.stack || e.message || e;
            }
            assert.isNotNull(error);
            assert.include(error, 'document');
            assert.include(error, 'not found');
        });
        it('should throw error when params is invalid', async () => {
            const params = {};

            let error: string | null = null;
            try {
                await getImage(params as any);
                assert.fail('Should have thrown an error');
            } catch (e: any) {
                error = e.stack || e.message || e;
            }
            assert.isNotNull(error);
            assert.include(error, 'not a invalid identifer')
        });
        it('can get image data successfully with default bounds', async () => {
            //@ts-ignore
            const pngBuffer = (await import('./test-psd/ut0.png')).default;
            const testLayer = UTDocument.layers.find(layer => layer.name == 'Gradient Fill 1') as Layer;
            if (!testLayer) {
                throw new Error('SD layer not found');
            }
            const params = {
                document_identify: UTDocumentIdentify,
                layer_identify: makeLayerIdentify(testLayer.id, testLayer.name)
            };

            const result = await getImage(params);
            assert.instanceOf(result.pngData, Uint8Array);
            await compareImageBlobAndPng(result.pngData, pngBuffer)
        });
        it('should throw error when layer not found', async () => {
            const params = {
                document_identify: UTDocumentIdentify,
                layer_identify: 'invalid_layer'
            };
            let error: string | null = null;
            try {
                await getImage(params);
                assert.fail('Should have thrown an error');
            } catch (e: any) {
                error = e.stack || e.message || e;
            }
            assert.isNotNull(error);
            assert.include(error, 'layer');
            assert.include(error, 'not found');
        });
        it('should throw error when boundary is out of range', async () => {
            const testLayer = UTDocument.layers.find(layer => layer.name == 'Gradient Fill 1') as Layer;
            if (!testLayer) {
                throw new Error('SD layer not found');
            }
            const params = {
                document_identify: UTDocumentIdentify,
                layer_identify: makeLayerIdentify(testLayer.id, testLayer.name),
                boundary: {
                    left: 0,
                    top: 0,
                    right: UTDocument.width,
                    bottom: UTDocument.height,
                    width: 100,
                    height: 100
                }
            };
            let error: string | null = null;
            try {
                await getImage(params);
                assert.fail('Should have thrown an error');
            } catch (e: any) {
                error = e.stack || e.message || e;
            }
            assert.isNotNull(error);
            assert.include(error, 'boundary is not for this document');
        });

        it('should handle custom boundary', async () => {
            //@ts-ignore
            const pngBuffer = (await import('./test-psd/ut1.png')).default;
            const testLayer = UTDocument.layers.find(layer => layer.name == 'Gradient Fill 1') as Layer;
            if (!testLayer) {
                throw new Error('SD layer not found');
            }
            const boundaryLayer = UTDocument.layers.find(layer => layer.name == 'boundary-topright') as Layer;
            if (!boundaryLayer) {
                throw new Error('boundary-topright layer not found');
            }

            const params = {
                document_identify: UTDocumentIdentify,
                layer_identify: makeLayerIdentify(testLayer.id, testLayer.name),
                boundary: {
                    left: boundaryLayer.bounds.left,
                    top: boundaryLayer.bounds.top,
                    right: UTDocument.width - boundaryLayer.bounds.right,
                    bottom: UTDocument.height - boundaryLayer.bounds.bottom,
                    width: boundaryLayer.bounds.width,
                    height: boundaryLayer.bounds.height
                }
            };

            const result = await getImage(params);

            assert.instanceOf(result.pngData, Uint8Array);
            await compareImageBlobAndPng(result.pngData, pngBuffer)
        });
        it('can get background', async () => {
            //@ts-ignore
            const pngBuffer = (await import('./test-psd/ut2.png')).default;
            const testLayer = UTDocument.layers.find(layer => layer.name == 'Background' || layer.name == '背景') as Layer;
            if (!testLayer) {
                throw new Error('SD layer not found');
            }

            const params = {
                document_identify: UTDocumentIdentify,
                layer_identify: makeLayerIdentify(testLayer.id, testLayer.name),
                boundary: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: UTDocument.width,
                    height: UTDocument.height
                }
            };

            const result = await getImage(params);

            assert.instanceOf(result.pngData, Uint8Array);
            await compareImageBlobAndPng(result.pngData, pngBuffer)
        })
    });
    describe('edge case', ()=> {
        afterEach(async () => {
            await runNextModalState(async () => {
                await app.activeDocument?.close(constants.SaveOptions.DONOTSAVECHANGES);
            }, {
                commandName: 'closeUTDocument',
                document: null
            })
        });
        it('can get single background layer psd without error', async () => {
            //@ts-ignore
            await openPSD(import('./test-psd/single-background.psd'), 'single-background.psd');

            const params = {
                document_identify: SpeicialIDManager.get_SPECIAL_DOCUMENT_CURRENT(),
                layer_identify: SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS(),
                boundary: {
                    left: 0,
                    top: 0,
                    right: 0,
                    bottom: 0,
                    width: app.activeDocument.width,
                    height: app.activeDocument.height
                }
            };
            await getImage(params);
        })
    })
});
