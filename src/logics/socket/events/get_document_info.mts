import i18n from "../../../../../../src/common/i18n.mts";
import { SDPPPBounds, parseDocumentIdentify } from "../../util.mts";
import type { getDocumentInfoActions } from "../../../../../../src/socket/PhotoshopCalleeInterface.mts";

export default async function getDocumentInfo(params: getDocumentInfoActions['params']): Promise<getDocumentInfoActions['result']> {
    const documentIdentify = params.document_identify
    let document = parseDocumentIdentify(documentIdentify);
    if (!document) throw new Error(i18n('document {0} not found', documentIdentify));

    const selection = document.selection;
    const selectionBoundary = selection && selection.bounds ? {
        left: selection.bounds.left,
        top: selection.bounds.top,
        right: document.width - selection.bounds.right,
        bottom: document.height - selection.bounds.bottom,
        width: selection.bounds.width,
        height: selection.bounds.height
    } : null;
    const documentBoundary = {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        width: document.width,
        height: document.height
    }
    return {
        document_boundary: documentBoundary,
        selection_boundary: selectionBoundary || documentBoundary
    }
};