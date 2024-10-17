import { cva, type VariantProps } from 'class-variance-authority';

export { default as Alert } from './Alert.vue';
export { default as AlertDescription } from './AlertDescription.vue';
export { default as AlertTitle } from './AlertTitle.vue';

export const alertVariants = cva(
  'relative flex w-full items-start gap-2.5 rounded-lg border-2 border-white bg-gradient-to-br to-background to-60% p-4 shadow-sm',
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
);

export type AlertVariants = VariantProps<typeof alertVariants>;
