// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import { createBaseHook, BaseHookResult, ApiError } from './base';
// import { chenyuTransformers } from './transformers';

// const API_BASE_URL = 'https://www.chenyu.cn';

// export function useChenyu(apiKey: string): BaseHookResult {
//   const queryClient = useQueryClient();
//   const baseHook = createBaseHook({
//     apiKey,
//     baseUrl: API_BASE_URL,
//     endpoints: {
//       instances: '/api/v1/instances',
//       balance: '/api/v1/finances/balance',
//       createInstance: '/api/v1/instances',
//       destroyInstance: '/api/v1/instances',
//       startInstance: '/api/v1/instances/start',
//     },
//     responseTransformers: {
//       instances: chenyuTransformers.instances,
//       balance: chenyuTransformers.balance,
//       balanceCards: (data) => chenyuTransformers.balance(data).cards || [],
//     },
//   });

//   // Additional mutation for restarting instance
//   const restartInstanceMutation = useMutation({
//     mutationFn: async (instanceId: string) => {
//       const response = await fetch(`${API_BASE_URL}/api/v1/instances/${instanceId}/restart`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${apiKey}`,
//           'Content-Type': 'application/json',
//         },
//       });
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       return response.json();
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['instances', apiKey] });
//     },
//   });

//   return {
//     ...baseHook,
//     restartInstance: restartInstanceMutation.mutate,
//     restartInstanceLoading: restartInstanceMutation.isPending,
//     restartInstanceError: restartInstanceMutation.error || undefined,
//   };
// } 