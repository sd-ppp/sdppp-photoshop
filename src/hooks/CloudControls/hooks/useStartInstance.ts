import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChenyuAPI, BaseResponse as ChenyuResponse } from '../apis/chenyu';
import { createXiangongAPI, BaseResponse as XiangongResponse, StartInstanceRequest } from '../apis/xiangong';

export type Provider = 'chenyu' | 'xiangong';

type StartInstanceParams<T extends Provider> = T extends 'chenyu' 
  ? { instance_uuid: string }
  : StartInstanceRequest;

export function useStartInstance<T extends Provider>(config: {
  apiKey: string;
  provider: T;
}) {
  const queryClient = useQueryClient();
  const { apiKey, provider } = config;

  const mutation = useMutation({
    mutationFn: async (params: StartInstanceParams<T>) => {
      if (provider === 'chenyu') {
        const api = createChenyuAPI(apiKey);
        const chenyuParams = params as StartInstanceParams<'chenyu'>;
        return await api.startInstance(chenyuParams.instance_uuid);
      } else {
        const api = createXiangongAPI(apiKey);
        const xiangongParams = params as StartInstanceParams<'xiangong'>;
        return await api.startInstance(xiangongParams);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', apiKey, provider] });
    },
  });

  return {
    startInstance: mutation.mutateAsync,
    startInstanceLoading: mutation.isPending
  };
} 