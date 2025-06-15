import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDestroyInstance } from '../hooks/useDestroyInstance';
import type { ReactNode } from 'react';

describe('useDestroyInstance', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const testProviders = ['chenyu', 'xiangong'] as const;

  testProviders.forEach((provider) => {
    if (provider === 'chenyu') {
      return;
    }
    describe(`with ${provider} provider`, () => {
      it('should destroy instance successfully', async () => {
        const config = {
          apiKey: provider === 'xiangong' ? process.env.XIANGONG_API_KEY || '' : process.env.CHENYU_API_KEY || '',
          provider,
        };

        const { result } = renderHook(() => useDestroyInstance(config), { wrapper });

        expect(result.current.destroyInstanceLoading).toBe(false);

        const params = provider === 'xiangong' ? {
          id: '34rp5aaprbmnv7u9',
        } : {
          instance_uuid: 'test-uuid',
          shutdown_reason: 'test-shutdown',
        };

        const resPromise = result.current.destroyInstance(params as any);
        const res = await resPromise;

        console.log(res);
      });

      it('should handle API errors when apiKey is invalid', async () => {
        const config = {
          apiKey: 'invalid-key',
          provider,
        };

        const { result } = renderHook(() => useDestroyInstance(config), { wrapper });

        const params = provider === 'xiangong' ? {
          id: 'test-instance-id',
        } : {
          instance_uuid: 'test-uuid',
          shutdown_reason: 'test-shutdown',
        };

        const resPromise = result.current.destroyInstance(params as any);

        try {
          await resPromise;
        } catch (error) {
          expect(error).toBeDefined();
          return;
        }
        expect(false).toBe(true);
      });

      it('should not destroy instance when apiKey is not provided', () => {
        const config = {
          apiKey: '',
          provider,
        };

        const { result } = renderHook(() => useDestroyInstance(config), { wrapper });

        expect(result.current.destroyInstanceLoading).toBe(false);
      });
    });
  });
}); 