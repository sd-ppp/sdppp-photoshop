import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInstances } from '../hooks/useInstances';
import type { ReactNode } from 'react';

describe('useInstances', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          gcTime: 0,
          staleTime: 0,
        },
      },
    });
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const testProviders = ['chenyu', 'xiangong'] as const;

  testProviders.forEach((provider) => {
    describe(`with ${provider} provider`, () => {
      it('should fetch instances successfully', async () => {
        const config = {
          apiKey: provider === 'xiangong' ? process.env.XIANGONG_API_KEY || '' : process.env.CHENYU_API_KEY || '',
          provider,
        };

        if (!config.apiKey) {
          return;
        }

        const { result } = renderHook(() => useInstances(config), { wrapper });

        expect(result.current.instancesLoading).toBe(true);

        await waitFor(() => {
          expect(result.current.instancesLoading).toBe(false);
        }, { timeout: 10000 });

        console.log(result.current.instances)

        expect(result.current.instances).toBeDefined();
        expect(result.current.totalInstances).toBeGreaterThanOrEqual(0);
      });

      it('should handle API errors when apiKey is invalid', async () => {
        const config = {
          apiKey: 'invalid-key',
          provider,
        };

        const { result } = renderHook(() => useInstances(config), { wrapper });

        await waitFor(() => {
          expect(result.current.instancesLoading).toBe(false);
        }, { timeout: 10000 });

        expect(result.current.instancesError).toBeDefined();
        expect(result.current.instances).toBeUndefined();
      });

      it('should not fetch when apiKey is not provided', () => {
        const config = {
          apiKey: '',
          provider,
        };

        const { result } = renderHook(() => useInstances(config), { wrapper });

        expect(result.current.instancesLoading).toBe(false);
        expect(result.current.instances).toBeUndefined();
      });
    });
  });
});
