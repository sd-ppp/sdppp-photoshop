import React, { useState, useEffect, useCallback } from "react";
import { BaseFormWidget } from "../../../../src/common/tsx/BaseFormWidget";

interface PrimitiveNumberWidgetProps {
    inputMin: number,
    inputMax: number,
    inputStep: number
    value?: number,
    onValueChange: (value: number) => void,
    name?: string,
    uiWeight?: number
}

export const PrimitiveNumberWidget: React.FC<PrimitiveNumberWidgetProps> = (props) => {
    const { inputMin, inputMax, inputStep, value = 0, onValueChange, name, uiWeight } = props;
    const [localValue, setLocalValue] = useState<number>(+value.toFixed(3));

    // Update local state when props value changes
    useEffect(() => {
        setLocalValue(+value.toFixed(3));
    }, [value]);

    const handleInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = +event.target.value;
        setLocalValue(+newValue.toFixed(3));
    }, []);

    const handleBlur = useCallback(() => {
        onValueChange(localValue);
    }, [localValue, onValueChange]);

    const computeUIWeightCSS = (weight?: number) => {
        return {
            flex: weight || 1
        };
    };

    return (
        <div style={{
            ...computeUIWeightCSS(uiWeight),
            display: 'flex', 
            alignItems: 'center'
        }}>
            {name && <sp-label style={{ flex: 1 }}>{name}</sp-label>}
            <sp-textfield
                style={name ? { flex: 2 } : { width: '100%' }}
                onInput={handleInput}
                onBlur={handleBlur}
                value={localValue}
            />
        </div>
    );
}; 
