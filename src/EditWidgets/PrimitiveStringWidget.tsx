import React, { useCallback, useEffect, useState } from "react";
import { BaseFormWidget } from "../../../../src/common/tsx/BaseFormWidget";
import { computeUIWeightCSS } from "../../../../src/common/tsx/util";

interface PrimitiveStringWidgetProps {
    value?: string,
    onValueChange: (value: string) => void,
    extraOptions?: Record<string, any>
}

export function PrimitiveStringWidget(props: PrimitiveStringWidgetProps & { uiWeight?: any }) {
    const hiddenDivRef = React.useRef<HTMLDivElement | null>(null);
    const [hiddenDivHeight, setHiddenDivHeight] = useState(0);
    const [textAreaValue, setTextAreaValue] = useState(props.value ?? '');
    const [editing, setEditing] = useState(false);

    useEffect(() => {
        if (editing) return;
        setTextAreaValue(props.value ?? '');
    }, [props.value]);

    useEffect(() => {
        const heightChecker = setInterval(() => {
            if (hiddenDivRef.current) {
                const height = hiddenDivRef.current.offsetHeight;
                if (height !== hiddenDivHeight) {
                    setHiddenDivHeight(height);
                }
            }
        }, 16);
        return () => clearInterval(heightChecker);
    }, [hiddenDivHeight]);

    return (
        <div
            className="widget-container"
            style={{
                ...computeUIWeightCSS(props.uiWeight),
                position: 'relative',
                height: Math.max(55, hiddenDivHeight)
            }}>
            <SmartTextArea 
                textAreaValue={textAreaValue} 
                setTextAreaValue={setTextAreaValue}

                editing={editing}
                setEditing={setEditing}

                onValueChange={props.onValueChange} 
                hiddenDivHeight={hiddenDivHeight}
            />
            <p
                ref={hiddenDivRef}
                style={{ fontSize: 14, visibility: 'hidden', whiteSpace: 'pre-line' }}
            >
                {textAreaValue}
            </p>
        </div>
    );
}

enum TextfieldRerenderEnum {
    none = 0,    // dont
    should = 1,  // should
    pending = 2  // should but waiting for blur
}

function SmartTextArea({ 
    textAreaValue, 
    onValueChange,
    editing,
    setEditing,
    setTextAreaValue,
    hiddenDivHeight
}: { 
    textAreaValue: string, 
    setTextAreaValue: (value: string) => void,
    editing: boolean,
    setEditing: (value: boolean) => void,
    onValueChange: (value: string) => void,
    hiddenDivHeight: number
}) {
    const [textfieldRerender, setTextfieldRerender] = useState(TextfieldRerenderEnum.none);
    const onInput = useCallback((event: Event) => {
        const newValue = (event.target as any).value;
        onValueChange(newValue);
        setTextAreaValue(newValue);
    }, [onValueChange, setTextAreaValue]);

    const onFocus = useCallback(() => {
        setEditing(true);
    }, [setEditing]);

    const onBlur = useCallback(() => {
        const setter = {
            textfieldRerender: textfieldRerender,
            editing: false
        }
        if (textfieldRerender == TextfieldRerenderEnum.pending) {
            setter.textfieldRerender = TextfieldRerenderEnum.should
        }
        setTextfieldRerender(setter.textfieldRerender);
        setEditing(setter.editing);
    }, [textfieldRerender, setTextfieldRerender, setEditing]);

    const [previousHiddenDivHeight, setPreviousHiddenDivHeight] = useState(hiddenDivHeight);
    useEffect(() => {
        if (hiddenDivHeight != previousHiddenDivHeight) {
            setTextfieldRerender(editing ?
                TextfieldRerenderEnum.pending :
                TextfieldRerenderEnum.should
            );
            setPreviousHiddenDivHeight(hiddenDivHeight);
        }
    }, [hiddenDivHeight]);

    // const [previousTextfieldRerender, setPreviousTextfieldRerender] = useState(TextfieldRerenderEnum.none);
    useEffect(() => {
        if (
            textfieldRerender == TextfieldRerenderEnum.should
            // && textfieldRerender != previousTextfieldRerender
        ) {
            Promise.resolve().then(async () => {
                await new Promise(requestAnimationFrame)
                setTextfieldRerender(TextfieldRerenderEnum.none)
            })
            // setPreviousTextfieldRerender(textfieldRerender)
        }
    }, [textfieldRerender]);

    return textfieldRerender == TextfieldRerenderEnum.should ? "" :
        <sp-textarea style={{ position: 'absolute', height: '100%', width: '100%', top: 0, left: 0 }}
            value={textAreaValue}
            onInput={onInput}
            onFocus={onFocus}
            onBlur={onBlur}
        >
        </sp-textarea>
}