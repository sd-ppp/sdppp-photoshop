import { availableModels, SDPPPReplicate } from "../../client/replicate";
import { BaseStoreState, createBaseStore, AsyncOperationManager, createTask as createBaseTask } from "../_base/BaseStore";
import { Task } from "../../client/_base/Task";

// replicate特有的状态接口
interface ReplicateStoreState extends BaseStoreState<SDPPPReplicate> {
    apiKey: string
    setApiKey: (apiKey: string) => void
}

// 创建replicate store
export const replicateStore = createBaseStore<SDPPPReplicate, ReplicateStoreState>(
    'replicate-store',
    availableModels[0],
    {
        apiKey: '',
        setApiKey: (apiKey) => replicateStore.setState({ apiKey }),
    },
    (state) => ({
        apiKey: state.apiKey,
        selectedModel: state.selectedModel,
        allValues: state.allValues,
    })
);

// 客户端重置逻辑（每个store自己实现）
function resetClient(state: ReplicateStoreState, prevState: ReplicateStoreState) {
    if (state.apiKey && state.apiKey !== prevState.apiKey) {
        replicateStore.setState({ 
            client: new SDPPPReplicate({ apiKey: state.apiKey }) 
        });
    }
}
replicateStore.subscribe(resetClient);
resetClient(replicateStore.getState(), {} as any);

// 异步操作管理器
const asyncManager = new AsyncOperationManager();

// replicate特有的changeSelectedModel实现
export async function changeSelectedModel(selectedModel: typeof availableModels[number]) {
    await asyncManager.executeWithAbort(async (abortController) => {
        const client = replicateStore.getState().client;
        if (!client) {
            return;
        }

        const widgetResult = await client.getWidgets(selectedModel);

        if (abortController.signal.aborted) {
            return;
        }

        const values = replicateStore.getState().allValues[selectedModel] || widgetResult.defaultInput;

        replicateStore.setState({
            currentValues: values,
            currentWidgets: widgetResult.widgetableWidgets
        });
    });
}

export function isChangingModel(): boolean {
    return asyncManager.isExecuting();
}

export async function createTask<T>(modelName: string, input: Record<string, any>): Promise<Task<T>> {
    return createBaseTask(replicateStore, modelName, input);
}