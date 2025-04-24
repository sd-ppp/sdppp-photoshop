import { DocumentWidget } from "./EditWidgets/DocumentWidget"
import { LayerWidget } from "./EditWidgets/LayerWidget"
import { MaskWidget } from "./EditWidgets/MaskWidget"
import { ImageWidget } from "./EditWidgets/ImageWidget"
import { useSDPPPInternalContext } from "../contexts/sdppp-internal"
import { useSDPPPComfyCaller } from "../hooks/ComfyCaller.mts"
import { useWidgetTable } from "../hooks/WidgetTable.mts"
import { useCallback } from "react"
import WorkflowEdit from "../../../../src/common/WorkflowEdit"
import i18n from "../../../../src/common/i18n.mts"
import { useLivePainting } from "../hooks/livePainting.mts"
import { DropdownWidget } from "../EditWidgets/DropdownWidget.js";
import { PrimitiveNumberWidget } from "../EditWidgets/PrimitiveNumberWidget.js";
import { PrimitiveStringWidget } from "../EditWidgets/PrimitiveStringWidget.js";
import { PrimitiveToggleWidget } from "../EditWidgets/PrimitiveToggleWidget.js";
import { WidgetTableStructureNode } from "../../../../src/types/sdppp/index.js"
import { useStore } from "../../../../src/common/store/store-hooks.mjs"
import { simplifyWorkflowPath } from "../../../../src/common/string-util.mts"

export function WorkflowEditPhotoshop() {
    const {
        callForPSDExtract
    } = useSDPPPComfyCaller();
    const { workflowAgent } = useSDPPPInternalContext();
    const {
        setWidgetValue
    } = useWidgetTable();
    const {
        setShouldTriggerLivePainting
    } = useLivePainting();
    const {
        state
    } = useStore(workflowAgent, ['/widgetTableValue', '/widgetTableStructure', '/widgetTableErrors']);

    const hasSamplePSD = !!workflowAgent?.data.hasPSDNodes;

    const onWidgetChange = useCallback(async (nodeid: number, widgetIndex: number, value: any, originNodeData: WidgetTableStructureNode) => {
        await setWidgetValue(nodeid, widgetIndex, value);
        setShouldTriggerLivePainting(true);
    }, [setWidgetValue, setShouldTriggerLivePainting]);

    const widgetTableStructure = state?.widgetTableStructure;
    const widgetTableValue = state?.widgetTableValue;
    const widgetTableErrors = state?.widgetTableErrors;
    const onWidgetRender = useCallback((
        context: {
            keepRender: boolean,
            result: any[]
        },
        fieldInfo: WidgetTableStructureNode,
        widget: WidgetTableStructureNode['widgets'][number],
        widgetIndex: number
    ) => {

        if (widget.outputType == 'PS_DOCUMENT') {
            context.result.push(
                <DocumentWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
                    onSelectUpdate={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    key={widgetIndex}
                />
            );
            return true;
        } else if (widget.outputType == 'PS_LAYER') {
            const documentNodeID = widget.options?.documentNodeID || 0;
            const documentValue = widgetTableValue?.[documentNodeID]?.[0] || '';
            context.result.push(
                <LayerWidget
                    uiWeight={widget.uiWeight || 12}
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
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
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
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
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
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
                    name={widget.name}
                    inputMin={min}
                    inputMax={max}
                    inputStep={step}
                    value={parseFloat(widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || '0')}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />)
        } else if (widget.outputType === 'combo') {
            context.result.push(
                <DropdownWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    name={widget.name}
                    options={widget.options?.values || []}
                    onSelectUpdate={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
                />
            )
        } else if (widget.outputType === 'toggle') {
            context.result.push(
                <PrimitiveToggleWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    name={widget.name}
                    value={widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || ''}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            )

        } else {
            const value = widgetTableValue?.[fieldInfo.id]?.[widgetIndex] || '';
            context.result.push( 
                <PrimitiveStringWidget
                    uiWeight={widget.uiWeight || 12}
                    key={widgetIndex}
                    value={typeof value === 'string' ? value : JSON.stringify(value)}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                />
            )
        }
        return false;
    }, [setWidgetValue, widgetTableValue]);

    if (!widgetTableStructure) {
        return null;
    }
    return ( 
        <div className="workflow-edit">
            <div className="workflow-edit-title">
                {widgetTableStructure.widgetTablePath && <sp-label style={{ fontWeight: 'bold' }}>{simplifyWorkflowPath(widgetTableStructure.widgetTablePath)}</sp-label>}
                {hasSamplePSD ? <a onClick={() => { callForPSDExtract(workflowAgent?.data.sid || '') }}>{'>' + i18n('sample .psd')}</a> : ''}
            </div>
            <WorkflowEdit
                widgetTableStructure={widgetTableStructure}
                widgetTableValue={widgetTableValue || {}}
                widgetTableErrors={widgetTableErrors || {}}
                onWidgetChange={onWidgetChange}
                onWidgetRender={onWidgetRender}
            />
        </div>
    ); 
}
