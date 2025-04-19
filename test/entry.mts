import { app } from "photoshop";
import { photoshopPageStoreMap, photoshopStore } from "../src/logics/ModelDefines.mts";
import { sdpppX } from "../../../src/common/sdpppX.mts";

(globalThis as any).sdppp_debugPhotoshopStore = photoshopStore;
(globalThis as any).sdppp_debugPhotoshopPageStoreMap = photoshopPageStoreMap;
(globalThis as any).sdppp_app = app;

sdpppX.registerTestCase = async () => {
    await Promise.all([
        import('./cases/GetImage.test.mts'),
        import('./cases/ParseLayerInfo.test.mts'),
        import('./cases/GetSelection.test.mts'),
    ])
}

import('../../../test/mocha/entry.mts')