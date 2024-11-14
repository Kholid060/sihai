<template>
  <div ref="containerRef" class="link-destination-url font-sans"></div>
</template>
<script setup lang="ts">
import { minimalSetup, EditorView } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { placeholder } from '@codemirror/view';
import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from '@codemirror/autocomplete';
import { autocompletion } from '@codemirror/autocomplete';
import Bowser from 'bowser';
import type { LinkVariableList } from '~/interface/link.interface';
import { watchDebounced } from '@vueuse/core';

const completions: (Completion & { label: LinkVariableList })[] = [
  {
    label: 'os',
    type: 'text',
    info: `The user's operating system. Possible values: \n${formatList(Object.keys(Bowser.OS_MAP))}`,
  },
  {
    type: 'text',
    label: 'browser',
    info: `The user's browser. Possible values: \n${formatList(Object.keys(Bowser.BROWSER_MAP))}`,
  },
  {
    label: 'country',
    type: 'text',
    info: `The user's country is based on the IP.\nThe value follows the ISO 3166-1 alpha-2 format`,
  },
  {
    label: 'date',
    type: 'text',
    info: `The current date in UTC Timezone.\nFormat: YYYY-MM-DD`,
  },
  {
    label: 'date-time',
    type: 'text',
    info: `The current date and time in UTC Timezone.\nFormat: YYYY-MM-DDTHH:mm:ss.sssZ`,
  },
  {
    label: 'time',
    type: 'text',
    info: `The current time in UTC Timezone.\nFormat: HH:mm`,
  },
  {
    type: 'text',
    label: 'language',
    info: `The user's browser language.\nThe value follows the ISO 639-1 format`,
  },
  {
    label: 'device',
    type: 'text',
    info: `The user's device type. Possible values: \n${formatList(Object.keys(Bowser.PLATFORMS_MAP))}`,
  },
];

const model = defineModel<string>();

const containerRef = ref<HTMLDivElement>();
const editorView = shallowRef<EditorView>();

function formatList(values: string[]) {
  return values.map((item) => `- ${item}`).join('\n');
}
function destinationCompletions(
  context: CompletionContext,
): CompletionResult | null {
  const before = context.matchBefore(/\{([^{}]*)$/);
  if (!before) return null;

  return {
    validFor: /^\w*$/,
    options: completions,
    from: before ? before.from + 1 : context.pos,
  };
}

watchDebounced(
  model,
  (value) => {
    if (
      !editorView.value ||
      typeof value !== 'string' ||
      editorView.value.state.doc.toString() === value
    )
      return;

    editorView.value.dispatch({
      changes: {
        from: 0,
        insert: value,
        to: editorView.value.state.doc.length,
      },
    });
  },
  { debounce: 150 },
);

onMounted(() => {
  const updateListener = EditorView.updateListener.of((value) => {
    const newValue = value.state.doc.toString();
    if (!value.docChanged || newValue === model.value) return;

    model.value = newValue;
  });
  editorView.value = new EditorView({
    doc: model.value,
    extensions: [
      minimalSetup,
      updateListener,
      autocompletion({ override: [destinationCompletions] }),
      placeholder('https://example.com/sub/my/long-url?country={country}'),
      EditorState.transactionFilter.of((tr) => {
        return tr.newDoc.lines > 1 ? [] : [tr];
      }),
    ],
    parent: containerRef.value,
  });
});
onUnmounted(() => {
  editorView.value?.destroy();
});
</script>
<style lang="postcss">
.link-destination-url {
  .cm-editor {
    &.cm-focused {
      outline: none;
      @apply rounded-md ring-2 ring-ring ring-offset-2;
    }

    .cm-scroller {
      height: theme('height.10');
      border-radius: theme('borderRadius.md');
      border: 1px solid theme('borderColor.border');
    }

    .cm-content {
      font-size: theme('fontSize.sm');
      font-family: theme('fontFamily.sans');
      line-height: theme('lineHeight.normal');
      padding: theme('padding.2') theme('padding.3');
    }

    .cm-line {
      padding: 0;
    }

    .cm-tooltip-autocomplete {
      padding: theme('padding.1');
      border-radius: theme('borderRadius.md');
    }

    .cm-tooltip-autocomplete [role='listbox'] {
      font-size: theme('fontSize.sm');
      font-family: theme('fontFamily.sans');

      [role='option'] {
        border-radius: 6px;

        &[aria-selected='true'] {
          background-color: theme('colors.grass.9');
        }
      }
    }

    .cm-completionInfo {
      overflow: auto;
      font-size: theme('fontSize.sm');
      max-height: theme('maxHeight.96');
      border-radius: theme('borderRadius.md');
    }
  }
}
</style>
