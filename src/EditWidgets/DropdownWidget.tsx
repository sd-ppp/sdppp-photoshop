import { BaseFormWidget } from "../../../../src/common/tsx/BaseFormWidget";

export interface DropdownWidgetProps {
    onSelectUpdate: (identify: string, index: number) => void,
    options: string[],
    value: string,
    name?: string,
}
export interface DropdownWidgetState {
    filter: string
}
export class DropdownWidget extends BaseFormWidget<DropdownWidgetProps, DropdownWidgetState> {
    state = {
        filter: ''
    }
    // Handle selection changes
    handleSelectUpdate = (value: string, index: number): void => {
        this.props.onSelectUpdate(value, index);
        this.setState({
            filter: ''
        })
    }

    // Render dropdown component
    render() {
        const { options, value, name } = this.props;

        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                ...this.computeUIWeightCSS(this.props.uiWeight),
            }}>
                {name && (
                    <sp-label style={{ flex: 1 }}>
                        {name}
                    </sp-label>
                )}
                <sp-picker
                    class="sdppp-dropdown-widget"
                    size="s"
                    style={this.props.name ? { flex: 2 } : { width: '100%' }}
                >
                    <sp-menu slot="options">
                        {options.map((id, index) => {
                            if (this.state.filter && !id.includes(this.state.filter)) {
                                return ''
                            }

                            return (
                                <sp-menu-item
                                    key={getOptionContent(id)}
                                    {...(getOptionContent(id) === getOptionContent(value) ? { selected: true } : {})}
                                    onClick={() => this.handleSelectUpdate(id, index)}
                                >
                                    {getOptionContent(id)}
                                </sp-menu-item>
                            )
                        })}
                    </sp-menu>
                </sp-picker>
            </div>
        );
    }
}

function getOptionContent(option: any) {
    if (typeof option === 'string') {
        return option
    }
    return option.content;
}