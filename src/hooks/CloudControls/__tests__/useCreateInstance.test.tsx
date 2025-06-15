import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useCreateInstance } from '../hooks/useCreateInstance';
import type { ReactNode } from 'react';

describe('useCreateInstance', () => {
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
            it('should create instance successfully', async () => {
                const config = {
                    apiKey: provider === 'xiangong' ? process.env.XIANGONG_API_KEY || '' : process.env.CHENYU_API_KEY || '',
                    provider,
                };

                const { result } = renderHook(() => useCreateInstance(config), { wrapper });

                expect(result.current.createInstanceLoading).toBe(false);

                const params = provider === 'xiangong' ? {
                    gpu_model: "NVIDIA GeForce RTX 4090 D",
                    gpu_count: 1,
                    data_center_id: 1,
                    image: "a0607405-d0fd-4efc-b34e-de0872d4a633",
                    image_type: "public" as const
                } : {
                    pod_uuid: "test-pod-uuid",
                    image_tag: "test-image-tag",
                    gpu_model_uuid: "test-gpu-model-uuid"
                };

                const resPromise = result.current.createInstance(params as any);

                const res = await resPromise;

                console.log(res)
            });

            it('should handle API errors when apiKey is invalid', async () => {
                const config = {
                    apiKey: 'invalid-key',
                    provider,
                };

                const { result } = renderHook(() => useCreateInstance(config), { wrapper });

                const params = provider === 'xiangong' ? {
                    gpu_model: "NVIDIA GeForce RTX 4090 D",
                    gpu_count: 1,
                    data_center_id: 1,
                    image: "28a68dbb-3d16-4556-ab3d-5c755288f0cc",
                    image_type: "public" as const
                } : {
                    pod_uuid: "test-pod-uuid",
                    image_tag: "test-image-tag",
                    gpu_model_uuid: "test-gpu-model-uuid"
                };

                const resPromise = result.current.createInstance(params as any);

                try {
                    await resPromise;
                } catch (error) {
                    expect(error).toBeDefined();
                    return 
                }
                expect(false).toBe(true);
            });

            it('should not create instance when apiKey is not provided', () => {
                const config = {
                    apiKey: '',
                    provider,
                };

                const { result } = renderHook(() => useCreateInstance(config), { wrapper });

                expect(result.current.createInstanceLoading).toBe(false);
            });
        });
    });
}); 