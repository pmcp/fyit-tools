<!-- components/DevModeToggle.vue -->
<template>
  <div 
    v-if="isDev"
    class="fixed bottom-4 right-4 z-50"
  >
    <UButton
      :color="devModeEnabled ? 'success' : 'neutral'"
      :variant="devModeEnabled ? 'solid' : 'soft'"
      size="sm"
      @click="toggleDevMode"
      class="shadow-lg"
      :icon="devModeEnabled ? 'i-lucide-pencil-square' : 'i-lucide-pencil'"
    >
      {{ devModeEnabled ? 'Dev Edit: ON' : 'Dev Edit: OFF' }}
    </UButton>
    
    <!-- Dev mode info panel using UCard -->
    <UCard
      v-if="showInfo"
      class="absolute bottom-full right-0 mb-2 w-80"
      :ui="{ 
        body: { padding: 'p-4' },
        header: { padding: 'px-4 py-3' }
      }"
    >
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="font-semibold text-sm">Translation Dev Mode</h3>
          <UButton
            variant="ghost"
            size="xs"
            @click="showInfo = false"
            icon="i-lucide-x"
            color="neutral"
          />
        </div>
      </template>
      
      <div class="text-xs text-gray-600 dark:text-gray-400 space-y-3">
        <p class="font-medium">
          Click any translatable text to edit it inline.
        </p>
        
        <div class="space-y-2">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 border border-blue-400 rounded bg-blue-50"></div>
            <span>System translations</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 border border-green-400 rounded bg-green-50"></div>
            <span>Team overrides</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 border border-red-400 rounded bg-red-50"></div>
            <span>Missing translations</span>
          </div>
        </div>
        
        <div class="pt-2 border-t border-gray-200 dark:border-gray-600">
          <p class="font-medium mb-1">Shortcuts:</p>
          <div class="flex gap-4 text-xs">
            <span><kbd class="bg-gray-100 dark:bg-gray-800 px-1 rounded">Enter</kbd> Save</span>
            <span><kbd class="bg-gray-100 dark:bg-gray-800 px-1 rounded">Esc</kbd> Cancel</span>
          </div>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Only show in development
const isDev = process.dev

// Global dev mode state
const devModeEnabled = useState('devMode.enabled', () => false)
const showInfo = ref(false)

function toggleDevMode() {
  devModeEnabled.value = !devModeEnabled.value
  
  // Show info panel when enabling for the first time
  if (devModeEnabled.value) {
    showInfo.value = true
    setTimeout(() => {
      showInfo.value = false
    }, 5000)
  }
  
  // Add/remove CSS class to document for global styling
  if (process.client) {
    if (devModeEnabled.value) {
      document.documentElement.classList.add('dev-mode-enabled')
    } else {
      document.documentElement.classList.remove('dev-mode-enabled')
    }
  }
}

// Clean up on unmount
onUnmounted(() => {
  if (process.client) {
    document.documentElement.classList.remove('dev-mode-enabled')
  }
})
</script>

<style>
/* Global styles for dev mode */
.dev-mode-enabled .dev-translatable--editable {
  animation: pulse-outline 2s infinite;
}

@keyframes pulse-outline {
  0%, 100% {
    outline-color: rgba(59, 130, 246, 0.3);
  }
  50% {
    outline-color: rgba(59, 130, 246, 0.6);
  }
}

/* Enhanced styling for missing translations in dev mode */
.dev-mode-enabled .dev-translatable--missing {
  animation: pulse-missing 2s infinite;
}

@keyframes pulse-missing {
  0%, 100% {
    outline-color: rgba(239, 68, 68, 0.5);
    background: rgba(239, 68, 68, 0.1);
  }
  50% {
    outline-color: rgba(239, 68, 68, 0.8);
    background: rgba(239, 68, 68, 0.15);
  }
}
</style>
