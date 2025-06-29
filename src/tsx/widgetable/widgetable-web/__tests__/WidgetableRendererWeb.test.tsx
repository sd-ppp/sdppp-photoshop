import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { WidgetableRenderWeb } from '../WidgetableRendererWeb';
import { WidgetableStructureNode, WidgetableValue } from '../../widgetable-library/types';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('WidgetableRenderWeb', () => {
    let renderer: WidgetableRenderWeb;
    const mockOnWidgetChange = vi.fn();
    const mockOnTitleRender = vi.fn();

    beforeEach(() => {
        renderer = new WidgetableRenderWeb();
        renderer.setProps({
            widgetableValue: {} as WidgetableValue,
            onWidgetChange: mockOnWidgetChange,
            onTitleRender: mockOnTitleRender,
            extraOptions: {}
        });
        vi.clearAllMocks();
    });

    describe('renderNumberWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'number',
                name: 'Test Number',
                options: {
                    min: 0,
                    max: 100,
                    step: 1
                }
            }],
            uiWeightSum: 12
        };

        it('should render number widget with correct props', () => {
            const widgetableValue: WidgetableValue = {
                1: ['50']
            };
            renderer.setProps({
                widgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: mockOnTitleRender,
                extraOptions: {}
            });

            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toBeInTheDocument();
            // Add more specific assertions based on your NumberWidget implementation
        });
    });

    describe('renderComboWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'combo',
                name: 'Test Combo',
                options: {
                    values: ['option1', 'option2', 'option3']
                }
            }],
            uiWeightSum: 12
        };

        it('should render combo widget with correct props', () => {
            const widgetableValue: WidgetableValue = {
                1: ['option1']
            };
            renderer.setProps({
                widgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: mockOnTitleRender,
                extraOptions: {}
            });

            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toBeInTheDocument();
            // Add more specific assertions based on your ComboWidget implementation
        });
    });

    describe('renderToggleWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'toggle',
                name: 'Test Toggle'
            }],
            uiWeightSum: 12
        };

        it('should render toggle widget with correct props', () => {
            const widgetableValue: WidgetableValue = {
                1: ['true']
            };
            renderer.setProps({
                widgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: mockOnTitleRender,
                extraOptions: {}
            });

            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toBeInTheDocument();
            // Add more specific assertions based on your ToggleWidget implementation
        });
    });

    describe('renderStringWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'string',
                name: 'Test String'
            }],
            uiWeightSum: 12
        };

        it('should render string widget with correct props', () => {
            const widgetableValue: WidgetableValue = {
                1: ['test value']
            };
            renderer.setProps({
                widgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: mockOnTitleRender,
                extraOptions: {}
            });

            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toBeInTheDocument();
            // Add more specific assertions based on your StringWidget implementation
        });
    });

    describe('renderPSOnlyWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'PS_LAYER',
                name: 'Test PS Layer'
            }],
            uiWeightSum: 12
        };

        it('should render PS only message', () => {
            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toHaveTextContent('only supported in Photoshop');
        });
    });

    describe('renderImageWidget', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [{
                outputType: 'IMAGE_PATH',
                name: 'Test Image',
                options: {
                    values: ['image1.jpg', 'image2.jpg']
                }
            }],
            uiWeightSum: 12
        };

        it('should render image widget with correct props', () => {
            const widgetableValue: WidgetableValue = {
                1: ['image1.jpg']
            };
            renderer.setProps({
                widgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: mockOnTitleRender,
                extraOptions: {}
            });

            const element = renderer.render(mockFieldInfo, mockFieldInfo.widgets[0], 0);
            const { container } = render(<>{element}</>);

            expect(container).toBeInTheDocument();
            // Add more specific assertions based on your ImageWidget implementation
        });
    });

    describe('renderTitle', () => {
        const mockFieldInfo: WidgetableStructureNode = {
            id: 1,
            title: 'Test Field',
            widgets: [],
            uiWeightSum: 12
        };

        it('should use custom title renderer when provided', () => {
            const customTitle = 'Custom Title';
            mockOnTitleRender.mockReturnValue(<div>{customTitle}</div>);

            const element = renderer.renderTitle('Original Title', mockFieldInfo);
            const { container } = render(<>{element}</>);

            expect(mockOnTitleRender).toHaveBeenCalledWith('Original Title', mockFieldInfo);
            expect(container).toHaveTextContent(customTitle);
        });

        it('should render default title when no custom renderer provided', () => {
            renderer.setProps({
                widgetableValue: {} as WidgetableValue,
                onWidgetChange: mockOnWidgetChange,
                onTitleRender: undefined,
                extraOptions: {}
            });

            const element = renderer.renderTitle('Default Title', mockFieldInfo);
            const { container } = render(<>{element}</>);

            expect(container).toHaveTextContent('Default Title');
        });
    });
}); 