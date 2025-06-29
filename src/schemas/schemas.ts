import { z } from "zod";

export const WidgetableBaseWidgetSchema = z.object({
    name: z.string(),
    uiWeight: z.number(),
})
export const WidgetableImagesWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('images'),
        options: z.object({
            required: z.boolean(),
            maxCount: z.number().optional(),
            maskMode: z.boolean().optional()
        })
    })
)
export const WidgetableMasksWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('masks'),
        options: z.object({
            required: z.boolean()
        })
    })
)
export const WidgetableStringWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('string'),
        options: z.object({
            required: z.boolean()
        })
    })
)
export const WidgetableToggleWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('boolean'),
        options: z.object({
            required: z.boolean()
        })
    })
)
export const WidgetableNumberWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('number'),
        options: z.object({
            required: z.boolean(),
            min: z.number().optional(),
            max: z.number().optional(),
            step: z.number().optional(),
            random: z.boolean().optional()
        })
    })
)
export const WidgetableComboWidgetSchema = WidgetableBaseWidgetSchema.merge(
    z.object({
        outputType: z.literal('combo'),
        options: z.object({
            required: z.boolean(),
            values: z.array(z.string())
        })
    })
)
export const WidgetableWidgetSchema = z.discriminatedUnion("outputType", [
    WidgetableImagesWidgetSchema,
    WidgetableMasksWidgetSchema,
    WidgetableStringWidgetSchema,
    WidgetableToggleWidgetSchema,
    WidgetableNumberWidgetSchema,
    WidgetableComboWidgetSchema
])
export const WidgetableNodeSchema = z.object({
    id: z.string(),
    title: z.string(),
    widgets: z.array(WidgetableWidgetSchema),
    uiWeightSum: z.number()
})
export const WidgetableStructureSchema = z.object({
    widgetableID: z.string(),
    widgetablePath: z.string(),
    nodes: z.record(z.string(), WidgetableNodeSchema),
    nodeIndexes: z.array(z.string()),
    options: z.record(z.string(), z.any())
})

export type WidgetableBaseWidget = z.infer<typeof WidgetableBaseWidgetSchema>;  
export type WidgetableImagesWidget = z.infer<typeof WidgetableImagesWidgetSchema>;
export type WidgetableMasksWidget = z.infer<typeof WidgetableMasksWidgetSchema>;
export type WidgetableStringWidget = z.infer<typeof WidgetableStringWidgetSchema>;
export type WidgetableToggleWidget = z.infer<typeof WidgetableToggleWidgetSchema>;
export type WidgetableNumberWidget = z.infer<typeof WidgetableNumberWidgetSchema>;
export type WidgetableComboWidget = z.infer<typeof WidgetableComboWidgetSchema>;
export type WidgetableWidget = z.infer<typeof WidgetableWidgetSchema>;
export type WidgetableNode = z.infer<typeof WidgetableNodeSchema>;
export type WidgetableStructure = z.infer<typeof WidgetableStructureSchema>;
export type WidgetableValues = Record<string, any[]>

export function getDefaultValues(otuputType: string, options: any) {
    switch (otuputType) {
        case 'images':
            return [];
        case 'masks':
            return [];
        case 'string':
            return '';
        case 'boolean':
            return false;
        case 'number':
            return 0;
        case 'combo':
            return options.values[0];
    }
}