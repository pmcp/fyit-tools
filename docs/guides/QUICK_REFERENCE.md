# Quick Reference Card

## 🎯 Essential Commands

### Slash Commands
- `/brief [requirement]` - Structure vague tasks into clear plans
- `/test [feature]` - Generate comprehensive tests
- `/layer [domain]` - Create new domain layer
- `/think [hard]` - Deep analysis for complex problems
- `/workflow [task]` - Orchestrate complete feature development
- `/parallel` - Execute multiple tasks simultaneously
- `/refine` - Iterative code improvement
- `/review` - Code review checklist
- `/track [feature]` - Track decisions and context

### Agents (use @)
**Core:** `@ui-builder`, `@api-designer`, `@nuxt-architect`
**Domain:** `@domain-architect`, `@template-scout`
**Testing:** `@test-specialist`, `@test-fixer` (proactive)
**Quality:** `@code-smell-detector`, `@code-reviewer-proactive` (proactive)
**Workflow:** `@git-specialist`

## 🔧 Key Principles

1. **Tool Order**: Nuxt MCP → Context7 (never skip MCP!)
2. **VueUse First**: Always check VueUse composables before custom code
3. **One Domain = One Layer** (keep isolated)
4. **Always use pnpm** (never npm/yarn)
5. **Nuxt UI 4 only** (not v2/v3)
6. **Test with Playwright** for E2E

## 🛡️ Safety Features

- **Pre-edit validation**: Blocks sensitive files (.env, secrets)
- **Post-edit formatting**: Auto-formats and type-checks
- **Proactive agents**: Auto-review and test-fixing
- **Exit code 2**: Blocks dangerous operations in hooks

## 📁 Project Structure

```
your-project/
├── layers/
│   ├── core/        # Shared utilities
│   ├── [domain]/    # One per domain
├── app/             # Main application  
├── server/          # API routes
└── CLAUDE.md        # Config (you are here)
```

## 🚀 Common Workflows

### New Feature
1. `/brief` the requirement
2. Review the plan
3. Say "implement it"
4. `/test` to add tests

### New Component
```
@nuxt-ui-builder create a [component description]
```

### New API
```
@api-designer create [endpoint description] with NuxtHub
```

### New Domain
```
/layer create [domain-name] layer
```

## 💡 Testing Patterns

### Mock Auth in Tests
```typescript
vi.mock('~/composables/useAuth', () => ({
  useAuth: () => ({
    user: ref({ id: '1' }),
    isAuthenticated: ref(true)
  })
}))
```

### Playwright with Auth
```typescript
test.use({
  storageState: 'tests/.auth/user.json'
})
```

## 🔗 Quick Links

- Nuxt Docs: Use Nuxt MCP
- Nuxt UI: Context7 `/nuxt-ui/ui`
- NuxtHub: Context7 `/nuxthub/core`

---
*Keep this handy while working with Claude Code!*