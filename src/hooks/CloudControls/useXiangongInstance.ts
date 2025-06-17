import { useDestroyInstance } from "./hooks/useDestroyInstance";
import { useShutdownInstance } from "./hooks/useShutdownInstance";

export function useXiangongInstance(config: {
    instanceId: string;
    apiKey: string;
}) {
    const {
      destroyInstance,
      destroyInstanceLoading,
    } = useDestroyInstance({ apiKey: config.apiKey, provider: 'xiangong' });

    const {
        shutdownWithoutGPU,
        shutdownWithoutGPULoading,
    } = useShutdownInstance({ apiKey: config.apiKey, provider: 'xiangong' });
  
    return {
        destroyInstance: () => destroyInstance({ id: config.instanceId }),
        destroyInstanceLoading,

        shutdownWithoutGPU: () => shutdownWithoutGPU(config.instanceId),  
        shutdownWithoutGPULoading,
    }
}