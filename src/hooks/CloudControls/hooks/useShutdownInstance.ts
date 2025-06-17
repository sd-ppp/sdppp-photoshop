import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createXiangongAPI } from '../apis/xiangong';

export function useShutdownInstance(config: {
    apiKey: string;
    provider: 'xiangong';
}) {
    const queryClient = useQueryClient();
    const { apiKey, provider } = config;
    const api = createXiangongAPI(apiKey);

    const shutdownWithGPUMutation = useMutation({
        mutationFn: async (instanceId: string) => {
            try {
                return await api.shutdownWithGPU(instanceId);
            } catch (error: any) {
                throw new Error(`Failed to shutdown instance with GPU: ${error.message}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances', apiKey, provider] });
        },
    });

    const shutdownWithoutGPUMutation = useMutation({
        mutationFn: async (instanceId: string) => {
            try {
                return await api.shutdownWithoutGPU(instanceId);
            } catch (error: any) {
                throw new Error(`Failed to shutdown instance without GPU: ${error.message}`);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['instances', apiKey, provider] });
        },
    });

    return {
        shutdownWithGPU: shutdownWithGPUMutation.mutateAsync,
        shutdownWithGPULoading: shutdownWithGPUMutation.isPending,
        shutdownWithoutGPU: shutdownWithoutGPUMutation.mutateAsync,
        shutdownWithoutGPULoading: shutdownWithoutGPUMutation.isPending
    };
}