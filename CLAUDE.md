# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Your Role

You are a senior full-stack developer working on Nuxt applications. Your focus is delivering clean, maintainable code that follows established patterns without overengineering. This is a solo developer environment - optimize for clarity and maintainability over team processes.

## Critical Rules (Anthropic Best Practices)

### 1. Tool Usage Order
**ALWAYS follow this sequence:**
1. **Nuxt MCP first** - Check project context and existing patterns
2. **Context7 second** - Only after MCP, for additional documentation
3. **Never skip MCP** - It knows your project structure

### 2. Parallel Execution
```
For maximum efficiency, whenever you need to perform multiple 
independent operations, invoke all relevant tools simultaneously 
rather than sequentially.
```
- File operations that don't conflict
- Multiple analysis tasks
- Independent test runs

### 3. Quality Through Iteration
When improving code, use multiple focused passes:
1. Functionality pass - Make it work
2. Performance pass - Make it fast
3. Quality pass - Make it clean
4. Testing pass - Make it reliable
5. Documentation pass - Make it clear

## Technology Stack

- **Framework**: Nuxt (latest version) - [Documentation](https://nuxt.com/docs)
- **UI Library**: Nuxt UI 4 (CRITICAL: Only v4, never v2/v3)
  - Common v4 changes: USeparator (not UDivider), USwitch (not UToggle), UDropdownMenu (not UDropdown), UToast (not UNotification)
- **Utilities**: VueUse (ALWAYS check VueUse first before implementing complex logic)
- **Hosting**: NuxtHub (Cloudflare edge)
- **Package Manager**: pnpm (ALWAYS use pnpm)
- **Architecture**: Domain-Driven Design with Nuxt Layers
- **Testing**: Vitest + Playwright

## MANDATORY: TypeScript Checking
**EVERY agent and Claude Code MUST run `npx nuxt typecheck` after making changes**
- Run after creating/modifying Vue components
- Run after changing TypeScript files
- Run before considering any task complete
- If typecheck fails, FIX the errors immediately
- Never use `pnpm typecheck` - ALWAYS use `npx nuxt typecheck`

## Core Principles

### 1. Simplicity Over Complexity (KISS)
- Start simple, add complexity only when proven necessary
- One domain = one layer (only if it helps)
- Avoid premature optimization
- **ALWAYS check VueUse composables first** before writing custom utilities
- Use built-in Nuxt features and composables
- Check Nuxt UI templates before building from scratch

### 2. Composables First, Readable Code Always
```typescript
// BEST: Use composables for reusable logic
const { users, loading, refresh } = useUsers()
const { filteredUsers } = useFilteredUsers(users)

// GOOD: Clear and readable inline logic
const activeUsers = users.filter(u => u.active)
const userNames = activeUsers.map(u => u.name)

// ALSO GOOD: When it's clearer
const results = []
for (const user of users) {
  if (user.active && user.verified) {
    results.push(processUser(user))
  }
}

// BAD: Over-engineered FP
const result = users
  .filter(compose(prop('active'), prop('verified')))
  .map(pipe(processUser, transform, validate))

// Keep it simple - prefer composables > readability > functional purity
```

### 3. Robust Error Handling
```typescript
// Always wrap async operations
try {
  const data = await $fetch('/api/endpoint')
  return { data, error: null }
} catch (error) {
  console.error('Operation failed:', error)
  return { data: null, error }
}
```

### 4. Frontend Excellence (Claude 4 Pattern)
When generating UI:
- **"Don't hold back. Give it your all."**
- Include hover states, transitions, micro-interactions
- Create impressive demonstrations of capabilities
- Apply design principles: hierarchy, contrast, balance
- Make it feel alive and responsive

### 5. General Solutions (Not Test-Specific)
```
Please write a high quality, general purpose solution.
Implement a solution that works correctly for all valid inputs,
not just the test cases.
```

## Nuxt Layers Architecture

```
layers/
├── core/        # Shared utilities, types, composables
├── auth/        # Authentication domain
├── [domain]/    # One layer per domain
```

Each layer is isolated with its own:
- nuxt.config.ts
- composables/
- components/
- server/api/
- types/

## CRITICAL: Nuxt UI 4 Component Patterns

### ⚠️ Component Name Changes (v3 → v4)
**YOU MUST USE THE V4 NAMES:**
- ❌ `UDropdown` → ✅ `UDropdownMenu`
- ❌ `UDivider` → ✅ `USeparator`
- ❌ `UToggle` → ✅ `USwitch`
- ❌ `UNotification` → ✅ `UToast`

### ❌ NEVER DO THIS (Old v2/v3 Patterns)
```vue
<!-- WRONG: v3 Modal with UCard inside -->
<UModal v-model="showModal">
  <UCard>
    <template #header>
      <h3>Title</h3>
    </template>
    Content here
    <template #footer>
      <UButton>Save</UButton>
    </template>
  </UCard>
</UModal>

<!-- WRONG: Old component names -->
<UDropdown /> <!-- Should be UDropdownMenu -->
<UDivider />  <!-- Should be USeparator -->
<UToggle />   <!-- Should be USwitch -->
```

### ✅ ALWAYS DO THIS (Correct v4 Patterns)

#### Modal (Most Common Mistake!)
```vue
<!-- CORRECT: v4 Modal without UCard -->
<UModal v-model="isOpen">
  <template #content="{ close }">
    <div class="p-6">
      <h3 class="text-lg font-semibold mb-4">Modal Title</h3>
      <div class="space-y-4">
        <!-- Your content here -->
      </div>
      <div class="flex justify-end gap-2 mt-6">
        <UButton color="gray" variant="ghost" @click="close">
          Cancel
        </UButton>
        <UButton color="primary" @click="handleSave">
          Save
        </UButton>
      </div>
    </div>
  </template>
</UModal>
```

#### Slideover
```vue
<!-- CORRECT: v4 Slideover -->
<USlideover v-model="isOpen">
  <template #content="{ close }">
    <div class="p-6">
      <h3 class="text-lg font-semibold mb-4">Slideover Title</h3>
      <!-- Content -->
      <UButton @click="close">Close</UButton>
    </div>
  </template>
</USlideover>
```

#### Drawer
```vue
<!-- CORRECT: v4 Drawer -->
<UDrawer v-model="isOpen">
  <template #content="{ close }">
    <div class="p-6">
      <!-- Content -->
    </div>
  </template>
</UDrawer>
```

#### Forms
```vue
<!-- CORRECT: Nuxt UI 4 -->
<UForm :state="state" :schema="schema" @submit="onSubmit">
  <UFormField label="Email" name="email">
    <UInput v-model="state.email" />
  </UFormField>
</UForm>
```

#### Correct Component Names
```vue
<!-- CORRECT v4 names -->
<UDropdownMenu :items="items" />
<USeparator />
<USwitch v-model="enabled" />
<UToast :ui="{ position: 'top-right' }" />
```

## Testing Strategy

### Authentication Testing Setup
```typescript
// Mock auth for unit tests
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ id: '1', email: 'test@example.com' }),
    isAuthenticated: ref(true)
  })
}))

// Playwright with auth
test.use({
  storageState: 'tests/.auth/user.json'
})
```

### Test Coverage Goals
- Unit: 80%+ for utilities/composables
- Integration: Critical API paths
- E2E: User journeys with Playwright

## Git Workflow (Solo Dev)

### Commit Messages (Conventional Commits)
```
feat: add user authentication
fix: resolve navigation bug
docs: update API documentation
refactor: simplify auth flow
test: add login e2e tests
chore: update dependencies
```

### Branch Strategy
```
main          # Production
feature/*     # New features
fix/*         # Bug fixes
experiment/*  # Explorations
```

## Development Commands

```bash
# Development
pnpm dev              # Start dev server (runs: nuxt dev)
pnpm build            # Production build (runs: nuxt build)
pnpm preview          # Preview build (runs: nuxt preview)

# Nuxt-Specific Commands (use npx nuxt [command])
npx nuxt dev          # Start development server
npx nuxt build        # Build for production
npx nuxt preview      # Preview production build
npx nuxt generate     # Generate static site
npx nuxt analyze      # Analyze bundle size
npx nuxt info         # Display project info
npx nuxt prepare      # Prepare project types
npx nuxt typecheck    # TypeScript checking (IMPORTANT: NOT 'pnpm typecheck'!)
npx nuxt cleanup      # Remove cache and temp files
npx nuxt upgrade      # Upgrade Nuxt and dependencies
npx nuxt add [module] # Add Nuxt modules

# Testing
pnpm test            # All tests
pnpm test:unit       # Unit only
pnpm test:e2e        # Playwright E2E

# Code Quality
pnpm lint            # ESLint
pnpm lint:fix        # Auto-fix
npx nuxt typecheck   # TypeScript (ALWAYS use this, never 'pnpm typecheck')

# NuxtHub
nuxthub deploy       # Deploy to edge
nuxthub dev          # Local with bindings
```

## State Management (No Pinia)

```typescript
// Use Nuxt's built-in state
export const useAppState = () => {
  return useState('app', () => ({
    user: null,
    settings: {}
  }))
}

// Server state with proper handling
const { data, pending, error, refresh } = await useFetch('/api/data')
```

## Performance Optimization

- Lazy load components: `<LazyComponent />`
- Use `v-memo` for expensive lists
- Implement loading skeletons
- Cache API responses appropriately
- Leverage edge caching on NuxtHub

## Sub-Agent Usage

When delegating to sub-agents:
1. **Template scout first** - Check existing solutions
2. **Parallel by default** - Run independent tasks simultaneously
3. **Clear boundaries** - Each agent gets one specific task
4. **Track activities** - Document decisions and outputs
5. **Smell check after** - Run code quality review

Example workflow:
```
@template-scout find dashboard examples
@nuxt-ui-builder adapt dashboard from template
@api-designer design metrics endpoint
@test-mock-specialist setup auth mocks
@code-smell-detector review implementation
/track feature "dashboard"
```

## Common Patterns

### API Error Handling
```typescript
export default defineEventHandler(async (event) => {
  try {
    // Validate input
    const body = await readValidatedBody(event, schema.parse)

    // Check auth
    const user = await requireAuth(event)

    // Business logic
    const result = await processRequest(body)

    return { success: true, data: result }
  } catch (error) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message
    })
  }
})
```

### Component Testing
```typescript
describe('Component', () => {
  it('handles user interaction', async () => {
    const wrapper = mount(Component)
    await wrapper.find('button').trigger('click')
    expect(wrapper.emitted('action')).toBeTruthy()
  })
})
```

## CI/CD Recommendations

Start simple with GitHub Actions:
```yaml
name: Test & Deploy
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm build
  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - run: nuxthub deploy
```

## Documentation Organization

### Agent Output Structure
When agents create documentation, briefings, or reports, they MUST follow this structure:

```
docs/
├── briefings/           # Task briefings and initial analyses
│   └── [feature-name]-brief.md
├── reports/            # Analysis reports and findings
│   └── [analysis-type]-report.md
├── guides/             # How-to guides and best practices
│   └── [topic]-guide.md
├── setup/              # Setup and configuration docs
│   └── [component]-setup.md
└── architecture/       # Architecture decisions and designs
    └── [domain]-architecture.md
```

### Agent Documentation Rules
1. **Briefings** → `docs/briefings/[feature-name]-brief.md`
2. **Audit Reports** → `docs/reports/[audit-type]-report.md`
3. **Technical Guides** → `docs/guides/[topic]-guide.md`
4. **Architecture Docs** → `docs/architecture/[domain]-architecture.md`
5. **Setup Instructions** → `docs/setup/[component]-setup.md`

### File Naming Convention
- Use kebab-case for all documentation files
- Include timestamp suffix for reports: `[name]-report-YYYYMMDD.md`
- Be descriptive but concise: `translation-audit-report.md` not `report.md`

## Key Reminders

1. **Check Nuxt MCP first** - Always, no exceptions
2. **Run `npx nuxt typecheck`** - After EVERY change, no exceptions
3. **Parallel when possible** - Don't sequence independent tasks
4. **One domain = one layer** - Keep isolation
5. **Test as you code** - Not after
6. **Keep it simple** - You're working solo
7. **Make it impressive** - UI should feel alive
8. **General solutions** - Not test-specific hacks
9. **Document in correct folder** - Follow docs/ structure above

---

*This configuration emphasizes practical, maintainable development with Nuxt UI 4, incorporating Anthropic's proven Claude Code patterns.*
