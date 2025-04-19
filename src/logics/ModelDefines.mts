import { StoreMap } from "../../../../src/common/store/store-map.mts";
import { PhotoshopStore } from "../../../../src/store/photoshop.mts";
import { PageStore } from "../../../../src/store/page.mts";

class PhotoshopPageStoreMap extends StoreMap<PageStore> {
    createStore(data: any, version: number): PageStore {
        return new PageStore(data, version);
    }
}

export const photoshopPageStoreMap = new PhotoshopPageStoreMap();
export const photoshopStore = new PhotoshopStore();
