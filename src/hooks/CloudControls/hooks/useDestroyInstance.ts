import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChenyuAPI, BaseResponse as ChenyuResponse } from '../apis/chenyu';
import { createXiangongAPI, BaseResponse as XiangongResponse } from '../apis/xiangong';

export type Provider = 'chenyu' | 'xiangong';

type DestroyInstanceParams<T extends Provider> = T extends 'chenyu' 
  ? { instance_uuid: string; shutdown_reason?: string }
  : { id: string };

export function useDestroyInstance<T extends Provider>(config: {
  apiKey: string;
  provider: T;
}) {
  const queryClient = useQueryClient();
  const { apiKey, provider } = config;

  const mutation = useMutation({
    mutationFn: async (params: DestroyInstanceParams<T>) => {
      if (provider === 'chenyu') {
        const api = createChenyuAPI(apiKey);
        const chenyuParams = params as DestroyInstanceParams<'chenyu'>;
        return await api.stopInstance(chenyuParams.instance_uuid, chenyuParams.shutdown_reason);
      } else {
        const api = createXiangongAPI(apiKey);
        const xiangongParams = params as DestroyInstanceParams<'xiangong'>;
        return await api.shutdownAndDestroy(xiangongParams.id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', apiKey, provider] });
    },
  });

  return {
    destroyInstance: mutation.mutateAsync,
    destroyInstanceLoading: mutation.isPending
  };
} 