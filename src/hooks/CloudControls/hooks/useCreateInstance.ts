import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createChenyuAPI, CreateInstanceRequest as ChenyuCreateRequest, BaseResponse as ChenyuResponse } from '../apis/chenyu';
import { createXiangongAPI, DeployInstanceRequest as XiangongCreateRequest, InstanceResponse as XiangongResponse } from '../apis/xiangong';

export type Provider = 'chenyu' | 'xiangong';

type CreateInstanceParams<T extends Provider> = T extends 'chenyu'
  ? ChenyuCreateRequest
  : XiangongCreateRequest;

// type CreateInstanceResponse<T extends Provider> = T extends 'chenyu' 
//   ? ChenyuResponse 
//   : XiangongResponse;

export function useCreateInstance<T extends Provider>(config: {
  apiKey: string;
  provider: T;
}) {
  const queryClient = useQueryClient();
  const { apiKey, provider } = config;

  const mutation = useMutation({
    mutationFn: async (params: CreateInstanceParams<T>) => {
      if (provider === 'chenyu') {
        const api = createChenyuAPI(apiKey);
        return await api.createInstance(params as ChenyuCreateRequest);

      } else {
        const api = createXiangongAPI(apiKey);
        const res = await api.deployInstance(params as XiangongCreateRequest);
        return res;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['instances', apiKey, provider] });
    },
  });

  return {
    createInstance: mutation.mutateAsync,
    createInstanceLoading: mutation.isPending
  };
} 