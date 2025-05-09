import React, { useState, useEffect, useCallback } from "react";
import { computeUIWeightCSS } from "../../../../src/common/tsx/util";

interface PrimitiveNumberWidgetProps {
    inputMin: number,
    inputMax: number,
    inputStep: number
    value?: number,
    onValueChange: (value: number) => void,
    name?: string,
    uiWeight?: number,
    extraOptions?: Record<string, any>
}

export const PrimitiveNumberWidget: React.FC<PrimitiveNumberWidgetProps> = (props) => {
    const { inputMin, inputMax, inputStep, value = 0, onValueChange, name, uiWeight, extraOptions } = props;
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

    // 检查步长范围是否过大
    let isStepRangeTooBig = ((inputMax - inputMin) / inputStep) > 1000;
    if (!isStepRangeTooBig && uiWeight && uiWeight >= 1 && extraOptions?.useSliderForNumberWidget) {
        return (
            <div style={{
                ...computeUIWeightCSS(uiWeight),
                display: 'flex',
                alignItems: 'center'
            }}>
                <sp-slider
                    style={{
                        width: '60%'
                    }}
                    min={inputMin}
                    max={inputMax}
                    step={inputStep}
                    value={localValue}
                    onInput={handleInput}
                    onBlur={handleBlur}
                    show-value="false"
                    class="sdppp-slider"
                >
                </sp-slider>
                <sp-textfield
                    style={{
                        width: '40%'
                    }}
                    onInput={handleInput}
                    onBlur={handleBlur}
                    value={localValue} 
                />
            </div>
        );
    } else {
        return (
            <div style={{
                ...computeUIWeightCSS(uiWeight),
                display: 'flex',
                alignItems: 'center'
            }}>
                {name && <sp-label style={{ flex: '1' }}>{name}</sp-label>}
                <sp-textfield
                    style={name ? { flex: '2' } : { width: '100%' }}
                    onInput={handleInput}
                    onBlur={handleBlur}
                    value={localValue}
                />
            </div>
        );
    }
}; 
