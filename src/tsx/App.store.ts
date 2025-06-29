import { create } from 'zustand'
import { Providers } from '../providers'
import { createJSONStorage, persist } from 'zustand/middleware'
import { sdpppSDK } from '../sdk/sdppp-ps-sdk'

export const MainStore = create<{
    provider: (keyof typeof Providers) | ''
    previewImageList: {
        url: string,
        source: string,
    }[]
    showingPreview: boolean
    setPreviewImageList: (list: { url: string, source: string }[]) => void
    setShowingPreview: (showing: boolean) => void
}>()(persist((set) => ({
    provider: '',
    previewImageList: [
    ],
    setPreviewImageList: (list: { url: string, source: string }[]) => set({ previewImageList: list }),
    showingPreview: false,
    setShowingPreview: (showing: boolean) => set({ showingPreview: showing })
}), {
    name: 'main-store',
    storage: createJSONStorage(() => sdpppSDK.plugins.uxp),
    partialize: (state) => ({
        provider: state.provider,
    }),
}))

let firstPreview = false
MainStore.subscribe((state, prevState) => {
    if (state.previewImageList.length !== prevState.previewImageList.length) {
        if (!state.previewImageList.length) {
            MainStore.setState({ showingPreview: false })
        } else {
            if (!firstPreview) {
                firstPreview = true
                MainStore.setState({ showingPreview: true })
            }
        }
    }
})

// MainStore.setState({ 
//     showingPreview: true,
//     previewImageList: [{
//         url: 'https://sdppp.zombee.tech/img/qr_manga1.jpg',
//         source: 'test',
//     }]
// })