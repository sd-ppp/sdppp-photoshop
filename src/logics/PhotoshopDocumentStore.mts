import { create } from 'zustand';
import { action, app } from "photoshop";
import type { Document } from "photoshop/dom/Document";
import { makeDocumentIdentify, makeLayerIdentify } from "../../../../src/common/photoshop/identify.mts";
import { getAllSubLayer } from "./util.mts";
import type { PhotoshopDataDocument } from "../../../../src/store/photoshop.mts";
import { photoshopStore } from "./ModelDefines.mts";

interface PhotoshopDocumentState {
  canvasDirtyID: number;
  selectionDirtyID: number;
  layerDirtyIDs: Map<number, number>;
  documentCache: PhotoshopDataDocument;
  
  // Mutations
  incrementCanvasDirtyID: () => void;
  incrementLayerDirtyID: (layerId: number) => void;
  incrementSelectionDirtyID: () => void;
  setDocuments: (documents: PhotoshopDataDocument) => void;
  clearCanvasDirtyID: () => void;
  clearLayerDirtyIDs: () => void;
  clearSelectionDirtyID: () => void;
}

export const usePhotoshopDocumentStore = create<PhotoshopDocumentState>((set, get) => ({
  canvasDirtyID: 0,
  selectionDirtyID: 0,
  layerDirtyIDs: new Map(),
  documentCache: {},

  // Mutations
  incrementCanvasDirtyID: () => {
    set((state) => ({ canvasDirtyID: state.canvasDirtyID + 1 }));
    updateStoreIfNeeded();
  },

  incrementLayerDirtyID: (layerId: number) => {
    set((state) => {
      const currentDirtyID = state.layerDirtyIDs.get(layerId) || 0;
      const newLayerDirtyIDs = new Map(state.layerDirtyIDs);
      newLayerDirtyIDs.set(layerId, currentDirtyID + 1);
      return { layerDirtyIDs: newLayerDirtyIDs };
    });
    updateStoreIfNeeded();
  },

  incrementSelectionDirtyID: () => {
    set((state) => ({ selectionDirtyID: state.selectionDirtyID + 1 }));
    updateStoreIfNeeded();
  },

  setDocuments: (documents: PhotoshopDataDocument) => {
    set({ documentCache: documents });
    if (app.activeDocument) {
      photoshopStore.setDocument(app.activeDocument.id, JSON.parse(JSON.stringify(documents)));
    }
  },

  clearCanvasDirtyID: () => {
    set({ canvasDirtyID: 0 });
  },

  clearLayerDirtyIDs: () => {
    set({ layerDirtyIDs: new Map() });
  },

  clearSelectionDirtyID: () => {
    set({ selectionDirtyID: 0 });
  }
}));

// Private helper function
function updateStoreIfNeeded() {
  if (!app.activeDocument) return;

  const currentDocument = usePhotoshopDocumentStore.getState().documentCache[app.activeDocument.id];
  if (currentDocument) {
    // Create a new document object to ensure immutability
    const updatedDocument = {
      ...currentDocument,
      dirtyID: usePhotoshopDocumentStore.getState().canvasDirtyID,
      layers: currentDocument.layers.map(layer => {
        const layerDirtyID = usePhotoshopDocumentStore.getState().layerDirtyIDs.get(layer.id);
        return layerDirtyID !== undefined
          ? { ...layer, dirtyID: layerDirtyID }
          : layer;
      })
    };

    // Update cache
    usePhotoshopDocumentStore.setState((state) => ({
      documentCache: {
        ...state.documentCache,
        [app.activeDocument!.id]: updatedDocument
      }
    }));

    // Update store with cached data
    photoshopStore.setDocument(app.activeDocument.id, usePhotoshopDocumentStore.getState().documentCache);
  }
}

// Helper function to fetch documents
export function fetchDocuments() {
  try {
    if (!app.activeDocument) return;

    const documents = app.documents.reduce((ret: PhotoshopDataDocument, document: Document) => {
      const layers = getAllSubLayer(document).map(layerAndPath => {
        const layerId = layerAndPath.layer.id;

        return {
          level: layerAndPath.level,
          id: layerId,
          name: layerAndPath.layer.name,
          identify: makeLayerIdentify(layerId, layerAndPath.layer.name, layerAndPath.level),
          fullPath: layerAndPath.path,
          dirtyID: usePhotoshopDocumentStore.getState().layerDirtyIDs.get(layerId) || 0
        };
      });

      ret[document.id] = {
        name: document.name,
        id: document.id,
        identify: makeDocumentIdentify(document.id, document.name),
        layers: layers,
        canvasDirtyID: usePhotoshopDocumentStore.getState().canvasDirtyID,
        selectionDirtyID: usePhotoshopDocumentStore.getState().selectionDirtyID
      };
      return ret;
    }, {});

    // Update cache and store
    usePhotoshopDocumentStore.getState().setDocuments(documents);
  } catch (e) {
    console.error(e);
  }
} 

export function getCanvasDirtyID() {
  return usePhotoshopDocumentStore.getState().canvasDirtyID;
}

export function getLayerDirtyID(layerId: number) {
  return usePhotoshopDocumentStore.getState().layerDirtyIDs.get(layerId) || 0;
}

export function notifyCanvasChange() {
  usePhotoshopDocumentStore.getState().incrementCanvasDirtyID();
}

export function notifyLayerChange(layerIds: number | number[]) {
  if (Array.isArray(layerIds)) {    
    layerIds.forEach(layerId => {
      usePhotoshopDocumentStore.getState().incrementLayerDirtyID(layerId);
    });
  } else {
    usePhotoshopDocumentStore.getState().incrementLayerDirtyID(layerIds);
  }
}

export function notifyDocumentChange() {
  usePhotoshopDocumentStore.getState().clearCanvasDirtyID();
  usePhotoshopDocumentStore.getState().clearLayerDirtyIDs();
  fetchDocuments();
}

export function notifySelectionChange() {
  usePhotoshopDocumentStore.getState().incrementSelectionDirtyID();
}