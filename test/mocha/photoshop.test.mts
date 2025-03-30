import "mocha";
import { app } from "photoshop";
import { photoshopPageStoreMap, photoshopStore } from "../../src/logics/ModelDefines.mts";

(globalThis as any).sdppp_debugPhotoshopStore = photoshopStore;
// (globalThis as any).sdppp_debugPhotoshopInternalStore = photoshopInternalStore;
(globalThis as any).sdppp_debugPhotoshopPageStoreMap = photoshopPageStoreMap;
(globalThis as any).sdppp_app = app;

(globalThis as any).sdpppTest = async (options: Mocha.MochaOptions = {}) => {
    mocha.setup({
        reporter: "spec",
        ui: "bdd",
        ...options
    });
    await Promise.all([
        import('./photoshop/GetImage.test.mts'),
        import('./photoshop/ParseLayerInfo.test.mts'),
        import('./photoshop/GetSelection.test.mts'),
        // import('./photoshop/SendImages.test.mts'),
    ]);
    mocha.cleanReferencesAfterRun(false);
    mocha.run();
}