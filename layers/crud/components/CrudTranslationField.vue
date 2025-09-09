<script setup lang="ts">
const props = defineProps<{
  modelValue: Record<string, any> // The translations object
  fields: string[] // Fields to translate ['name', 'description']
  defaultValues: Record<string, any> // Default (English) values
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
}>()

const { locale, locales } = useI18n()

// Track which locale we're editing
const editingLocale = ref(locale.value)
const showAllLanguages = ref(false)

// Current values for the editing locale
const currentValues = computed(() => {
  if (editingLocale.value === 'en') {
    return props.defaultValues
  }
  return props.modelValue?.[editingLocale.value] || {}
})

function updateField(field: string, value: string) {
  const updated = {
    ...props.modelValue,
    [editingLocale.value]: {
      ...props.modelValue?.[editingLocale.value],
      [field]: value
    }
  }
  emit('update:modelValue', updated)
}

// Show completion status
const translationStatus = computed(() => {
  return locales.value.map(loc => ({
    locale: loc,
    complete: props.fields.every(field =>
      loc === 'en'
        ? props.defaultValues?.[field]
        : props.modelValue?.[loc]?.[field]
    )
  }))
})
</script>

<template>
  <div class="space-y-4 border rounded-lg p-4">
    <!-- Language selector with status indicators -->
    <div class="flex items-center justify-between">
      <UButtonGroup>
        <UButton
          v-for="loc in locales"
          :key="loc"
          :variant="editingLocale === loc ? 'solid' : 'outline'"
          @click="editingLocale = loc"
          size="sm"
        >
          <span class="flex items-center gap-2">
            {{ loc.toUpperCase() }}
            <UIcon
              v-if="translationStatus.find(s => s.locale === loc)?.complete"
              name="i-heroicons-check-circle"
              class="text-green-500"
            />
          </span>
        </UButton>
      </UButtonGroup>

      <UToggle
        v-model="showAllLanguages"
        label="Show all languages"
      />
    </div>

    <!-- Single language edit mode -->
    <div v-if="!showAllLanguages" class="space-y-3">
      <div v-for="field in fields" :key="field">
        <UFormField
          :label="`${field} (${editingLocale.toUpperCase()})`"
          :name="field"
        >
          <UInput
            v-if="field.length < 100"
            :model-value="currentValues[field] || ''"
            @update:model-value="updateField(field, $event)"
            :placeholder="editingLocale !== 'en' ? defaultValues[field] : ''"
          />
          <UTextarea
            v-else
            :model-value="currentValues[field] || ''"
            @update:model-value="updateField(field, $event)"
            :placeholder="editingLocale !== 'en' ? defaultValues[field] : ''"
            :rows="4"
          />
        </UFormField>

        <!-- Show original for reference when not editing English -->
        <p
          v-if="editingLocale !== 'en' && defaultValues[field]"
          class="text-xs text-gray-500 mt-1"
        >
          English: {{ defaultValues[field] }}
        </p>
      </div>
    </div>

    <!-- All languages grid mode -->
    <div v-else class="space-y-4">
      <div v-for="field in fields" :key="field">
        <h4 class="font-medium mb-2">{{ field }}</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="loc in locales" :key="loc">
            <label class="text-sm text-gray-600">{{ loc.toUpperCase() }}</label>
            <UInput
              v-if="field.length < 100"
              :model-value="loc === 'en' ? defaultValues[field] : modelValue?.[loc]?.[field]"
              @update:model-value="updateField(field, $event)"
              :disabled="loc === 'en'"
              size="sm"
            />
            <UTextarea
              v-else
              :model-value="loc === 'en' ? defaultValues[field] : modelValue?.[loc]?.[field]"
              @update:model-value="updateField(field, $event)"
              :disabled="loc === 'en'"
              :rows="3"
              size="sm"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Quick actions -->
    <div class="flex gap-2 pt-2 border-t">
      <UButton
        size="xs"
        variant="ghost"
        @click="copyToOtherLanguages"
      >
        Copy EN to all
      </UButton>
      <UButton
        size="xs"
        variant="ghost"
        @click="clearLanguage(editingLocale)"
        :disabled="editingLocale === 'en'"
      >
        Clear {{ editingLocale.toUpperCase() }}
      </UButton>
    </div>
  </div>
</template>
