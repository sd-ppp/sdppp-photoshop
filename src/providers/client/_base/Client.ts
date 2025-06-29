import { WidgetableWidget } from "../../../schemas/schemas";
import { Task } from "./Task";

export abstract class Client<T> {
    protected readonly config: T

    constructor(config: T) {
        this.config = config
    }

    abstract getWidgets(model: string): Promise<{
        widgetableWidgets: WidgetableWidget[],  
        defaultInput: Record<string, any>,
        rawData: any
    }>;
    abstract run(model: string, input: any): Promise<Task<any>>;
    abstract uploadImage(image: ArrayBuffer, format: 'png' | 'jpg' | 'jpeg' | 'webp'): Promise<string>;
}