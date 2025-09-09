<script setup lang="ts">
const props = defineProps<{
  modelValue: Record<string, any> // The translations object
  fields: string[] // Fields to translate ['name', 'description']
  defaultValues: Record<string, any> // Default (English) values
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'update:english': [value: { field: string, value: string }]
}>()

const { locale, locales } = useI18n()

// Track which locale we're editing
const editingLocale = ref(locale.value)
const showAllLanguages = ref(false)

// Local state to preserve English values
const localEnglishValues = ref({ ...(props.defaultValues || {}) })

// Watch for defaultValues changes to sync
watch(() => props.defaultValues, (newValues) => {
  localEnglishValues.value = { ...(newValues || {}) }
}, { deep: true })

// Current values for the editing locale
const currentValues = computed(() => {
  if (editingLocale.value === 'en') {
    return localEnglishValues.value
  }
  return props.modelValue?.[editingLocale.value] || {}
})

function updateField(field: string, value: string, locale?: string) {
  const targetLocale = locale || editingLocale.value

  if (targetLocale === 'en') {
    localEnglishValues.value[field] = value
    emit('update:english', { field, value })
    return
  }
  const updated = {
    ...props.modelValue,
    [targetLocale]: {
      ...props.modelValue?.[targetLocale],
      [field]: value
    }
  }
  emit('update:modelValue', updated)
}

function copyToOtherLanguages() {
  const updated = { ...props.modelValue }

  // Copy English values to all other languages
  locales.value.forEach(loc => {
    const localeCode = typeof loc === 'string' ? loc : loc.code
    if (localeCode !== 'en') {
      updated[localeCode] = {}
      props.fields.forEach(field => {
        updated[localeCode][field] = localEnglishValues.value?.[field] || ''
      })
    }
  })

  emit('update:modelValue', updated)
}

function clearLanguage(locale: string) {
  if (locale === 'en') return

  const updated = { ...props.modelValue }
  delete updated[locale]
  emit('update:modelValue', updated)
}

// Show completion status
const translationStatus = computed(() => {
  return locales.value.map(loc => {
    const localeCode = typeof loc === 'string' ? loc : loc.code
    return {
      locale: localeCode,
      complete: props.fields.every(field =>
        localeCode === 'en'
          ? localEnglishValues.value?.[field]
          : props.modelValue?.[localeCode]?.[field]
      )
    }
  })
})
</script>

<template>
  <div class="space-y-4">
    <!-- Language selector with status indicators -->
    <div class="flex items-center justify-between">
      <UFieldGroup>
        <UButton
          v-for="loc in locales"
          :key="typeof loc === 'string' ? loc : loc.code"
          :variant="editingLocale === (typeof loc === 'string' ? loc : loc.code) ? 'solid' : 'outline'"
          @click="editingLocale = typeof loc === 'string' ? loc : loc.code"
          size="sm"
        >
          <span class="flex items-center gap-2">
            {{ (typeof loc === 'string' ? loc : loc.code).toUpperCase() }}
            <UIcon
              v-if="translationStatus.find(s => s.locale === (typeof loc === 'string' ? loc : loc.code))?.complete"
              name="i-heroicons-check-circle"
              class="text-green-500"
            />
          </span>
        </UButton>
      </UFieldGroup>

      <USwitch
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
            :placeholder="editingLocale !== 'en' ? defaultValues?.[field] || '' : ''"
          />
          <UTextarea
            v-else
            :model-value="currentValues[field] || ''"
            @update:model-value="updateField(field, $event)"
            :placeholder="editingLocale !== 'en' ? defaultValues?.[field] || '' : ''"
            :rows="4"
          />
        </UFormField>

        <!-- Show original for reference when not editing English -->
        <p
          v-if="editingLocale !== 'en' && localEnglishValues.value?.[field]"
          class="text-xs text-gray-500 mt-1"
        >
          English: {{ localEnglishValues.value?.[field] || '' }}
        </p>
      </div>
    </div>

    <!-- All languages grid mode -->

    <div v-else class="space-y-4">
      <div v-for="field in fields" :key="field">
        <h4 class="font-medium mb-2">{{ field }}</h4>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div v-for="loc in locales" :key="typeof loc === 'string' ? loc : loc.code">
            <label class="text-sm text-gray-600">{{ (typeof loc === 'string' ? loc : loc.code).toUpperCase() }}</label>
            <UInput
              v-if="field.length < 100"
              :model-value="(typeof loc === 'string' ? loc : loc.code) === 'en' ? localEnglishValues.value[field] || '' : modelValue?.[(typeof loc === 'string' ? loc : loc.code)]?.[field] || ''"
              @update:model-value="updateField(field, $event, typeof loc === 'string' ? loc : loc.code)"
              size="sm"
            />
            <UTextarea
              v-else
              :model-value="(typeof loc === 'string' ? loc : loc.code) === 'en' ? localEnglishValues.value[field] || '' : modelValue?.[(typeof loc === 'string' ? loc : loc.code)]?.[field] || ''"
              @update:model-value="updateField(field, $event, typeof loc === 'string' ? loc : loc.code)"
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
