import { Jimp, JimpInstance, JimpMime } from 'jimp';
import { app } from "photoshop";
import { useCallback, useEffect, useRef, useState } from "react";
import getSelection from "../../logics/socket/events/get_selection.mts";
import { getSelectedLayerIdentify, makeid, SpeicialIDManager } from "../../logics/util.mts";
import { ImageWidgetProps, getLayerImage } from "./ImageWidget";
import { LayerWidget } from "./LayerWidget";
import ModeSelect from "./sub-widgets/ModeSelect";
import QuickSetter from "./sub-widgets/QuickSetter";
import { useSDPPPInternalContext } from '../../contexts/sdppp-internal';
import { useSDPPPComfyCaller } from '../../entry.mts';
import { useWorkflowRunHooks } from '../../hooks/WidgetTable.mts';
import i18n from '../../../../src/common/i18n.mts';
import { makeDocumentIdentify } from '../../../../src/common/photoshop/identify.mts';

export function MaskWidget(props: ImageWidgetProps) {
    const [layerIdentify, setLayerIdentify] = useState<string>('');
    const [previewBase64, setPreviewBase64] = useState<string>('');
    const [mode, setMode] = useState<'manual' | 'auto'>('manual');
    const [pendingUpload, setPendingUpload] = useState<boolean>(false);
    const [uploadedImageName, setUploadedImageName] = useState<string | null>(null);
    const { backendURL } = useSDPPPInternalContext();
    const { uploadImage } = useSDPPPComfyCaller();
    const { addBeforeWorkflowRunHook } = useWorkflowRunHooks();

    const jimpImageRef = useRef<JimpInstance | null>(null);

    const beforeRunHandler = useCallback(async () => {
        if (mode === 'manual' && !pendingUpload && uploadedImageName) {
            await props.onValueChange(uploadedImageName);
            return;
        }
        try {
            if (mode === 'auto') {
                await onSelectUpdate(layerIdentify);
            }
            if (jimpImageRef.current) {
                const buffer = await jimpImageRef.current.getBuffer(JimpMime.png);
                const res = await uploadImage(buffer, makeid(6) + '.png');
                if (res?.name) {
                    setUploadedImageName(res.subfolder + '/' + res.name);
                    setPendingUpload(false);
                    await props.onValueChange(res.subfolder + '/' + res.name);
                }
            }
        } catch (e) {
            console.error(e)
        }
    }, [mode, pendingUpload, uploadedImageName, props.onValueChange]);

    useEffect(() => {
        // Add listener
        const remove = addBeforeWorkflowRunHook(beforeRunHandler);

        // Cleanup function
        return () => {
            remove();
        };
    }, [beforeRunHandler]);

    let imageUrl = previewBase64;
    if (!imageUrl && (uploadedImageName || props.value)) {
        const filename = uploadedImageName || props.value;
        const subfolder = filename.split('/').slice(0, -1).join('/');
        imageUrl = backendURL + (backendURL.endsWith('/') ? '' : '/') + `api/view?filename=${filename}&type=input&subfolder=${subfolder}&rand=` + Math.random()
    }

    const onSelectUpdate = useCallback(async (layerIdentify: string, invert: boolean = false) => {
        const jimpImage = await getLayerImage(layerIdentify);
        if (!jimpImage) return;
        jimpImageRef.current = jimpImage;
        const base64 = await getMaskPreviewBase64(jimpImage, invert);
        setLayerIdentify(layerIdentify);
        setPreviewBase64(base64);
        setPendingUpload(true);
    }, []);

    return (
        <div className="image-widget">
            <div className="image-widget-left">
                <img src={imageUrl} className={"image-widget-image" + (imageUrl ? '' : ' image-widget-image-empty')}></img>
            </div>
            <div className="image-widget-right">
                <ModeSelect
                    mode={mode}
                    setMode={(mode) => {
                        setMode(mode);
                    }}
                />
                {
                    mode === 'manual' && (<div className="image-widget-more-quickset">
                        <sp-label>{i18n("Set As:")}</sp-label>
                        <QuickSetter
                            onClick={() => {
                                onSelectUpdate(getSelectedLayerIdentify(), false);
                            }}
                            label={i18n("Selected Layer")}
                        />
                        <QuickSetter
                            onClick={async () => {
                                onSelectUpdate(getSelectedLayerIdentify(), true);
                            }}
                            label={i18n("Selected Layer (invert)")}
                        />
                        <QuickSetter
                            onClick={() => {
                                onSelectUpdate(SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS());
                            }}
                            label={i18n("Canvas")}
                        />
                        <QuickSetter
                            onClick={async () => {
                                const jimpImage = await getSelectionMaskJimp();
                                if (!jimpImage) return;
                                jimpImageRef.current = jimpImage;
                                const base64 = await getMaskPreviewBase64(jimpImage);
                                setLayerIdentify('');
                                setPreviewBase64(base64);
                                setPendingUpload(true);
                            }}
                            label={i18n("Selection")}
                        />
                    </div>)
                }
                {mode === 'auto' && <div className="image-widget-layer-widget-container">
                    <LayerWidget
                        onSelectUpdate={(layerIdentify) => {
                            onSelectUpdate(layerIdentify, false);
                        }}
                        uiWeight={12}
                        value={layerIdentify}
                    />
                </div>}
            </div>
        </div>
    );
}

async function getSelectionMaskJimp(): Promise<JimpInstance | null> {
    if (!app.activeDocument) return null
    try {
        const image = await getSelection({
            document_identify: makeDocumentIdentify(app.activeDocument.id, app.activeDocument.name),
            boundary: {
                left: 0,
                top: 0,
                right: 0,
                bottom: 0,
                width: app.activeDocument.width,
                height: app.activeDocument.height
            }
        })
        if (!image?.blob) return null
        // Convert single alpha channel to RGBA by copying alpha value to RGB channels
        const alphaData = image.blob;
        const rgbaData = new Uint8Array(alphaData.length * 4);
        for (let i = 0; i < alphaData.length; i++) {
            rgbaData[i * 4] = 127;     // R
            rgbaData[i * 4 + 1] = 127; // G
            rgbaData[i * 4 + 2] = 127; // B 
            rgbaData[i * 4 + 3] = 255 - alphaData[i]; // A
            // rgbaData[i * 4 + 3] = alphaData[i]; // A
        }
        return new Jimp({
            data: rgbaData as any,
            width: image.width,
            height: image.height
        });
    } catch (e) {
        console.error(e)
        throw e;
    }
}

async function getMaskPreviewBase64(jimpImage: JimpInstance, invert: boolean = false): Promise<string> {
    const scale = 100 / Math.max(jimpImage.width, jimpImage.height)
    jimpImage = jimpImage.clone()
    jimpImage.scale(scale)
    jimpImage.scan(0, 0, jimpImage.bitmap.width, jimpImage.bitmap.height, function (x, y, idx) {
        const alpha = jimpImage.bitmap.data[idx + 3];
        const value = invert ? alpha : 255 - alpha;
        jimpImage.bitmap.data[idx] = value;     // R
        jimpImage.bitmap.data[idx + 1] = value; // G 
        jimpImage.bitmap.data[idx + 2] = value; // B
        jimpImage.bitmap.data[idx + 3] = 255;   // A
    });
    return await jimpImage.getBase64(JimpMime.png);
}
