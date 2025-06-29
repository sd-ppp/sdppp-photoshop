import { useEffect, useState } from 'react';
import { useWidgetable } from '../../../tsx/widgetable/context';
import { MainStore } from '../../../tsx/App.store';

export interface UseTaskExecutorOptions {
    selectedModel: string;
    currentValues: any;
    createTask: (model: string, values: any) => Promise<any>;
    runningTasks: any[];
}

export function useTaskExecutor({
    selectedModel,
    currentValues,
    createTask,
    runningTasks
}: UseTaskExecutorOptions) {
    const [runError, setRunError] = useState<string>('');
    const [lastStartTime, setLastStartTime] = useState<number>(0);
    const [progressMessage, setProgressMessage] = useState<string>('');
    const { waitAllUploadPasses } = useWidgetable();
    const setPreviewImageList = MainStore((state) => state.setPreviewImageList);

    // 进度跟踪逻辑
    useEffect(() => {
        if (!lastStartTime) {
            return;
        }
        const interval = setInterval(() => {
            if (lastStartTime > 0 && runningTasks.length > 0) {
                setProgressMessage(` 运行了 ${((Date.now() - lastStartTime) / 1000).toFixed(2)} 秒，${runningTasks[0].progressMessage}`);
            }
        }, 100);

        return () => {
            clearInterval(interval);
            setProgressMessage('');
        }
    }, [lastStartTime, runningTasks]);

    // 任务执行逻辑
    const handleRun = async () => {
        // must call waitAllUploadPasses, otherwise the image component may not finished uploading
        // waitAllUploadPasses一定要调，否则图片组件的上传可能还未完成
        setRunError('');
        setProgressMessage('正在等待图片上传...');
        await waitAllUploadPasses();

        setProgressMessage('正在创建任务...');
        try {
            const task = await createTask(selectedModel, currentValues);
            setLastStartTime(Date.now());
            if (task) {
                try {
                    const result = await task.promise;
                    setPreviewImageList([
                        ...MainStore.getState().previewImageList,
                        ...result.map((output: any) => ({
                            url: output.url,
                            source: 'remote'
                        }))
                    ]);
                } catch (error: any) {
                    setProgressMessage('');
                    setRunError(error.message || error.toString());
                } finally {
                    setLastStartTime(0);
                }
            }
        } catch (error: any) {
            setProgressMessage('');
            setRunError(error.message || error.toString());
        } finally {
            setProgressMessage('');
        }
    };

    return {
        runError,
        progressMessage,
        handleRun
    };
} 