import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { WidgetableRenderer, WidgetableRendererProps, RenderContext } from '../WidgetableRenderer';
import { WidgetableStructureNode, WidgetableValue } from '../types';

// 创建一个具体的实现类用于测试
class TestWidgetableRenderer extends WidgetableRenderer {
    protected renderers = {
        'text': (fieldInfo: WidgetableStructureNode, widget: WidgetableStructureNode['widgets'][0], widgetIndex: number) => {
            return <div data-testid="text-widget">Text Widget</div>;
        },
        'number': (fieldInfo: WidgetableStructureNode, widget: WidgetableStructureNode['widgets'][0], widgetIndex: number) => {
            return <div data-testid="number-widget">Number Widget</div>;
        }
    };
}

describe('WidgetableRenderer', () => {
    const mockFieldInfo: WidgetableStructureNode = {
        id: 1,
        title: 'testField',
        widgets: [
            {
                outputType: 'text',
                options: {}
            },
            {
                outputType: 'number',
                options: {}
            }
        ],
        uiWeightSum: 12
    };

    const mockProps: WidgetableRendererProps = {
        widgetableValue: {},
        onWidgetChange: vi.fn(),
    };

    let renderer: TestWidgetableRenderer;

    beforeEach(() => {
        renderer = new TestWidgetableRenderer();
    });

    describe('render', () => {
        it('should render text widget when outputType is text', () => {
            const result = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{result}</>);
            expect(container.querySelector('[data-testid="text-widget"]')).toBeInTheDocument();
        });

        it('should render number widget when outputType is number', () => {
            const result = renderer.render(mockFieldInfo, mockFieldInfo.widgets[1], 1);
            const { container } = render(<>{result}</>);
            expect(container.querySelector('[data-testid="number-widget"]')).toBeInTheDocument();
        });

        it('should return null for unknown outputType', () => {
            const unknownWidget = { ...mockFieldInfo.widgets[0], outputType: 'unknown' };
            const result = renderer.render(mockFieldInfo, unknownWidget, 0);
            expect(result).toBeNull();
        });
    });

    describe('renderTitle', () => {
        it('should render title in a div', () => {
            const result = renderer.renderTitle('Test Title', mockFieldInfo);
            const { container } = render(<>{result}</>);
            expect(container.textContent).toBe('Test Title');
        });
    });
}); 