import { useMemo } from "react";
import { useState, useEffect } from "react";

export function computeUIWeightCSS(uiWeight: number | undefined) {
    uiWeight = uiWeight || 12;
    return { 
        flex: `${uiWeight} 0 calc(${uiWeight / 12 * 100}% - 10px)`,
        maxWidth: `100%`
    }
}
export function useUIWeightCSS(uiWeight: number) {
    return useMemo(() => computeUIWeightCSS(uiWeight), [uiWeight]);
}
export function simplifyWorkflowPath(path: string) {
    return (path.split('/').pop() || '').replace(/\.json$/, '')
}

// 通用防抖hook
export function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}