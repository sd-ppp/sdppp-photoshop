import { useQuery } from '@tanstack/react-query';
import { createChenyuAPI } from '../apis/chenyu';
import { createXiangongAPI } from '../apis/xiangong';

export type Provider = 'chenyu' | 'xiangong';

export interface Instance {
  id: string;                 // 实例唯一标识
  name: string;              // 实例名称
  status: string;            // 实例状态
  gpu_model: string;         // GPU型号
  gpu_used: number;          // 已使用的GPU数量
  web_url: string;           // Web访问地址
  create_timestamp: number;   // 创建时间戳
  price_per_hour: number;    // 每小时价格
}

export interface InstanceListResponse {
  list: Instance[];
  total: number;
}

export function useInstances(config: {
  apiKey: string;
  provider: Provider;
}) {
  const { apiKey, provider } = config;

  const instanceListQuery = useQuery<InstanceListResponse, Error>({
    queryKey: ['instances', apiKey, provider],
    queryFn: async () => {
      try {
        if (provider === 'chenyu') {
          const api = createChenyuAPI(apiKey);
          const response = await api.getInstanceList({ status: 0 });
          
          return {
            list: response.result.instance.map(item => ({
              id: item.uuid,
              name: item.title,
              status: item.status_txt,
              gpu_model: item.gpu_model_name,
              gpu_used: item.gpus,
              web_url: item.out_web_url,
              create_timestamp: new Date(item.pod_startup_elapse).getTime(),
              price_per_hour: item.price_h
            })),
            total: response.result.total
          };
        } else {
          const api = createXiangongAPI(apiKey);
          const response = await api.getInstanceList();

          return {
            list: response.data.list.map(item => ({
              id: item.id,
              name: item.name,
              status: item.status,
              gpu_model: item.gpu_model,
              gpu_used: item.gpu_used,
              web_url: item.web_url,
              create_timestamp: item.create_timestamp,
              price_per_hour: item.price_per_hour
            })),
            total: response.data.total || 0
          };
        }
      } catch (error) {
        throw error;
      }
    },
    enabled: !!apiKey,
  });

  return {
    instances: instanceListQuery.data?.list,
    totalInstances: instanceListQuery.data?.total,
    instancesError: instanceListQuery.error || undefined,
    instancesLoading: instanceListQuery.isLoading,
    refreshInstances: instanceListQuery.refetch,
  };
} 