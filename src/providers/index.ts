import { availableModels as liblibAvailableModels, SDPPPLiblib } from "./client/liblib";
import { availableModels as replicateAvailableModels, SDPPPReplicate } from "./client/replicate";
import LiblibRenderer from "./renderer/liblib/liblib";
import ReplicateRenderer from "./renderer/replicate/replicate";

export const Providers = {
    liblibAI: {
        client: SDPPPLiblib,
        Renderer: LiblibRenderer,
        availableModels: liblibAvailableModels,
    },
    replicate: {
        client: SDPPPReplicate,
        Renderer: ReplicateRenderer,
        availableModels: replicateAvailableModels,
    },
}