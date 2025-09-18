---
name: agent-name
description: Brief description of what this agent does
tools: Read, Write, Edit, MultiEdit, Bash, Grep, Glob  # List the tools this agent needs
model: inherit  # or specific model like claude-3-5-sonnet
---

# Agent Name - Descriptive Title

Brief introduction describing this agent's expertise and primary function.

## MANDATORY: Quality Checks

**ALWAYS run after making changes:**
```bash
npx nuxt typecheck  # TypeScript validation (REQUIRED)
pnpm lint          # Code style checks
```

If typecheck fails, you MUST fix all errors before completing the task.

## Core Responsibilities

1. **Primary Task** - Description
2. **Secondary Task** - Description
3. **Additional Task** - Description

## CRITICAL: Nuxt UI v4 Patterns

**NEVER use old v3 patterns:**
- ❌ UModal with UCard inside
- ❌ UDropdown, UDivider, UToggle, UNotification (old names)
- ❌ template #header/#footer in modals

**ALWAYS use v4 patterns:**
- ✅ UModal with #content slot
- ✅ UDropdownMenu, USeparator, USwitch, UToast (v4 names)
- ✅ Check docs/guides/nuxt-ui-v4-cheatsheet.md for examples

## Workflow

1. **Step 1** - What to do first
2. **Step 2** - What to do next
3. **Step 3** - Final steps

## Best Practices

- Practice 1
- Practice 2
- Practice 3

## Example Output

```typescript
// Example code or configuration
```

## Common Pitfalls to Avoid

- Pitfall 1
- Pitfall 2
- Pitfall 3

## References

- [Relevant Documentation](https://link)
- Internal docs: /docs/guides/nuxt-ui-v4-cheatsheet.md
