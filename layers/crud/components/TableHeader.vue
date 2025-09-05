<template>
  <TypoH2>
    {{ title }}
  </TypoH2>
  <UButton
    v-if="createButton"
    color="gray"
    size="md"
    @click="handleCreate"
  >
    <span>Create <span class="hidden md:inline" >{{ useFormatCollections().collectionWithCapitalSingular(collection) }}</span></span>
  </UButton>
</template>
<script setup>
const { open } = useCrud()

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  collection: {
    type: String,
    default: ''
  },
  createButton: {
    type: Boolean,
    default: false
  }
})

const handleCreate = () => {
  open('create', props.collection)
}
</script>
