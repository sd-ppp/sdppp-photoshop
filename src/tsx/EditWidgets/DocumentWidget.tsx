import React from "react";
import { PhotoshopStoreHelper } from "../../../../src/plugins/common/store/helpers.mts";
import { DropdownWidget } from "../../../../src/plugins/common/tsx/EditWidgets/DropdownWidget";
import { SpeicialIDManager } from "../../logics/util.mts";
import { photoshopStore } from "../../logics/ModelDefines.mts";

interface DocumentWidgetProps {
    onSelectUpdate: (identify: string, index: number) => void,
    value: string,
    uiWeight: number
}
interface DocumentWidgetState {
    options: string[]
}

export class DocumentWidget extends React.Component<DocumentWidgetProps, DocumentWidgetState> {

    state = {
        options: PhotoshopStoreHelper.makeDocumentDataOptions(photoshopStore),
    }

    constructor(props: any) {
        super(props);
        photoshopStore.subscribe('/documents', this.updateOptions)
    }

    updateOptions = (): void => {
        const options = PhotoshopStoreHelper.makeDocumentDataOptions(photoshopStore)
        this.setState({ 
            options
            // value: DocumentWidget.getValueIfIsValidOptionOrCurrent(this.state.value, options)
        })
    }

    componentwillUnmount() {
        photoshopStore.unsubscribe(this.updateOptions)
    }

    static getValueIfIsValidOptionOrCurrent(value: string, options: string[]) {
        if (!options || options.includes(value))
            return value;
        else
            return SpeicialIDManager.getSpecialDocumentCurrent();
    }

    static getDerivedStateFromProps(props: DocumentWidgetProps, state: DocumentWidgetState) {
        let value = props.value
        if (value) {
            const split = value.split('/')
            const identify = DocumentWidget.getValueIfIsValidOptionOrCurrent(split.slice(1).join('/'), state.options);
            if (SpeicialIDManager.is_SPECIAL_DOCUMENT_CURRENT(identify))
                value = SpeicialIDManager.getSpecialDocumentCurrent();
            else
                value = identify
            if (split[0] != photoshopStore.data.uname) {
                props.onSelectUpdate(photoshopStore.data.uname + '/' + value, 0)
            }
            return Object.assign(state, { value })
        }
        return null
    }

    render() {
        const value =  DocumentWidget.getValueIfIsValidOptionOrCurrent(this.props.value, this.state.options)
        return <DropdownWidget
            uiWeight={this.props.uiWeight}
            options={this.state.options}
            onSelectUpdate={(identify, index) => {
                this.props.onSelectUpdate(photoshopStore.data.uname + '/' + identify, index)
            }}
            value={value}
        />
    }
} 
