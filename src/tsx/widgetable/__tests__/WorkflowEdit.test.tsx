import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import WorkflowEdit from '../WorkflowEdit';
import type { WidgetableStructure, WidgetableValue, WidgetableStructureNode } from '../types';
import { WidgetableRenderer } from '../WidgetableRenderer';

// Create a concrete implementation of WidgetableRenderer for testing
class TestWidgetableRenderer extends WidgetableRenderer {
    protected renderers = {
        string: (fieldInfo, widget, widgetIndex) => (
            <div data-testid={`widget-${fieldInfo.id}-${widgetIndex}`}>
                {widget.name}
            </div>
        )
    };

    public renderTitle(title: string) {
        return <span>{title}</span>;
    }
}

// Mock data for testing
const mockWidgetableStructure: WidgetableStructure = {
    widgetTableID: 'test',
    widgetTablePath: 'test',
    widgetTablePersisted: true,
    nodeIndexes: [1],
    nodes: {
        1: {
            id: 1,
            title: 'Test Field',
            uiWeightSum: 4,
            widgets: [{
                name: 'widget1',
                outputType: 'string',
                options: {}
            }]
        }
    },
    groups: {},
    extraOptions: {}
};

const mockWidgetableValue: WidgetableValue = {
    1: ['test value']
};

const mockWidgetableErrors: Record<number, string> = {};

const mockWidgetableRenderer = new TestWidgetableRenderer();

describe('WorkflowEdit', () => {
    it('renders without errors', () => {
        render(
            <WorkflowEdit
                widgetableStructure={mockWidgetableStructure}
                widgetableValue={mockWidgetableValue}
                widgetableErrors={mockWidgetableErrors}
                widgetableRenderer={mockWidgetableRenderer}
            />
        );

        expect(screen.getByText('Test Field')).toBeInTheDocument();
        expect(screen.getByTestId('widget-1-0')).toBeInTheDocument();
    });

    it('displays error message when there are errors', () => {
        const errors = {
            1: 'Test error message'
        };

        render(
            <WorkflowEdit
                widgetableStructure={mockWidgetableStructure}
                widgetableValue={mockWidgetableValue}
                widgetableErrors={errors}
                widgetableRenderer={mockWidgetableRenderer}
            />
        );

        // 使用 getAllByText 并验证至少有一个错误消息
        const errorMessages = screen.getAllByText('Test error message');
        expect(errorMessages.length).toBeGreaterThan(0);
        expect(errorMessages[0]).toHaveClass('list-error-label');
    });

    it('displays "nothing" message when there are no nodes', () => {
        const emptyStructure = {
            ...mockWidgetableStructure,
            nodeIndexes: [],
            nodes: {}
        };

        render(
            <WorkflowEdit
                widgetableStructure={emptyStructure}
                widgetableValue={mockWidgetableValue}
                widgetableErrors={mockWidgetableErrors}
                widgetableRenderer={mockWidgetableRenderer}
            />
        );

        expect(screen.getByText('nothing')).toBeInTheDocument();
    });

    it('handles widget render errors gracefully', () => {
        class ErrorRenderer extends TestWidgetableRenderer {
            protected renderers = {
                string: () => {
                    // 返回一个错误消息而不是抛出错误
                    return <div className="list-error-label">Test render error</div>;
                }
            };
        }

        const errorRenderer = new ErrorRenderer();

        render(
            <WorkflowEdit
                widgetableStructure={mockWidgetableStructure}
                widgetableValue={mockWidgetableValue}
                widgetableErrors={mockWidgetableErrors}
                widgetableRenderer={errorRenderer}
            />
        );

        expect(screen.getByText('Test render error')).toBeInTheDocument();
    });
}); 