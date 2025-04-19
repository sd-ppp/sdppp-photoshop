import { DocumentWidget } from "./EditWidgets/DocumentWidget"
import { LayerWidget } from "./EditWidgets/LayerWidget"
import { MaskWidget } from "./EditWidgets/MaskWidget"
import { ImageWidget } from "./EditWidgets/ImageWidget"
import { useSDPPPInternalContext } from "../contexts/sdppp-internal"
import { useSDPPPComfyCaller } from "../hooks/ComfyCaller.mts"
import { useWidgetTable } from "../hooks/WidgetTable.mts"
import { useCallback } from "react"
import { SDPPPGraphForm } from "../../../../src/types/sdppp"
import WorkflowEdit from "../../../../src/common/WorkflowEdit"
import i18n from "../../../../src/common/i18n.mts"
import { useLivePainting } from "../hooks/livePainting.mts"
import { DropdownWidget } from "../EditWidgets/DropdownWidget.js";
import { PrimitiveNumberWidget } from "../EditWidgets/PrimitiveNumberWidget.js";
import { PrimitiveStringWidget } from "../EditWidgets/PrimitiveStringWidget.js";
import { PrimitiveToggleWidget } from "../EditWidgets/PrimitiveToggleWidget.js";


export function WorkflowEditPhotoshop() {
    const {
        callForPSDExtract
    } = useSDPPPComfyCaller();
    const { workflowAgent } = useSDPPPInternalContext();
    const {
        form: widgetTableForm,
        setWidgetValue
    } = useWidgetTable();
    const {
        setShouldTriggerLivePainting
    } = useLivePainting();

    const hasSamplePSD = !!workflowAgent?.data.hasPSDNodes;

    const onWidgetChange = useCallback(async (nodeid: number, widgetIndex: number, value: any, originNodeData: SDPPPGraphForm) => {
        await setWidgetValue(nodeid, widgetIndex, value);
        setShouldTriggerLivePainting(true);
    }, [setWidgetValue, setShouldTriggerLivePainting]);

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
        } else if (widget.outputType === 'number') {
            const min = widget.options?.min ?? 0;
            const max = widget.options?.max ?? 100;
            const step = widget.options?.step ?? 1;

            context.result.push(
                <PrimitiveNumberWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    inputMin={min}
                    inputMax={max}
                    inputStep={step}
                    value={parseFloat(widget.value)}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />)
        } else if (widget.outputType === 'combo') {
            context.result.push(
                <DropdownWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    options={widget.options?.values || []}
                    onSelectUpdate={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    value={widget.value}
                />
            )
        } else if (widget.outputType === 'toggle') {
            context.result.push(
                <PrimitiveToggleWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    name={widget.name}
                    value={widget.value}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            )

        } else {
            context.result.push(
                <PrimitiveStringWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    value={typeof widget.value === 'string' ? widget.value : JSON.stringify(widget.value)}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            )
        }
        return false;
    }, [setWidgetValue]);

    if (!widgetTableForm) {
        return null;
    }
    return (
        <div className="workflow-edit">
            <div className="workflow-edit-title">
                {workflowAgent?.data.lastOpenedWorkflow && <sp-label style={{ fontWeight: 'bold' }}>{workflowAgent?.data.lastOpenedWorkflow}</sp-label>}
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
