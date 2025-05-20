import React from "react";
import { BaseFormWidget } from "../../../../src/common/tsx/BaseFormWidget";
import { sdpppX } from "../../../../src/common/sdpppX.mts";

interface PrimitiveToggleWidgetProps {
    value?: any,
    name?: string,
    onValueChange: (value: boolean) => void,
    extraOptions?: Record<string, any>
}

export class PrimitiveToggleWidget extends BaseFormWidget<PrimitiveToggleWidgetProps, {}> {

    onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = !!event.target.value;
        this.setState({ value: newValue });
        this.props.onValueChange(newValue);
    }

    render() {
        const checkedAttr = !!this.props.value ? { 'checked': true } : {};
        if (sdpppX.checkboxStyle === 'div') {
            return <div
                className={(checkedAttr.checked ? 'active' : '') + ' sdppp-checkbox'}
                onClick={(e: any) => {
                    this.props.onValueChange(!this.props.value)
                }}
            >{this.props.name || ''}</div>
        } else {
            return <sp-checkbox
                label={this.props.name || ''}
                style={{
                    ...this.computeUIWeightCSS(this.props.uiWeight)
                }}
                onInput={(e: any) => {
                    this.props.onValueChange(e.target.checked)
                }}
                {...checkedAttr}
            >{this.props.name || ''}</sp-checkbox>
        }
        }
} 
