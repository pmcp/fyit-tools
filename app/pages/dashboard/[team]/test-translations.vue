<template>
  <div class="container mx-auto p-6 space-y-8">
    <h1 class="text-2xl font-bold mb-6">Translation Display Component Demo</h1>
    
    <div class="space-y-6">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Short Translations (Inline)</h2>
        </template>
        <TranslationDisplay :translations="shortTranslations" />
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Medium Translations (Popover)</h2>
        </template>
        <TranslationDisplay :translations="mediumTranslations" />
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Long Translations (Modal)</h2>
        </template>
        <TranslationDisplay :translations="longTranslations" />
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Mixed & Partial Translations</h2>
        </template>
        <TranslationDisplay :translations="mixedTranslations" />
      </UCard>

      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Custom Languages</h2>
        </template>
        <TranslationDisplay 
          :translations="customLanguageTranslations" 
          :languages="['en', 'ja', 'zh', 'ar', 'ru']"
        />
      </UCard>
    </div>
  </div>
</template>

<script setup lang="ts">
const shortTranslations = {
  en: 'Hello',
  fr: 'Bonjour',
  nl: 'Hallo',
  de: 'Hallo',
  es: 'Hola',
  it: 'Ciao'
}

const mediumTranslations = {
  en: 'Welcome to our platform. We are glad to have you here.',
  fr: 'Bienvenue sur notre plateforme. Nous sommes ravis de vous avoir ici.',
  nl: 'Welkom op ons platform. We zijn blij dat je hier bent.',
  de: 'Willkommen auf unserer Plattform. Wir freuen uns, Sie hier zu haben.',
  es: 'Bienvenido a nuestra plataforma. Nos alegra tenerte aquí.',
  it: 'Benvenuto sulla nostra piattaforma. Siamo felici di averti qui.'
}

const longTranslations = {
  en: `This is a comprehensive guide to using our advanced translation management system. Our platform provides powerful tools for managing multilingual content across your entire application. With features like automatic translation suggestions, version control, and collaborative editing, you can ensure consistency and quality across all your translations. The system supports over 100 languages and includes built-in quality checks to maintain high standards. Whether you're managing a small website or a large enterprise application, our translation tools scale to meet your needs.`,
  fr: `Ceci est un guide complet pour utiliser notre système avancé de gestion des traductions. Notre plateforme fournit des outils puissants pour gérer le contenu multilingue dans toute votre application. Avec des fonctionnalités telles que les suggestions de traduction automatique, le contrôle de version et l'édition collaborative, vous pouvez garantir la cohérence et la qualité de toutes vos traductions. Le système prend en charge plus de 100 langues et comprend des contrôles de qualité intégrés pour maintenir des normes élevées. Que vous gériez un petit site Web ou une grande application d'entreprise, nos outils de traduction s'adaptent à vos besoins.`,
  nl: `Dit is een uitgebreide gids voor het gebruik van ons geavanceerde vertaalbeheersysteem. Ons platform biedt krachtige tools voor het beheren van meertalige content in uw hele applicatie. Met functies zoals automatische vertaalsuggesties, versiebeheer en gezamenlijk bewerken, kunt u consistentie en kwaliteit in al uw vertalingen garanderen. Het systeem ondersteunt meer dan 100 talen en bevat ingebouwde kwaliteitscontroles om hoge normen te handhaven. Of u nu een kleine website of een grote bedrijfsapplicatie beheert, onze vertaaltools schalen mee met uw behoeften.`
}

const mixedTranslations = {
  en: 'Click here to continue',
  fr: '', // Empty translation
  nl: 'Klik hier om door te gaan met het proces en alle benodigde stappen te voltooien',
  de: 'Klicken Sie hier',
  es: `Este es un texto muy largo que explica en detalle todo el proceso que debe seguir el usuario para completar su registro en nuestra plataforma. Incluye múltiples pasos, verificaciones y confirmaciones que garantizan la seguridad y correcta configuración de su cuenta.`
}

const customLanguageTranslations = {
  en: 'Welcome',
  ja: 'ようこそ',
  zh: '欢迎',
  ar: 'مرحبا',
  ru: 'Добро пожаловать'
}
</script>