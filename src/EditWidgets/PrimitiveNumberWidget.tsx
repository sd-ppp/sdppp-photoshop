import React from "react";
import { BaseFormWidget } from "../../../../src/common/tsx/BaseFormWidget";

interface PrimitiveNumberWidgetProps {
    inputMin: number,
    inputMax: number,
    inputStep: number
    value?: number,
    onValueChange: (value: number) => void,
    name?: string
}

export class PrimitiveNumberWidget extends BaseFormWidget<PrimitiveNumberWidgetProps, {}> {
    onInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = +event.target.value;
        this.setState({ value: +newValue.toFixed(3) });
        this.props.onValueChange(newValue);
    }

    render() {
        const value = +(this.props.value || 0).toFixed(3)

        return (
            <div style={{
                ...this.computeUIWeightCSS(this.props.uiWeight),
                display: 'flex', alignItems: 'center'
            }}>
                {this.props.name && <sp-label style={{ flex: 1 }}>{this.props.name}</sp-label>}
                <sp-textfield
                    style={{ flex: 2 }}
                    onInput={this.onInput}
                    value={value}
                />
            </div>
        );
    }
} 
