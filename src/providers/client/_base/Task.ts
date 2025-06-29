export interface TaskCtorParams {
    statusGetter: (id: string) => Promise<{
        isCompleted: boolean;
        progress: number;
        progressMessage: string;
        rawData: any;
    }>;
    resultGetter: (id: string, lastStatusResult: any) => Promise<any>;
    canceler: ((id: string) => Promise<void>) | null;
}

export class Task<T> {
    public readonly promise: Promise<T>;
    public progress: number = 0;
    public progressMessage: string = '';
    public readonly taskId: string;
    public readonly taskCtorParams: TaskCtorParams;
    constructor(taskId: string, taskCtorParams: TaskCtorParams) {
        this.taskId = taskId;
        this.taskCtorParams = taskCtorParams;
        this.promise = new Promise(async (resolve, reject) => {
            while (true) {
                try {
                    const status = await this.taskCtorParams.statusGetter(this.taskId);
                    if (status.isCompleted) {
                        const result = await this.taskCtorParams.resultGetter(this.taskId, status);
                        resolve(result);
                        break;
                    } else {
                        this.progress = status.progress;
                        this.progressMessage = status.progressMessage;
                    }
                } catch (error) {
                    reject(error);
                    break;
                }
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        });
        this.cancelable = !!this.taskCtorParams.canceler;
    }

    public readonly cancelable: boolean = false;
    async cancel() {
        if (this.taskCtorParams.canceler) {
            await this.taskCtorParams.canceler(this.taskId);
        }
    }
}