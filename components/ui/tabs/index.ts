import { cva, type VariantProps } from 'class-variance-authority';

export { default as Tabs } from './Tabs.vue';
export { default as TabsContent } from './TabsContent.vue';
export { default as TabsList } from './TabsList.vue';
export { default as TabsTrigger } from './TabsTrigger.vue';

export type UiTabVariant = 'default' | 'line';

export const uiTabListVariants = cva('inline-flex h-10 items-center', {
  variants: {
    variant: {
      default:
        'justify-center rounded-md bg-secondary p-1 text-muted-foreground',
      line: 'w-full justify-start border-b',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});
export type UiTabListVariants = VariantProps<typeof uiTabListVariants>;

export const uiTabTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium focus-visible:outline-none focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-sm px-3 py-1.5 ring-offset-background transition-all focus-visible:ring-2 data-[state=active]:bg-white data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        line: 'relative border-b-2 border-b-transparent bg-transparent px-4 pb-3 pt-2 font-semibold text-muted-foreground shadow-none data-[state=active]:border-b-primary data-[state=active]:text-foreground',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);
export type UiTabTriggerVariants = VariantProps<typeof uiTabTriggerVariants>;
