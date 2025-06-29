import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// 定义hook函数的类型
type uploadPass = {
    getUploadFile: () => Promise<{
        fileBuffer: Buffer,
        fileName: string,
    }>,
};

// 定义Context的类型
interface WidgetableContextType {
    runUploadPassOnce: ({ getUploadFile }: {
        getUploadFile: () => Promise<{
            fileBuffer: Buffer,
            fileName: string,
        }>,
    }) => Promise<string>;
    addUploadPass: ({ getUploadFile }: {
        getUploadFile: () => Promise<{
            fileBuffer: Buffer,
            fileName: string,
        }>,
    }) => string;
    removeUploadPass: (pass: uploadPass) => void;

    waitAllUploadPasses: () => Promise<void>;
}

// 创建Context
const WidgetableContext = createContext<WidgetableContextType | undefined>(undefined);

// Provider组件的Props类型
interface WidgetableProviderProps {
    children: ReactNode;
    uploader: (fileBuffer: Buffer, fileName: string) => Promise<string>;
}

// Provider组件
export function WidgetableProvider({ children, uploader }: WidgetableProviderProps) {
    const [uploadPasses, setUploadPasses] = useState<uploadPass[]>([]);
    const [runningUploadPasses, setRunningUploadPasses] = useState<{
        [id: string]: Promise<string>
    }>({});

    const value: WidgetableContextType = {
        runUploadPassOnce: async (pass: uploadPass) => {
            if (!uploader) {
                throw new Error('Uploader not set, please call setUploader first');
            }
            const promise = new Promise<string>(async (resolve, reject) => {
                const { fileBuffer, fileName } = await pass.getUploadFile();
                const fileURL = uploader(fileBuffer, fileName)
                .then(url => {
                    resolve(url);
                })
                .catch(error => {
                    reject(error);
                });
                setRunningUploadPasses((runningUploadPasses) => {
                    delete runningUploadPasses[runID];
                    return runningUploadPasses;
                });
            })
            const runID = uuidv4();
            setRunningUploadPasses({
                ...runningUploadPasses,
                [runID]: promise
            });

            return await promise;
        },
        addUploadPass: (pass: uploadPass) => {
            const passId = uuidv4();
            setUploadPasses([...uploadPasses, pass]);
            return passId;
        },
        removeUploadPass: (pass: uploadPass) => {
            setUploadPasses(uploadPasses.filter(p => p !== pass));
        },
        waitAllUploadPasses: async () => {
            if (!uploader) {
                throw new Error('Uploader not set, please call setUploader first');
            }
            const promisesFromUploadPasses = uploadPasses.map(async pass => {
                const { fileBuffer, fileName } = await pass.getUploadFile();
                const fileURL = await uploader(fileBuffer, fileName);
                return fileURL;
            });
            const promisesFromRunningUploadPasses = Object.values(runningUploadPasses);
            console.log(
                'promisesFromUploadPasses length: ',
                promisesFromUploadPasses.length,
                'promisesFromRunningUploadPasses length:',
                promisesFromRunningUploadPasses.length
            )
            await Promise.all([...promisesFromUploadPasses, ...promisesFromRunningUploadPasses]);
        },
    };

    return (
        <WidgetableContext.Provider value={value}>
            {children}
        </WidgetableContext.Provider>
    );
}

// 自定义Hook：使用Context
export function useWidgetable() {
    const context = useContext(WidgetableContext);
    if (context === undefined) {
        throw new Error('useWidgetable must be used within a WidgetableProvider');
    }
    return context;
}
