import WorkflowEdit from "../../../../src/common/WorkflowEdit";
import { SDPPPGraphForm } from "../../../../src/types/sdppp";
import { createRoot } from "react-dom/client";
import { useState } from "react";

const editDialog = document.createElement('dialog')
editDialog.className = 'sdppp-dialog'
document.body.appendChild(editDialog)
let rendered = false;
const _form: SDPPPDialogForm = {};
let forceUpdate: (() => void) | null = null;

export function editDialogShow(form: SDPPPDialogForm, onConfirm: (form: SDPPPDialogForm) => void, onCancel: () => void) {
    if (!rendered) {
        let editDialogConfirm: () => void = () => {
            onConfirm(_form);
            editDialog.close();
            // delete all properties of _form
            for (const key in _form) {
                delete _form[key];
            }
            forceUpdate?.();
        };
        let editDialogCancel: () => void = () => {
            onCancel();
            editDialog.close();
            // delete all properties of _form
            for (const key in _form) {
                delete _form[key];
            }
            forceUpdate?.();
        };

        createRoot(editDialog).render(<SDPPPPhotoshopDialog
            form={_form}
            onConfirm={editDialogConfirm}
            onCancel={editDialogCancel}
            forceUpdater={(_forceUpdate) => {
                forceUpdate = _forceUpdate;
            }}
        />);
        rendered = true;
    }
    // assign all properties of form to _form
    Object.assign(_form, form);
    editDialog.showModal();
    forceUpdate?.();
}


interface SDPPPPhotoshopDialogProps {
    form: SDPPPDialogForm,
    onConfirm: () => void,
    onCancel: () => void,
    forceUpdater: (forceUpdate: () => void) => void
    // formDatas: SDPPPGraphForm[];
    // onValueChange: (nodeID: number, value: any) => void
}
interface SDPPPDialogForm {
    [id: number]: SDPPPDialogFormItem
}
interface SDPPPDialogFormItem {
    id: number;
    name: string;
    value: any,
    type: string,
    options?: any
}

function SDPPPPhotoshopDialog(props: SDPPPPhotoshopDialogProps) {
    const formData = Object
        .entries(props.form)
        .map(([, item]) => ({
            id: item.id,
            title: item.name,
            widgets: [{
                value: item.value,
                name: item.name,
                outputType: item.type,
                options: item.options
            }],
            uiWeightSum: 12
        }))
    const [, forceUpdate] = useState({});
    props.forceUpdater(() => forceUpdate({}));

    return (
        <>
            <div className="sdppp-dialog-content">
                <WorkflowEdit
                    formDatas={formData}
                    onWidgetChange={(nodeID: number, widgetIndex: number, value: any, originNodeData: SDPPPGraphForm) => {
                        props.form[originNodeData.id].value = value;
                    }}
                    onWidgetRender={(
                        context: {
                            keepRender: boolean,
                            result: any[]
                        },
                        fieldInfo: SDPPPGraphForm,
                        widget: SDPPPGraphForm['widgets'][number],
                        widgetIndex: number
                    ) => {
                        if (widget.outputType == 'text') {
                            context.result.push(
                                <sp-textfield type="text" value={widget.value} onInput={(v: any) => {
                                    props.form[fieldInfo.id].value = v;
                                }} />
                            )
                            return true;
                        }
                        return false;
                    }}
                />
            </div>
            <div className="sdppp-dialog-buttons">
                <sp-button variant="primary" onClick={() => {
                    props.onConfirm();
                }}>Save</sp-button>
                <sp-button variant="secondary" onClick={() => {
                    props.onCancel();
                }}>Cancel</sp-button>
            </div>
        </>
    )
}