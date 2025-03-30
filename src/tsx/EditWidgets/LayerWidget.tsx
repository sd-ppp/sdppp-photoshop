import React from "react";
import { getSelectedLayerIdentify, SpeicialIDManager } from "../../logics/util.mts";
import { photoshopStore } from "../../logics/ModelDefines.mts";
import QuickSetter from "./sub-widgets/QuickSetter";
import { PhotoshopStoreHelper } from "../../../../src/plugins/common/store/helpers.mts";
import i18n from "../../../../src/common/i18n.mts";
import { computeUIWeightCSS } from "../../../../src/common/tsx/util.mts";
import { DropdownWidget } from "../../../../src/plugins/common/tsx/EditWidgets/DropdownWidget";

interface LayerWidgetProps {
    onSelectUpdate: (identify: string, index: number) => void,
    value: string,
    uiWeight: number,
    documentValue?: string
}

interface LayerWidgetState {
    options: string[]
}

export class LayerWidget extends React.Component<LayerWidgetProps, LayerWidgetState> {
    state: LayerWidgetState = {
        options: []
    }

    constructor(props: any) {
        super(props);
        photoshopStore.subscribe('/documents', this.updataOptionsAfterDocumentChange)
    }

    componentwillUnmount() {
        photoshopStore.unsubscribe(this.updataOptionsAfterDocumentChange)
    }

    componentDidMount(): void {
        this.updateOptions(this.props.documentValue || SpeicialIDManager.getSpecialDocumentCurrent())
    }

    shouldComponentUpdate(nextProps: Readonly<LayerWidgetProps>, nextState: Readonly<LayerWidgetState>): boolean {
        if (nextProps.documentValue != this.props.documentValue && nextProps.documentValue) {
            this.updateOptions(nextProps.documentValue)
        }
        return true
    }

    updataOptionsAfterDocumentChange = (): void => {
        this.updateOptions(this.props.documentValue || SpeicialIDManager.getSpecialDocumentCurrent())
    }

    updateOptions = (documentIdentify: string): void => {
        documentIdentify = documentIdentify || this.props.documentValue || SpeicialIDManager.getSpecialDocumentCurrent()
        const document = PhotoshopStoreHelper.findDocumentData(
            photoshopStore,
            documentIdentify
        );
        if (!document) {
            this.setState({ options: [] });
            return;
        }

        const options = PhotoshopStoreHelper.makeLayerOptions(
            document,
            SpeicialIDManager.getSpecialLayerForGet()
        );
        this.setState({ options });
    }

    render() {
        let value = this.props.value;
        if (value) {
            try {
                value = i18n(value as any);
            } catch (e) {
            }
        }

        return <div className="sdppp-layer-widget" style={computeUIWeightCSS(this.props.uiWeight)}>
            <div className="sdppp-layer-widget-dropdown">
                <DropdownWidget
                    uiWeight={12}
                    options={this.state.options}
                    onSelectUpdate={this.props.onSelectUpdate}
                    value={value}
                />
            </div>
            <div className="sdppp-layer-widget-quick-set">
                <sp-label>{i18n("Quick Set")}:</sp-label>
                <QuickSetter
                    onClick={async () => {
                        const layerIdentify = getSelectedLayerIdentify();
                        this.props.onSelectUpdate(
                            layerIdentify,
                            this.state.options.indexOf(layerIdentify)
                        )
                    }}
                    label={i18n("Selected Layer")}
                />
                <QuickSetter
                    onClick={async () => {
                        this.props.onSelectUpdate(
                            SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS(),
                            this.state.options.indexOf(SpeicialIDManager.get_SPECIAL_LAYER_USE_CANVAS())
                        )
                    }}
                    label={i18n("Canvas")}
                />
            </div>
        </div>
    }
} 
