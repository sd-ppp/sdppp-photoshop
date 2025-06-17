import { createStore } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { z } from "zod";

export const AIProvidersSchema = z.object({
    comfyInstance: z.object({
        url: z.string(),
    }),
    xiangong: z.object({
        apiKey: z.string(),
    }),
    chenyu: z.object({
        apiKey: z.string(),
    })
});

export type AIProviders = z.infer<typeof AIProvidersSchema>;

const AIProviders = createStore<AIProviders>()(
    persist(
        (set) => ({
            comfyInstance: {
                url: '',
            },
            xiangong: {
                apiKey: '',
            },
            chenyu: {
                apiKey: '',
            }
        }), {
            name: 'ai-providers', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        }
    )
);

export default AIProviders;