import { app } from "photoshop";
import { photoshopPageStoreMap, photoshopStore } from "../../photoshop-internal/src/logics/ModelDefines.mts";
import { sdpppX } from "../../src/common/sdpppX.mts";

(globalThis as any).sdppp_debugPhotoshopStore = photoshopStore;
(globalThis as any).sdppp_debugPhotoshopPageStoreMap = photoshopPageStoreMap;
(globalThis as any).sdppp_app = app;

sdpppX.testPaths = [
    './photoshop/GetImage.test.mts',
    './photoshop/ParseLayerInfo.test.mts',
    './photoshop/GetSelection.test.mts',
];

import('../../test/mocha/entry.mts')