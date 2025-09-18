# Translation Audit Guide

## Overview
This guide helps identify and fix hardcoded strings that should be using the translation system.

## Quick Audit Commands

### 1. Find Hardcoded Labels in Components
```bash
# Find label props with hardcoded strings
grep -r 'label="[A-Z][^"]*"' app layers --include="*.vue"

# Find placeholder props with hardcoded strings
grep -r 'placeholder="[A-Z][^"]*"' app layers --include="*.vue"

# Find title props with hardcoded strings
grep -r 'title="[A-Z][^"]*"' app layers --include="*.vue"
```

### 2. Find Hardcoded HTML Content
```bash
# Find headings with hardcoded text
grep -r '<h[1-6][^>]*>[A-Z][^<]+</h[1-6]>' app layers --include="*.vue"

# Find paragraphs with hardcoded text
grep -r '<p[^>]*>[A-Z][^<]+</p>' app layers --include="*.vue"

# Find spans with hardcoded text
grep -r '<span[^>]*>[A-Z][^<]+</span>' app layers --include="*.vue"

# Find divs with hardcoded text (be careful, lots of false positives)
grep -r '<div[^>]*>[A-Z][^<]+</div>' app layers --include="*.vue" | head -20
```

### 3. Find Hardcoded Toast Messages
```bash
# Find toast.add with hardcoded titles
grep -r "toast\.(add|show).*title:\s*['\"][A-Z]" app layers --include="*.{vue,ts}"

# Find toast.add with hardcoded descriptions
grep -r "toast\.(add|show).*description:\s*['\"][A-Z]" app layers --include="*.{vue,ts}"
```

### 4. Find Hardcoded Error Messages
```bash
# Find createError with hardcoded statusMessage
grep -r "throw createError.*statusMessage:\s*['\"][A-Z]" . --include="*.{vue,ts}"

# Find console.error with hardcoded messages
grep -r "console\.error\(['\"][A-Z]" app layers --include="*.{vue,ts}"
```

### 5. Find Form Field Labels
```bash
# Find UFormField with hardcoded labels
grep -r '<UFormField.*label="[A-Z][^"]*"' app layers --include="*.vue"

# Find UButton with hardcoded labels
grep -r '<UButton.*label="[A-Z][^"]*"' app layers --include="*.vue"
```

## How to Fix Untranslated Strings

### 1. For Component Props (ref pattern)
```vue
<!-- Before -->
<UButton label="Save Changes" />

<!-- After -->
<script setup>
const { t } = useT()
</script>
<UButton :label="t('common.saveChanges')" />
```

### 2. For Template Text (string pattern)
```vue
<!-- Before -->
<h1>Welcome to Dashboard</h1>

<!-- After -->
<script setup>
const { tString } = useT()
</script>
<h1>{{ tString('dashboard.welcome') }}</h1>
```

### 3. For Toast Messages
```typescript
// Before
toast.add({
  title: 'Saved successfully',
  description: 'Your changes have been saved'
})

// After
const { t } = useT()
toast.add({
  title: t('messages.saved.title'),
  description: t('messages.saved.description')
})
```

### 4. For Error Messages
```typescript
// Before
throw createError({
  statusCode: 403,
  statusMessage: 'Unauthorized'
})

// After (in server/API endpoints - translations not available)
// Keep as is, but document for future i18n solution
```

## Common Untranslated Areas

### Authentication Pages (`app/pages/auth/`)
- Login/Register form labels
- Social login button labels
- Password reset messages
- Verification messages

### Dashboard Pages (`app/pages/dashboard/`)
- Page titles and headers
- Setting page labels
- Onboarding messages
- Team management labels

### Components (`app/components/`)
- Sidebar navigation labels
- Modal titles and buttons
- Form field labels
- Empty state messages
- Loading messages

### API Responses (`server/api/`)
- Error status messages
- Validation messages
- Success responses

## Translation Key Naming Conventions

```
auth.login.title           - Login page title
auth.login.emailLabel      - Email field label
auth.login.submitButton    - Submit button text

common.save               - Generic save button
common.cancel             - Generic cancel button
common.delete             - Generic delete button
common.edit               - Generic edit button

messages.success          - Generic success message
messages.error            - Generic error message
messages.loading          - Generic loading message

errors.unauthorized       - Unauthorized error
errors.notFound          - Not found error
errors.validation        - Validation error

forms.required           - Required field message
forms.email              - Email field label
forms.password           - Password field label

navigation.dashboard     - Dashboard nav item
navigation.settings      - Settings nav item
navigation.profile       - Profile nav item
```

## Comprehensive Audit Script

Save this as `scripts/audit-translations.sh`:

```bash
#!/bin/bash

echo "=== Translation Audit Report ==="
echo ""

echo "1. Hardcoded Labels:"
grep -r 'label="[A-Z][^"]*"' app layers --include="*.vue" | wc -l
echo ""

echo "2. Hardcoded Placeholders:"
grep -r 'placeholder="[A-Z][^"]*"' app layers --include="*.vue" | wc -l
echo ""

echo "3. Hardcoded Headings:"
grep -r '<h[1-6][^>]*>[A-Z][^<]+</h[1-6]>' app layers --include="*.vue" | wc -l
echo ""

echo "4. Hardcoded Paragraphs:"
grep -r '<p[^>]*>[A-Z][^<]+</p>' app layers --include="*.vue" | wc -l
echo ""

echo "5. Hardcoded Toast Messages:"
grep -r "toast\.(add|show).*title:\s*['\"][A-Z]" app layers --include="*.{vue,ts}" | wc -l
echo ""

echo "6. Hardcoded Error Messages:"
grep -r "throw createError.*statusMessage:\s*['\"][A-Z]" . --include="*.{vue,ts}" | wc -l
echo ""

echo "7. Files with most untranslated strings:"
(
  grep -r 'label="[A-Z][^"]*"' app layers --include="*.vue" | cut -d: -f1
  grep -r '<h[1-6][^>]*>[A-Z][^<]+</h[1-6]>' app layers --include="*.vue" | cut -d: -f1
  grep -r '<p[^>]*>[A-Z][^<]+</p>' app layers --include="*.vue" | cut -d: -f1
) | sort | uniq -c | sort -rn | head -10
```

## Adding Missing Translations

### Method 1: Direct Locale File Updates (Recommended)

Add missing translations directly to the locale files in `layers/translations/i18n/locales/`:

1. **Add to English locale** (`en.json`):
```json
"accountSettings": {
  "general": {
    "personalInformation": "Personal Information",
    "privacyNotice": "Your personal information is not shared with anyone."
  }
}
```

2. **Add to French locale** (`fr.json`):
```json
"accountSettings": {
  "general": {
    "personalInformation": "Informations personnelles",
    "privacyNotice": "Vos informations personnelles ne sont partagées avec personne."
  }
}
```

3. **Add to Dutch locale** (`nl.json`):
```json
"accountSettings": {
  "general": {
    "personalInformation": "Persoonlijke informatie",
    "privacyNotice": "Uw persoonlijke informatie wordt met niemand gedeeld."
  }
}
```

4. **Import via Admin UI**:
   - Navigate to http://localhost:3000/dashboard/super-admin/translations
   - Click the "Import from Locale Files" button with merge option
   - This will sync locale file changes to the database

### Method 2: Bulk Import via JSON

When you have many translations to add at once, you can also create a JSON file:

```json
{
  "auth.login.title": {
    "en": "Sign in to your account",
    "fr": "Connectez-vous à votre compte",
    "nl": "Log in op uw account"
  },
  "auth.login.emailLabel": {
    "en": "Email",
    "fr": "E-mail",
    "nl": "E-mail"
  }
}
```

Then import via the Super Admin translations UI using the bulk import feature.

## Best Practices

1. **Always use translations for user-facing text**
   - UI labels, buttons, headings
   - Form labels and placeholders
   - Toast/notification messages
   - Error messages shown to users

2. **Use consistent key naming**
   - Group by feature: `auth.`, `dashboard.`, `settings.`
   - Use descriptive names: `auth.login.forgotPasswordLink`
   - Avoid generic keys without context

3. **Consider context in translations**
   - Same English text might need different translations based on context
   - Example: "Save" as button vs "Save" as noun

4. **Test translations**
   - Switch languages to verify all text changes
   - Check for text overflow in different languages
   - Ensure placeholders and dynamic content work

## Regular Maintenance

Run this audit regularly (e.g., before releases) to catch new untranslated strings:

1. Run the audit script
2. Review the results
3. Add missing translations
4. Update the code to use translation keys
5. Test in multiple languages