import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NumberWidget } from '../number';
import { ToggleWidget } from '../toggle';
import { ComboWidget } from '../combo';
import { StringWidget } from '../string';
import { EditableTitle } from '../EditableTitle';

describe('NumberWidget', () => {
    const defaultProps = {
        inputMin: 0,
        inputMax: 100,
        inputStep: 1,
        value: 50,
        onValueChange: vi.fn(),
        uiWeight: 1,
    };

    it('renders with name prop', () => {
        render(<NumberWidget {...defaultProps} name="Test Number" />);
        expect(screen.getByText('Test Number')).toBeInTheDocument();
    });

    it('calls onValueChange when input loses focus', () => {
        render(<NumberWidget {...defaultProps} />);
        const input = screen.getByRole('spinbutton');
        fireEvent.change(input, { target: { value: '75' } });
        fireEvent.blur(input);
        expect(defaultProps.onValueChange).toHaveBeenCalledWith(75);
    });

    it('renders slider when conditions are met', () => {
        const props = {
            ...defaultProps,
            extraOptions: { useSliderForNumberWidget: true },
        };
        render(<NumberWidget {...props} />);
        expect(screen.getByRole('slider')).toBeInTheDocument();
    });

});

describe('ToggleWidget', () => {
    const defaultProps = {
        value: false,
        onValueChange: vi.fn(),
        uiWeight: 1,
    };

    it('renders with default props', () => {
        render(<ToggleWidget {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeInTheDocument();
        expect(checkbox).not.toBeChecked();
    });

    it('renders with name prop', () => {
        render(<ToggleWidget {...defaultProps} name="Test Toggle" />);
        expect(screen.getByText('Test Toggle')).toBeInTheDocument();
    });

    it('calls onValueChange when toggled', () => {
        render(<ToggleWidget {...defaultProps} />);
        const checkbox = screen.getByRole('checkbox');
        fireEvent.click(checkbox);
        expect(defaultProps.onValueChange).toHaveBeenCalledWith(true);
    });

    it('renders checked state correctly', () => {
        render(<ToggleWidget {...defaultProps} value={true} />);
        const checkbox = screen.getByRole('checkbox');
        expect(checkbox).toBeChecked();
    });
});

describe('ComboWidget', () => {
    const defaultProps = {
        options: ['Option 1', 'Option 2', 'Option 3'],
        value: 'Option 1',
        onSelectUpdate: vi.fn(),
        uiWeight: 1,
    };

    it('renders with default props', () => {
        render(<ComboWidget {...defaultProps} />);
        const select = screen.getByRole('combobox');
        expect(select).toBeInTheDocument();
        expect(screen.getByTitle('Option 1')).toBeInTheDocument();
    });

    it('renders with name prop', () => {
        render(<ComboWidget {...defaultProps} name="Test Combo" />);
        expect(screen.getByText('Test Combo')).toBeInTheDocument();
    });

    it('calls onSelectUpdate when option is selected', () => {
        render(<ComboWidget {...defaultProps} />);
        const select = screen.getByRole('combobox');
        fireEvent.mouseDown(select);
        const option = screen.getByTitle('Option 2');
        fireEvent.click(option);
        expect(defaultProps.onSelectUpdate).toHaveBeenCalledWith('Option 2', 1);
    });

    it('supports search functionality', () => {
        render(<ComboWidget {...defaultProps} />);
        const select = screen.getByRole('combobox');
        fireEvent.change(select, { target: { value: 'Option 2' } });
        expect(screen.getByTitle('Option 2')).toBeInTheDocument();
    });
});

describe('StringWidget', () => {
    const defaultProps = {
        value: 'Initial text',
        onValueChange: vi.fn(),
        uiWeight: 1,
    };

    it('renders with default props', () => {
        render(<StringWidget {...defaultProps} />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toBeInTheDocument();
        expect(textarea).toHaveValue('Initial text');
    });

    it('calls onValueChange when text is modified', () => {
        render(<StringWidget {...defaultProps} />);
        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'New text' } });
        expect(defaultProps.onValueChange).toHaveBeenCalledWith('New text');
    });

    it('renders with empty value', () => {
        render(<StringWidget {...defaultProps} value="" />);
        const textarea = screen.getByRole('textbox');
        expect(textarea).toHaveValue('');
    });
});

describe('EditableTitle', () => {
    const defaultProps = {
        title: 'Initial Title',
        onTitleChange: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders with initial title', () => {
        render(<EditableTitle {...defaultProps} />);
        expect(screen.getByText('Initial Title')).toBeInTheDocument();
    });

    it('enters edit mode on click', () => {
        render(<EditableTitle {...defaultProps} />);
        const title = screen.getByText('Initial Title');
        fireEvent.click(title);
        const input = screen.getByRole('textbox');
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('Initial Title');
    });

    it('saves changes on blur', () => {
        render(<EditableTitle {...defaultProps} />);
        const title = screen.getByText('Initial Title');
        fireEvent.click(title);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title' } });
        fireEvent.blur(input);
        expect(defaultProps.onTitleChange).toHaveBeenCalledWith('New Title');
    });

    it('saves changes on Enter key', () => {
        render(<EditableTitle {...defaultProps} />);
        const title = screen.getByText('Initial Title');
        fireEvent.click(title);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title' } });
        fireEvent.keyDown(input, { key: 'Enter' });
        expect(defaultProps.onTitleChange).toHaveBeenCalledWith('New Title');
    });

    it('cancels changes on Escape key', () => {
        render(<EditableTitle {...defaultProps} />);
        const title = screen.getByText('Initial Title');
        fireEvent.click(title);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'New Title' } });
        fireEvent.keyDown(input, { key: 'Escape' });
        expect(screen.getByText('Initial Title')).toBeInTheDocument();
        expect(defaultProps.onTitleChange).not.toHaveBeenCalled();
    });
}); 