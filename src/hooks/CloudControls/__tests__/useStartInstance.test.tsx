import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useStartInstance } from '../hooks/useStartInstance';
import type { ReactNode } from 'react';

describe('useStartInstance', () => {
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
      it('should start instance successfully', async () => {
        const config = {
          apiKey: provider === 'xiangong' ? process.env.XIANGONG_API_KEY || '' : process.env.CHENYU_API_KEY || '',
          provider,
        };

        const { result } = renderHook(() => useStartInstance(config), { wrapper });

        expect(result.current.startInstanceLoading).toBe(false);

        const params = provider === 'xiangong' ? {
          id: 'ramn2gyj5d21c3in'
        } : {
          instance_uuid: 'test-uuid',
        };

        const resPromise = result.current.startInstance(params as any);
        const res = await resPromise;

        console.log(res);
      });

      it('should handle API errors when apiKey is invalid', async () => {
        const config = {
          apiKey: 'invalid-key',
          provider,
        };

        const { result } = renderHook(() => useStartInstance(config), { wrapper });

        const params = provider === 'xiangong' ? {
          id: 'test-instance-id',
          gpu_model: 'A100',
          gpu_count: '1',
        } : {
          instance_uuid: 'test-uuid',
        };

        const resPromise = result.current.startInstance(params as any);

        try {
          await resPromise;
        } catch (error) {
          expect(error).toBeDefined();
          return;
        }
        expect(false).toBe(true);
      });

      it('should not start instance when apiKey is not provided', () => {
        const config = {
          apiKey: '',
          provider,
        };

        const { result } = renderHook(() => useStartInstance(config), { wrapper });

        expect(result.current.startInstanceLoading).toBe(false);
      });
    });
  });
}); 