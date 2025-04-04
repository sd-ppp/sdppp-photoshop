import { DocumentWidget } from "./EditWidgets/DocumentWidget"
import { LayerWidget } from "./EditWidgets/LayerWidget"
import { MaskWidget } from "./EditWidgets/MaskWidget"
import { ImageWidget } from "./EditWidgets/ImageWidget"
import { useSDPPPInternalContext } from "../contexts/sdppp-internal"
import { useSDPPPComfyCaller } from "../hooks/ComfyCaller.mts"
import { useWidgetTable } from "../hooks/WidgetTable.mts"
import { useCallback } from "react"
import { SDPPPGraphForm } from "../../../src/common/types"
import WorkflowEdit from "../../../src/plugins/common/tsx/WorkflowEdit"
import i18n from "../../../src/common/i18n.mts"
import { useLivePainting } from "../hooks/livePainting.mts"


export function WorkflowEditPhotoshop() {
    const { 
        callForPSDExtract,
        lastOpenedWorkflow
    } = useSDPPPComfyCaller();
    const { workflowAgent } = useSDPPPInternalContext();
    const {
        form: widgetTableForm,
        setWidgetValue
    } = useWidgetTable();
    const {
        tryDoLivePainting
    } = useLivePainting();

    const hasSamplePSD = !!workflowAgent?.data.hasPSDNodes;

    const onWidgetChange = useCallback(async (nodeid: number, widgetIndex: number, value: any, originNodeData: SDPPPGraphForm) => {
        await setWidgetValue(nodeid, widgetIndex, value);
        tryDoLivePainting();    
    }, [setWidgetValue, tryDoLivePainting]);

    const onWidgetRender = useCallback((
        context: {
            keepRender: boolean,
            result: any[]
        },
        fieldInfo: SDPPPGraphForm,
        widget: SDPPPGraphForm['widgets'][number],
        widgetIndex: number
    ) => {
        if (widget.outputType == 'PS_DOCUMENT') {
            context.result.push(
                <DocumentWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widget.value}
                    onSelectUpdate={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    key={widgetIndex}
                />
            );
            return true;
        } else if (widget.outputType == 'PS_LAYER') {
            const documentNodeID = widget.options?.documentNodeID || 0;
            const documentValue = widgetTableForm?.find(form => form.id == documentNodeID)?.widgets[0]?.value || '';
            context.result.push(
                <LayerWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widget.value}
                    documentValue={documentValue ? documentValue.split('/').pop() : ''}
                    onSelectUpdate={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    key={widgetIndex} />
            );
            return true;
        } else if (widget.outputType == 'IMAGE_PATH') {
            context.result.push(
                <ImageWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widget.value}
                    key={widgetIndex}
                    onValueChange={async (v) => {
                        await onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            );
            return true;
        } else if (widget.outputType == 'MASK_PATH') {
            context.result.push(
                <MaskWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widget.value}
                    key={widgetIndex}
                    onValueChange={async (v) => {
                        await onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            );
            return true;
        }
        return false;
    }, [setWidgetValue]);

    if (!widgetTableForm) {
        return null;
    }
    return (
        <div className="workflow-edit">
            <div className="workflow-edit-title">
                {lastOpenedWorkflow && <sp-label style={{ fontWeight: 'bold' }}>{lastOpenedWorkflow}</sp-label>}
                {hasSamplePSD ? <a onClick={() => { callForPSDExtract(workflowAgent?.data.sid || '') }}>{'>' + i18n('sample .psd')}</a> : ''}
            </div>
            <WorkflowEdit
                formDatas={widgetTableForm}
                onWidgetChange={onWidgetChange}
                onWidgetRender={onWidgetRender}
            />
        </div>
    );
}
