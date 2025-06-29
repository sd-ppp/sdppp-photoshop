import './replicate.less';
import { Input, Alert, Flex, Select, Spin, Card, Button, AutoComplete } from 'antd';
import { useEffect, useState } from 'react';
import { replicateStore, changeSelectedModel, createTask } from './replicate.store';
import { availableModels, SDPPPReplicate } from '../../client/replicate';
import { WorkflowEditApiFormat } from '../../../tsx/widgetable';
import Link from 'antd/es/typography/Link';
import { sdpppSDK } from '../../../sdk/sdppp-ps-sdk';
import { WidgetableNode } from '../../../schemas/schemas';
import { MainStore } from '../../../tsx/App.store';
import { useWidgetable, WidgetableProvider } from '../../../tsx/widgetable/context';
import { useTaskExecutor } from '../_base/useTaskExecutor';

const { Password } = Input;

export default function ReplicateRenderer({ showingPreview }: { showingPreview: boolean }) {
    const { apiKey, setApiKey } = replicateStore();
    const [error, setError] = useState<string>('');

    return (
        <Flex className="replicate-renderer" vertical gap={8}>
            {!showingPreview ? <Flex gap={8}>
                <Password
                    placeholder="Enter your Replicate API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
            </Flex> : null}
            {
                !apiKey && <Link onClick={() => sdpppSDK.plugins.uxp.openExternalLink("https://replicate.com/account/api-tokens")}>如何获取APIKey</Link>
            }

            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    style={{ marginBottom: 16 }}
                />
            )}

            <Flex gap={8} vertical>
                {apiKey && <ReplicateRendererModels />}
            </Flex>
        </Flex>
    );
}

function ReplicateRendererModels() {
    const { selectedModel } = replicateStore();
    const [inputValue, setInputValue] = useState<string>(selectedModel || '');
    const client = replicateStore((state) => state.client);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState<string>('');
    if (!client) {
        return null;
    }

    useEffect(() => {
        setInputValue(selectedModel || '');
    }, [selectedModel]);

    const handleModelChange = async (value: string) => {
        if (client) {
            setLoadError('');
            setLoading(true);
            try {
                await changeSelectedModel(value as typeof availableModels[number]);
            } catch (error: any) {
                setLoadError(error.message || error.toString());
            } finally {
                setLoading(false);
                replicateStore.setState({
                    selectedModel: value
                });
            }
        }
    };
    useEffect(() => {
        handleModelChange(selectedModel);
    }, [selectedModel]);

    return (
        // This Provider is used to provide the context for the WorkflowEditApiFormat
        // 这个Provider是必须的，因为WorkflowEditApiFormat需要使用WidgetableProvider
        <WidgetableProvider
            uploader={async (fileBuffer, fileName) => {
                return await client.uploadImage(fileBuffer, 'jpg');
            }}
        >
            <AutoComplete
                options={availableModels.map((model) => ({ label: model, value: model }))}
                onChange={(value) => {
                    setInputValue(value);
                }}
                onBlur={(e) => handleModelChange((e.target as any).value)}
                onSelect={(value) => {
                    console.log('onSelect', value);
                    if (value) {
                        handleModelChange(value);
                    }
                }}
                placeholder="Select a model"
                value={inputValue}
                className="renderer-model-select"
            />
            {loadError && <Alert message={loadError} type="error" showIcon />}
            {loading && <Flex justify="center" align="center" style={{ width: '100vw', height: '100vw' }}><Spin /></Flex>}
            {selectedModel && !loading && !loadError && <ReplicateRendererForm />}
        </WidgetableProvider>
    )
}

function ReplicateRendererForm() {
    const currentWidgets = replicateStore((state) => state.currentWidgets);
    const currentValues = replicateStore((state) => state.currentValues);
    const setCurrentValues = replicateStore((state) => state.setCurrentValues);
    const selectedModel = replicateStore((state) => state.selectedModel);
    const runningTasks = replicateStore((state) => state.runningTasks);

    const { runError, progressMessage, handleRun } = useTaskExecutor({
        selectedModel,
        currentValues,
        createTask,
        runningTasks
    });

    return (
        <>
            <Button type="primary" onClick={handleRun}>执行</Button>
            {progressMessage && <Alert message={progressMessage} type="info" showIcon />}
            {runError && <Alert message={runError} type="error" showIcon />}
            <WorkflowEditApiFormat
                modelName={selectedModel}
                widgets={currentWidgets}
                values={currentValues}
                errors={{}}
                onWidgetChange={(widgetIndex: number, value: any, fieldInfo: WidgetableNode) => {
                    currentValues[fieldInfo.id] = value;
                    setCurrentValues(currentValues);
                }}
            />
        </>
    )
}