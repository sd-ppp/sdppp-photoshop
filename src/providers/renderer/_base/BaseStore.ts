import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { WidgetableWidget } from "../../../schemas/schemas";
import { sdpppSDK } from "../../../sdk/sdppp-ps-sdk";
import { Task } from "../../client/_base/Task";
import { Client } from "../../client/_base/Client";

// 通用Store状态接口
export interface BaseStoreState<TClient extends Client<any>> {
    selectedModel: string
    setSelectedModel: (selectedModel: string) => void
    allValues: Record<string, Record<string, any>>
    setAllValues: (allValues: Record<string, any>) => void

    client: TClient | null
    setClient: (client: TClient | null) => void
    currentValues: Record<string, any>
    setCurrentValues: (currentValues: Record<string, any>) => void
    currentWidgets: WidgetableWidget[]
    setCurrentWidgets: (currentWidgets: WidgetableWidget[]) => void

    runningTasks: Task<any>[]
    setRunningTasks: (runningTasks: Task<any>[]) => void
}

// 简化的BaseStore创建函数
export function createBaseStore<TClient extends Client<any>, TState extends BaseStoreState<TClient>>(
    storeName: string,
    defaultModel: string,
    additionalState: Omit<TState, keyof BaseStoreState<TClient>>,
    partialize: (state: TState) => any
) {
    const store = create<TState>()(persist((set) => ({
        // 基础状态
        selectedModel: defaultModel,
        setSelectedModel: (selectedModel) => set({ selectedModel } as Partial<TState>),
        allValues: {},
        setAllValues: (allValues) => set({ allValues } as Partial<TState>),

        client: null,
        setClient: (client) => set({ client } as Partial<TState>),
        currentValues: {},
        setCurrentValues: (currentValues) => set({ currentValues } as Partial<TState>),
        currentWidgets: [],
        setCurrentWidgets: (currentWidgets) => set({ currentWidgets } as Partial<TState>),

        runningTasks: [],
        setRunningTasks: (runningTasks) => set({ runningTasks } as Partial<TState>),

        // 额外状态
        ...additionalState,
    } as unknown as TState), {
        name: storeName,
        storage: createJSONStorage(() => sdpppSDK.plugins.uxp),
        partialize,
    }));

    // 自动保存当前值到allValues
    store.subscribe((state, prevState) => {
        if (state.currentValues !== prevState.currentValues) {
            store.getState().setAllValues({
                ...store.getState().allValues,
                [state.selectedModel]: state.currentValues
            });
        }
    });

    return store;
}

// 通用异步操作管理
export class AsyncOperationManager {
    private currentAbortController: AbortController | null = null;

    async executeWithAbort<T>(
        operation: (abortController: AbortController) => Promise<T>
    ): Promise<T | undefined> {
        if (this.currentAbortController) {
            this.currentAbortController.abort();
        }

        this.currentAbortController = new AbortController();
        const abortController = this.currentAbortController;

        try {
            const result = await operation(abortController);
            
            if (abortController.signal.aborted) {
                return undefined;
            }

            this.currentAbortController = null;
            return result;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                return undefined;
            }
            throw error;
        }
    }

    isExecuting(): boolean {
        return this.currentAbortController !== null && !this.currentAbortController.signal.aborted;
    }
}

// 通用任务创建函数
export async function createTask<T>(
    store: any,
    modelName: string,
    input: Record<string, any>
): Promise<Task<T>> {
    const client = store.getState().client;
    if (!client) {
        throw new Error('Client not found');
    }

    const task = await client.run(modelName, input);
    store.setState({ runningTasks: [...store.getState().runningTasks, task] });
    
    task.promise.then(() => {
        store.setState({ 
            runningTasks: store.getState().runningTasks.filter((t: Task<any>) => t !== task) 
        });
    });
    
    return task as Task<T>;
} 