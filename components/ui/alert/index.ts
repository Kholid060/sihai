import { cva, type VariantProps } from 'class-variance-authority'

export { default as Alert } from './Alert.vue'
export { default as AlertDescription } from './AlertDescription.vue'
export { default as AlertTitle } from './AlertTitle.vue'

export const alertVariants = cva(
  'relative bg-gradient-to-br to-background to-60% w-full rounded-lg shadow-sm border-2 border-white p-4 flex items-start gap-2.5',
  {
    variants: {
      variant: {
        success: 'from-blue-600/40',
        default: 'from-primary/40',
        destructive: 'from-destructive/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type AlertVariants = VariantProps<typeof alertVariants>
