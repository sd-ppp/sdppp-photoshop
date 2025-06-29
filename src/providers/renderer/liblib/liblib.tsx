import './liblib.less';
import { Input, Alert, Flex, Select, Spin, Card, Button, AutoComplete } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { liblibStore, changeSelectedModel, createTask } from './liblib.store';
import { availableModels } from '../../client/liblib';
import { WorkflowEditApiFormat } from '../../../tsx/widgetable';
import Link from 'antd/es/typography/Link';
import { sdpppSDK } from '../../../sdk/sdppp-ps-sdk';
import { WidgetableNode } from '../../../schemas/schemas';
import { MainStore } from '../../../tsx/App.store';
import { useWidgetable, WidgetableProvider } from '../../../tsx/widgetable/context';
import { useTaskExecutor } from '../_base/useTaskExecutor';

const { Password } = Input;

export default function LiblibRenderer({ showingPreview }: { showingPreview: boolean }) {
    const { apiKey, apiSecret, setApiKey, setApiSecret } = liblibStore();
    const [error, setError] = useState<string>('');

    return (
        <Flex className="liblib-renderer" vertical gap={8}>
            {!showingPreview ? <Flex gap={8}>
                <Password
                    placeholder="Enter your Liblib API Key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                />
                <Password
                    placeholder="Enter your Liblib API Secret"
                    value={apiSecret}
                    onChange={(e) => setApiSecret(e.target.value)}
                />
            </Flex> : null}
            {
                !apiKey && <Link onClick={() => sdpppSDK.plugins.uxp.openExternalLink("https://www.liblib.art/apis")}>如何获取APIKey和API Secret</Link>
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
                {apiKey && apiSecret && <LiblibRendererModels />}
            </Flex>
        </Flex>
    );
}

function LiblibRendererModels() {
    const { selectedModel } = liblibStore();
    const [inputValue, setInputValue] = useState<string>(selectedModel || '');
    const client = liblibStore((state) => state.client);
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
                liblibStore.setState({
                    selectedModel: value
                });
            }
        }
    };
    useEffect(() => {
        handleModelChange(selectedModel);
    }, [selectedModel]);

    return (
        <WidgetableProvider
            uploader={async (fileBuffer, fileName) => {
                const fileToken = await client.uploadImage(fileBuffer, 'jpg');
                return fileToken;
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
            {selectedModel && !loading && !loadError && <LiblibRendererForm />}
        </WidgetableProvider>
    )
}

function LiblibRendererForm() {
    const currentWidgets = liblibStore((state) => state.currentWidgets);
    const currentValues = liblibStore((state) => state.currentValues);
    const setCurrentValues = liblibStore((state) => state.setCurrentValues);
    const selectedModel = liblibStore((state) => state.selectedModel);
    const runningTasks = liblibStore((state) => state.runningTasks);

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