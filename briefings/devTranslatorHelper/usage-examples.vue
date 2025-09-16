<!-- Example usage in your components -->

<!-- 1. Simple text translation -->
<template>
  <div>
    <h1>{{ t('welcome.title') }}</h1>
    <p>{{ t('welcome.description', { params: { name: user.name } }) }}</p>
  </div>
</template>

<!-- 2. Button text -->
<template>
  <UButton>
    {{ t('common.save') }}
  </UButton>
</template>

<!-- 3. Form labels -->
<template>
  <UFormField :label="t('forms.email')">
    <UInput v-model="email" />
  </UFormField>
</template>

<!-- 4. Complex content with fallbacks -->
<template>
  <div>
    <h2>{{ t('products.title', { fallback: 'Our Products' }) }}</h2>
    <p>{{ t('products.description', { 
      fallback: 'Discover our amazing products',
      category: 'marketing' 
    }) }}</p>
  </div>
</template>

<!-- 5. Content field translation -->
<template>
  <div v-for="product in products" :key="product.id">
    <h3>{{ tContent(product, 'name') }}</h3>
    <p>{{ tContent(product, 'description') }}</p>
  </div>
</template>

<!-- 6. String-only version for computed properties -->
<script setup>
const { t, tString, tContent } = useT()

// Use tString when you need a plain string
const pageTitle = computed(() => tString('pages.dashboard.title'))

// Use regular t() in templates for dev mode functionality
const buttonText = computed(() => t('common.submit'))
</script>

<!-- 7. Layout with dev mode toggle -->
<template>
  <div>
    <!-- Your app content -->
    <main>
      <h1>{{ t('app.title') }}</h1>
      <!-- ... rest of your app -->
    </main>
    
    <!-- Dev mode toggle (only in development) -->
    <DevModeToggle />
  </div>
</template>

<!-- 8. Advanced usage with categories -->
<template>
  <div>
    <!-- UI translations -->
    <h1>{{ t('nav.dashboard') }}</h1>
    
    <!-- Marketing content -->
    <p>{{ t('marketing.hero.subtitle', { category: 'marketing' }) }}</p>
    
    <!-- Email templates -->
    <div v-if="previewMode">
      {{ t('email.welcome.subject', { 
        category: 'email',
        params: { companyName: 'Acme Corp' }
      }) }}
    </div>
  </div>
</template>

<!-- 9. Conditional dev mode rendering -->
<template>
  <div>
    <!-- This will show edit outline in dev mode -->
    <h1 v-if="isDev">{{ t('complex.title') }}</h1>
    
    <!-- This will not be editable (string only) -->
    <title>{{ tString('meta.title') }}</title>
  </div>
</template>

<script setup>
const isDev = process.dev
</script>
