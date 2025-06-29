import React, { useEffect, useState } from 'react';
import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import { useUIWeightCSS } from '../../utils';
import { BaseWidgetProps } from './_base';
import debug from 'debug';

const log = debug('string-widget');
const { TextArea } = Input;

interface StringWidgetProps extends BaseWidgetProps {
    value?: string;
    onValueChange: (value: string) => void;
    extraOptions?: Record<string, any>;
}

export const StringWidget: React.FC<StringWidgetProps> = ({
    value = '',
    onValueChange,
    uiWeight
}) => {
    const uiWeightCSS = useUIWeightCSS(uiWeight || 12);
    const [localValue, setLocalValue] = useState(value);

    const handleChange: TextAreaProps['onChange'] = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setLocalValue(e.target.value);
    };

    const handleBlur: TextAreaProps['onBlur'] = (e: React.FocusEvent<HTMLTextAreaElement>) => {
        onValueChange(e.target.value);
    };

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    return (
        <div
            className="widget-container"
            style={uiWeightCSS}
        >
            <TextArea
                value={localValue}
                onChange={handleChange}
                onBlur={handleBlur}
                autoSize={{ minRows: 1 }}
            />
        </div>
    );
};
