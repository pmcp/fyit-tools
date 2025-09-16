<!-- components/DevTranslationWrapper.vue -->
<template>
  <span
    v-if="isDev"
    class="dev-translatable"
    :class="{
      'dev-translatable--editable': isEditable,
      'dev-translatable--editing': isEditing,
      'dev-translatable--missing': isMissing
    }"
    @click="startEditing"
    @mouseenter="showTooltip = true"
    @mouseleave="showTooltip = false"
    :title="isDev ? `Translation Key: ${translationKey}` : undefined"
  >
    <!-- Inline editor when editing -->
    <UInput
      v-if="isEditing"
      ref="editorInput"
      v-model="editValue"
      @blur="saveEdit"
      @keydown.enter="saveEdit"
      @keydown.escape="cancelEdit"
      size="sm"
      class="dev-translation-editor"
      :style="{ width: editorWidth }"
      :placeholder="isMissing ? 'Enter new translation...' : 'Edit translation...'"
    />
    
    <!-- Normal display when not editing -->
    <slot v-else />
    
    <!-- Dev tooltip using UTooltip -->
    <UTooltip
      v-if="isDev && !isEditing"
      :text="`${translationKey}${isMissing ? ' (Missing)' : ''} - Click to edit`"
      :content="{ side: 'top', align: 'center' }"
    >
      <span class="sr-only">{{ translationKey }}</span>
    </UTooltip>
  </span>
  
  <!-- Production mode - just render slot -->
  <slot v-else />
</template>

<script setup lang="ts">
interface Props {
  translationKey: string
  mode?: 'system' | 'team'
  category?: string
  currentValue?: string
  isMissing?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'system',
  isMissing: false
})

// Check if we're in dev mode
const isDev = process.dev
const route = useRoute()
const teamSlug = route.params.team as string | undefined
const toast = useToast()

// State
const isEditing = ref(false)
const showTooltip = ref(false)
const editValue = ref('')
const editorInput = ref<HTMLInputElement>()
const editorWidth = ref('200px')

// Check if current translation is editable
const isEditable = computed(() => {
  return isDev && (props.mode === 'system' || (props.mode === 'team' && teamSlug))
})

function startEditing() {
  if (!isEditable.value) return
  
  isEditing.value = true
  editValue.value = props.currentValue || ''
  
  nextTick(() => {
    if (editorInput.value?.$el?.querySelector('input')) {
      const input = editorInput.value.$el.querySelector('input')
      // Calculate width based on content
      const textWidth = editValue.value.length * 8 + 40 // rough estimate
      editorWidth.value = Math.max(120, Math.min(400, textWidth)) + 'px'
      
      input.focus()
      input.select()
    }
  })
}

async function saveEdit() {
  if (!editValue.value.trim()) {
    cancelEdit()
    return
  }

  try {
    const { locale } = useI18n()
    
    if (props.mode === 'team' && teamSlug) {
      // Save as team override (will create if doesn't exist)
      await $fetch(`/api/teams/${teamSlug}/translations`, {
        method: 'PATCH',
        body: {
          keyPath: props.translationKey,
          values: {
            [locale.value]: editValue.value
          },
          category: props.category || 'ui',
          createIfNotExists: true
        }
      })
    } else {
      // Save to system translations (will create if doesn't exist)
      await $fetch('/api/super-admin/translations-system', {
        method: 'PUT',
        body: {
          keyPath: props.translationKey,
          values: {
            [locale.value]: editValue.value
          },
          category: props.category || 'ui',
          createIfNotExists: true,
          description: `Auto-created via dev mode editing for key: ${props.translationKey}`
        }
      })
    }
    
    // Show success feedback
    toast.add({
      title: 'Translation Saved',
      description: `Successfully saved "${props.translationKey}"`,
      color: 'green'
    })
    
    // Refresh the page to see changes
    await refreshCookie('nuxt-i18n')
    window.location.reload()
    
  } catch (error) {
    console.error('Failed to save translation:', error)
    toast.add({
      title: 'Translation Save Failed',
      description: 'Could not save the translation. Please try again.',
      color: 'red'
    })
  }
  
  isEditing.value = false
}

function cancelEdit() {
  isEditing.value = false
  editValue.value = ''
}
</script>

<style scoped>
.dev-translatable {
  position: relative;
  display: inline-block;
}

.dev-translatable--editable {
  cursor: pointer;
  outline: 1px dashed rgba(59, 130, 246, 0.3);
  outline-offset: 1px;
  border-radius: 2px;
  background: rgba(59, 130, 246, 0.05);
  padding: 1px 3px;
  transition: all 0.2s ease;
}

.dev-translatable--editable:hover {
  outline-color: rgba(59, 130, 246, 0.6);
  background: rgba(59, 130, 246, 0.1);
}

.dev-translatable--editing {
  outline-color: rgba(34, 197, 94, 0.6);
  background: rgba(34, 197, 94, 0.1);
}

.dev-translatable--missing {
  outline-color: rgba(239, 68, 68, 0.5);
  background: rgba(239, 68, 68, 0.1);
  animation: pulse-missing 2s infinite;
}

.dev-translatable--missing:hover {
  outline-color: rgba(239, 68, 68, 0.7);
  background: rgba(239, 68, 68, 0.15);
}

.dev-translation-editor {
  font: inherit;
  color: inherit;
  min-width: 120px;
}

@keyframes pulse-missing {
  0%, 100% {
    outline-color: rgba(239, 68, 68, 0.5);
  }
  50% {
    outline-color: rgba(239, 68, 68, 0.8);
  }
}
</style>
