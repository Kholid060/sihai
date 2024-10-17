import { cva, type VariantProps } from 'class-variance-authority';

export { default as Input } from './Input.vue';

export const inputVariants = cva(
  'flex w-full rounded-md border border-input bg-background ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-2 aria-invalid:ring-destructive aria-invalid:ring-offset-2',
  {
    variants: {
      size: {
        default: 'h-10 px-3 py-2 text-sm',
        lg: 'h-11 px-4 py-3',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
);
export type InputVariants = VariantProps<typeof inputVariants>;
