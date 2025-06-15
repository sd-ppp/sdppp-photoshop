import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useBalance } from '../hooks/useBalance';
import type { ReactNode } from 'react';

describe('useBalance', () => {
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
    describe(`with ${provider} provider`, () => {
      it('should fetch balance successfully', async () => {
        const config = {
          apiKey: provider === 'xiangong' ? process.env.XIANGONG_API_KEY || '' : process.env.CHENYU_API_KEY || '',
          provider,
        };

        const { result } = renderHook(() => useBalance(config), { wrapper });

        expect(result.current.balanceLoading).toBe(true);

        await waitFor(() => {
          expect(result.current.balanceLoading).toBe(false);
        });

        expect(result.current.balanceError).toBeUndefined();
        expect(result.current.balance).toBeDefined();
      });

      it('should handle API errors when apiKey is invalid', async () => {
        const config = {
          apiKey: 'invalid-key',
          provider,
        };

        const { result } = renderHook(() => useBalance(config), { wrapper });

        await waitFor(() => {
          expect(result.current.balanceLoading).toBe(false);
        });

        expect(result.current.balanceError).toBeDefined();
        expect(result.current.balance).toBeUndefined();
      });

      it('should not fetch when apiKey is not provided', () => {
        const config = {
          apiKey: '',
          provider,
        };

        const { result } = renderHook(() => useBalance(config), { wrapper });

        expect(result.current.balanceLoading).toBe(false);
        expect(result.current.balance).toBeUndefined();
      });
    });
  });
});
