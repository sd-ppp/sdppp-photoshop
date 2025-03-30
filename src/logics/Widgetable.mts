// import { SDPPPGraphForm } from "../../../../common/types";

// export function storeWidgetValue(title: string, widgetIndex: number, value: any, outputType: string) {
//     localStorage.setItem(`widgetValue_${title}_${widgetIndex}`, JSON.stringify({
//         value,
//         outputType
//     }))
// }
// export function getStoredWidgetValue(title: string, widgetIndex: number): {
//     value: any,
//     outputType: string
// } | null {
//     const storedValue = localStorage.getItem(`widgetValue_${title}_${widgetIndex}`)
//     if (!storedValue) return null;
//     const { value, outputType } = JSON.parse(storedValue);
//     // if (outputType == "IMAGE" || outputType == "MASK") {
//     //     console.log("getStoredWidgetValue", value, outputType)
//     // }
//     return {
//         value,
//         outputType
//     }
// }

// export default class Widgetable {
//     private currentForm: SDPPPGraphForm[];
//     private beforeRunListeners: (() => void)[] = [];
//     public static activeInstance: Widgetable | null = null;

//     constructor(remoteForm: SDPPPGraphForm[]) {
//         this.currentForm = JSON.parse(JSON.stringify(remoteForm));
//         for (let i = 0; i < this.currentForm.length; i++) {
//             for (let j = 0; j < this.currentForm[i].widgets.length; j++) {
//                 const storedValue = getStoredWidgetValue(this.currentForm[i].title, j);
//                 if (storedValue && this.currentForm[i].widgets[j].outputType == storedValue.outputType) {
//                     this.currentForm[i].widgets[j].value = storedValue.value;
//                 }
//             }
//         }
//     }

//     public addBeforeRunListener(callback: () => void) {
//         this.beforeRunListeners.push(callback);
//     }

//     public async triggerBeforeRun() {
//         await Promise.all(this.beforeRunListeners.map(async listener => {
//             try {
//                 await listener();
//             } catch (error) {
//                 console.error('Error executing beforeRun listener:', error);
//             }
//         }));
//     }

//     public getForm() {
//         return this.currentForm;
//     }

//     public updateForm(remoteForm: SDPPPGraphForm[]) {
//         this.currentForm = JSON.parse(JSON.stringify(remoteForm));
//         for (let i = 0; i < this.currentForm.length; i++) {
//             for (let j = 0; j < this.currentForm[i].widgets.length; j++) {
//                 // only setWidgetValue() will force change the outputType
//                 // if (storedValue && this.currentForm[i].widgets[j].outputType == storedValue.outputType) {
//                 storeWidgetValue(this.currentForm[i].title, j, this.currentForm[i].widgets[j].value, this.currentForm[i].widgets[j].outputType);
//                 // }
//             }
//         }
//     }
//     public setWidgetValue(nodeID: number, widgetIndex: number, value: any) {
//         for (let i = 0; i < this.currentForm.length; i++) {
//             if (this.currentForm[i].id === nodeID) {
//                 this.currentForm[i].widgets[widgetIndex].value = value;
//                 storeWidgetValue(this.currentForm[i].title, widgetIndex, value, this.currentForm[i].widgets[widgetIndex].outputType);
//                 break;
//             }
//         }
//     }

//     public isDiffFromRemote(remoteForm: SDPPPGraphForm[] = []) {
//         if (this.currentForm.length !== remoteForm.length) {
//             return true;
//         }
//         for (let i = 0; i < this.currentForm.length; i++) {
//             if (this.currentForm[i].id !== remoteForm[i].id) {
//                 return true;
//             }
//             for (let j = 0; j < this.currentForm[i].widgets.length; j++) {
//                 if (this.currentForm[i].widgets[j].value !== remoteForm[i].widgets[j].value) {
//                     return true;
//                 }
//             }
//         }
//         return false;
//     }

//     public removeBeforeRunListener(callback: () => void) {
//         this.beforeRunListeners = this.beforeRunListeners.filter(
//             listener => listener !== callback
//         );
//     }
// }
