import { useQuery } from '@tanstack/react-query';
import { createChenyuAPI, BalanceResponse as ChenyuBalanceResponse } from '../apis/chenyu';
import { createXiangongAPI, BalanceResponse as XiangongBalanceResponse } from '../apis/xiangong';

export type Provider = 'chenyu' | 'xiangong';

type BalanceResponseType<T extends Provider> = T extends 'chenyu' 
  ? ChenyuBalanceResponse 
  : XiangongBalanceResponse;

export interface ApiError {
  code: string;
  message: string;
}

export function useBalance<T extends Provider>(config: {
  apiKey: string;
  provider: T;
}) {
  const { apiKey, provider } = config;

  const balanceQuery = useQuery<BalanceResponseType<T>, Error | ApiError>({
    queryKey: ['balance', apiKey, provider],
    queryFn: async () => {
      if (provider === 'chenyu') {
        const api = createChenyuAPI(apiKey);
        const result = await api.getBalance()
        return result.result as BalanceResponseType<T>;
      } else {
        const api = createXiangongAPI(apiKey);
        const result = await api.getBalance()
        return result.data as BalanceResponseType<T>;
      }
    },
    enabled: !!apiKey,
  });

  return {
    balance: balanceQuery.data,
    balanceError: balanceQuery.error || undefined,
    balanceLoading: balanceQuery.isLoading,
  };
} 