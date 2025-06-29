import { availableModels, SDPPPLiblib } from "../../client/liblib";
import { BaseStoreState, createBaseStore, AsyncOperationManager, createTask as createBaseTask } from "../_base/BaseStore";

// liblib特有的状态接口
interface LiblibStoreState extends BaseStoreState<SDPPPLiblib> {
    apiKey: string
    apiSecret: string
    setApiKey: (apiKey: string) => void
    setApiSecret: (apiSecret: string) => void
}

// 创建liblib store
export const liblibStore = createBaseStore<SDPPPLiblib, LiblibStoreState>(
    'liblib-store',
    availableModels[0],
    {
        apiKey: '',
        apiSecret: '',
        setApiKey: (apiKey) => liblibStore.setState({ apiKey }),
        setApiSecret: (apiSecret) => liblibStore.setState({ apiSecret }),
    },
    (state) => ({
        apiKey: state.apiKey,
        apiSecret: state.apiSecret,
        selectedModel: state.selectedModel,
        allValues: state.allValues,
    })
);

// 客户端重置逻辑（每个store自己实现）
function resetClient(state: LiblibStoreState, prevState: LiblibStoreState) {
    if (state.apiKey && state.apiSecret && 
        (state.apiKey !== prevState.apiKey || state.apiSecret !== prevState.apiSecret)) {
        liblibStore.setState({ 
            client: new SDPPPLiblib({ apiKey: state.apiKey, apiSecret: state.apiSecret }) 
        });
    }
}
liblibStore.subscribe(resetClient);
resetClient(liblibStore.getState(), {} as any);

// 异步操作管理器
const asyncManager = new AsyncOperationManager();

// liblib特有的changeSelectedModel实现
export async function changeSelectedModel(selectedModel: typeof availableModels[number]) {
    await asyncManager.executeWithAbort(async (abortController) => {
        const client = liblibStore.getState().client;
        if (!client) {
            return;
        }

        const widgetResult = await client.getWidgets(selectedModel);

        if (abortController.signal.aborted) {
            return;
        }

        const values = liblibStore.getState().allValues[selectedModel] || widgetResult.defaultInput;

        liblibStore.setState({
            currentValues: values,
            currentWidgets: widgetResult.widgetableWidgets,
            selectedModel: selectedModel
        });
    });
}

export function isChangingModel(): boolean {
    return asyncManager.isExecuting();
}

export async function createTask(modelName: string, input: Record<string, any>) {
    return createBaseTask(liblibStore, modelName, input);
}
