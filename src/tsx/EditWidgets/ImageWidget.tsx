import { Jimp, JimpInstance, JimpMime } from 'jimp';
import { app } from "photoshop";
import { useCallback, useEffect, useRef, useState } from "react";
import { LayerWidget } from "./LayerWidget";
import ModeSelect from "./sub-widgets/ModeSelect";
import QuickSetter from './sub-widgets/QuickSetter';
import { useSDPPPInternalContext } from '../../contexts/sdppp-internal';
import { useSDPPPComfyCaller } from '../../entry.mts';
import { useWorkflowRunHooks } from '../../hooks/WidgetTable.mts';
import { makeid, SpeicialIDManager } from '../../logics/util.mts';
import { getSelectedLayerIdentify } from '../../logics/util.mts';
import i18n from '../../../../src/common/i18n.mts';
import getImage from '../../logics/socket/events/get_image.mts';
import { makeDocumentIdentify } from '../../../../src/common/photoshop/identify.mts';

export interface ImageWidgetProps {
    onValueChange: (imageName: string) => Promise<void>,
    uiWeight: number
    value: string
}

export interface ImageWidgetState {
    layerIdentify: string,
    previewBase64: string,
    mode: 'manual' | 'auto',

    pendingUpload: boolean,
    uploadedImageName: string | null
}

export function ImageWidget(props: ImageWidgetProps) {
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
                const buffer = await jimpImageRef.current.getBuffer(JimpMime.jpeg);
                const res = await uploadImage(buffer, makeid(6) + '.jpeg');
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
        let hook = beforeRunHandler;
        // Add listener
        const remove = addBeforeWorkflowRunHook(hook);

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

    const onSelectUpdate = useCallback(async (layerIdentify: string) => {
        const jimpImage = await getLayerImage(layerIdentify);
        if (!jimpImage) return;
        jimpImageRef.current = jimpImage;
        const base64 = await getBase64In100PX(jimpImage);
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
                    setMode={setMode}
                />
                {
                    mode === 'manual' && (<div className="image-widget-more-quickset">
                        <sp-label>{i18n("Set As:")}</sp-label>
                        <QuickSetter
                            onClick={() => {
                                onSelectUpdate(getSelectedLayerIdentify());
                            }}
                            label={i18n("Selected Layer")}
                        />
                        <QuickSetter
                            onClick={() => {
                                onSelectUpdate(SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS());
                            }}
                            label={i18n("Canvas")}
                        />
                    </div>)
                }
                {mode == 'auto' && <div className="image-widget-layer-widget-container">
                    <LayerWidget
                        onSelectUpdate={onSelectUpdate}
                        uiWeight={10}
                        value={layerIdentify}
                    />
                </div>}
            </div>
        </div>
    );
}

export async function getLayerImage(layerIdentify: string): Promise<JimpInstance | null> {
    if (!app.activeDocument) return null
    try {
        return await getImage.getJimpImage({
            document_identify: makeDocumentIdentify(app.activeDocument.id, app.activeDocument.name),
            layer_identify: layerIdentify,
        })
    } catch (e) {
        console.error(e)
        throw e;
    }
}

export async function getBase64In100PX(jimpImage: JimpInstance): Promise<string> {
    const scale = 100 / Math.max(jimpImage.width, jimpImage.height)
    jimpImage = jimpImage.clone()
    jimpImage.scale(scale)
    return await jimpImage.getBase64(JimpMime.jpeg);
}
