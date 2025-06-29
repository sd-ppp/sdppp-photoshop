import React, { ReactNode, FC } from "react";
import { NumberWidget } from "./widgets/number";
import { ComboWidget } from "./widgets/combo";
import { ToggleWidget } from "./widgets/toggle";
import { StringWidget } from "./widgets/string";
import { WidgetableComboWidget, WidgetableImagesWidget, WidgetableNode, WidgetableNumberWidget, WidgetableStringWidget, WidgetableToggleWidget, WidgetableValues, WidgetableWidget } from "../../../schemas/schemas";
import ImageSelect from "./widgets/images";
import { EditableTitle } from "./EditableTitle";

interface UseWidgetableRendererProps {
    widgetableValues: WidgetableValues;
    onWidgetChange: (nodeID: string, widgetIndex: number, value: any, fieldInfo: WidgetableNode) => void;
    onTitleChange: (nodeID: string, title: string) => void;
    extraOptions?: any;
}

interface RenderFunctions {
    renderWidget: (fieldInfo: WidgetableNode, widget: WidgetableWidget, widgetIndex: number) => React.ReactElement | null;
    renderTitle: (title: string, fieldInfo: WidgetableNode) => ReactNode;
}

export const useWidgetableRenderer = ({
    widgetableValues,
    onWidgetChange,
    onTitleChange,
    extraOptions
}: UseWidgetableRendererProps): RenderFunctions => {
    const renderToggleWidget = (fieldInfo: WidgetableNode, widget: WidgetableToggleWidget, widgetIndex: number): React.ReactElement => {
        return (
            <ToggleWidget
                uiWeight={widget.uiWeight || 12}
                key={widgetIndex}
                name={widget.name}
                value={widgetableValues[fieldInfo.id]?.[widgetIndex] || false}
                onValueChange={(v) => {
                    onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                }}
                extraOptions={extraOptions}
            />
        );
    };
    
    const renderNumberWidget = (fieldInfo: WidgetableNode, widget: WidgetableNumberWidget, widgetIndex: number): React.ReactElement => {
        const min = widget.options?.min ?? 0;
        const max = widget.options?.max ?? 100;
        const step = widget.options?.step ?? 1;

        return (
            <NumberWidget
                uiWeight={widget.uiWeight || 12}
                key={widgetIndex}
                inputMin={min}
                inputMax={max}
                inputStep={step}
                name={widget.name}
                value={parseFloat(widgetableValues[fieldInfo.id]?.[widgetIndex] || 0)}
                onValueChange={(v) => {
                    onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                }}
                extraOptions={extraOptions}
            />
        );
    };

    const renderComboWidget = (fieldInfo: WidgetableNode, widget: WidgetableComboWidget, widgetIndex: number): React.ReactElement => {
        return (
            <ComboWidget
                uiWeight={widget.uiWeight || 12}
                key={widgetIndex}
                options={widget?.options?.values || []}
                name={widget.name}
                onSelectUpdate={(v) => {
                    onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                }}
                value={widgetableValues[fieldInfo.id]?.[widgetIndex] || ''}
                extraOptions={extraOptions}
            />
        );
    };


    const renderStringWidget = (fieldInfo: WidgetableNode, widget: WidgetableStringWidget, widgetIndex: number): React.ReactElement => {
        return (
            <StringWidget
                uiWeight={widget.uiWeight || 12}
                key={widgetIndex}
                value={widgetableValues[fieldInfo.id]?.[widgetIndex] || ''}
                onValueChange={(v) => {
                    onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                }}
                extraOptions={extraOptions}
            />
        );
    };

    const renderImageWidget = (fieldInfo: WidgetableNode, widget: WidgetableImagesWidget, widgetIndex: number): React.ReactElement => {
        if (widget.options?.maxCount && widget.options.maxCount > 1) {
            return (
                <ImageSelect 
                    value={widgetableValues[fieldInfo.id]?.[widgetIndex] || []}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v, fieldInfo);
                    }}
                    maxCount={widget.options?.maxCount}
                    extraOptions={extraOptions}
                />
            );

        } else {
            return (
                <ImageSelect 
                    value={widgetableValues[fieldInfo.id] ? [widgetableValues[fieldInfo.id]?.[widgetIndex]] : []}
                    onValueChange={(v) => {
                        onWidgetChange(fieldInfo.id, widgetIndex, v[0], fieldInfo);
                    }}
                    maxCount={1}
                    extraOptions={extraOptions}
                />
            );
        }
    };

    const renderWidget = (fieldInfo: WidgetableNode, widget: WidgetableWidget, widgetIndex: number): React.ReactElement | null => {
        const widgetType = widget.outputType as string;
        
        switch (widgetType) {
            case 'number':
                return renderNumberWidget(fieldInfo, widget as WidgetableNumberWidget, widgetIndex);
            case 'combo':
                return renderComboWidget(fieldInfo, widget as WidgetableComboWidget, widgetIndex);
            case 'boolean':
            case 'toggle':
                return renderToggleWidget(fieldInfo, widget as WidgetableToggleWidget, widgetIndex);
            case 'string':
            case 'customtext':
            case 'text':
                return renderStringWidget(fieldInfo, widget as WidgetableStringWidget, widgetIndex);
            case 'images':
            case 'IMAGE_PATH':
            case 'MASK_PATH':
                return renderImageWidget(fieldInfo, widget as WidgetableImagesWidget, widgetIndex);
            default:
                return null;
        }
    };

    const renderTitle = (title: string, fieldInfo: WidgetableNode): ReactNode => {
        // return <EditableTitle title={title} onTitleChange={(newTitle) => {
        //     onTitleChange(fieldInfo.id, newTitle);
        // }} />;
        return <div>{title} {fieldInfo.widgets[0].options.required ? <span style={{ color: 'lightcoral' }}>*</span> : null}</div>;
    };

    return {
        renderWidget,
        renderTitle
    };
};

// // 保持原有的组件接口以向后兼容
// interface WidgetableRendererWebProps {
//     widgetableValue: WidgetableValues;
//     onWidgetChange: (nodeID: number, widgetIndex: number, value: any, fieldInfo: WidgetableNode) => void;
//     onTitleRender?: (title: string, fieldInfo: WidgetableNode) => ReactNode;
//     extraOptions?: any;
//     fieldInfo: WidgetableNode;
//     widget: WidgetableNode['widgets'][0];
//     widgetIndex: number;
// }