import { useInstances } from './hooks/useInstances';
import { useCreateInstance } from './hooks/useCreateInstance';
import { useDestroyInstance } from './hooks/useDestroyInstance';
import { useStartInstance } from './hooks/useStartInstance';
import { useBalance } from './hooks/useBalance';
import type { Instance, InstanceListResponse } from './hooks/useInstances';
import type { StartInstanceRequest } from './apis/xiangong';
import { useEffect } from 'react';

export type { Instance, InstanceListResponse, StartInstanceRequest };

export function useXiangong(config: {
  apiKey: string;
}) {
  const { apiKey } = config;
  const provider = 'xiangong' as const;

  const {
    instances,
    totalInstances,
    instancesError,
    instancesLoading,
    refreshInstances,
  } = useInstances({ apiKey, provider });

  const {
    createInstance,
    createInstanceLoading,
  } = useCreateInstance({ apiKey, provider });

  const {
    destroyInstance,
    destroyInstanceLoading,
  } = useDestroyInstance({ apiKey, provider });

  const {
    startInstance,
    startInstanceLoading,
  } = useStartInstance({ apiKey, provider });

  const {
    balance,
    balanceError,
    balanceLoading,
  } = useBalance({ apiKey, provider });

  useEffect(() => {
    if (balanceError || balanceLoading) {
      return
    }
    const interval = setInterval(() => {
      refreshInstances();
    }, 5000);
    return () => clearInterval(interval);
  }, [balanceError, balanceLoading]);
 
  return {
    // Instance management
    instances,
    totalInstances,
    instancesError,
    instancesLoading,

    // Create instance
    createInstance,
    createInstanceLoading,

    // Destroy instance
    destroyInstance,
    destroyInstanceLoading,

    // Start instance
    startInstance,
    startInstanceLoading,

    // Balance
    balance,
    balanceError,
    balanceLoading,
  };
}
