# Task Brief: Translation Dev Mode - Missing-Only MVP

## Problem Statement
The current translation dev mode implementation is over-engineered and not working properly. It uses complex Unicode markers, duplicate detection logic, and has configuration issues. We need a simplified MVP that focuses solely on detecting and fixing missing translations.

## Current Issues
1. Component path misconfiguration in `layers/translations/nuxt.config.ts`
2. CSS file not being imported properly
3. Complex Unicode marker system that's unreliable
4. Duplicate detection logic between DevModeToggle and plugin
5. Over-engineered for the actual use case

## Domain/Layer
- **Layer**: `translations`
- **Components**: `app/components/`
- **Composables**: `app/composables/`
- **No new layers needed**

## Phase 1: Missing-Only MVP

### Technical Requirements
- [ ] Component: Simplified `DevModeToggle.vue` with integrated CSS
- [ ] Component: Simple `AddTranslationModal.vue` for adding missing keys
- [ ] Composable: Simplified `useT.ts` without Unicode markers
- [ ] Detection: Only detect `[missing.key]` pattern
- [ ] No complex state tracking or DOM manipulation

### Implementation Steps

#### 1. Clean Up Configuration
- Remove unnecessary `components` config from `layers/translations/nuxt.config.ts`
- Components in `app/components` are auto-imported

#### 2. Consolidate and Simplify DevModeToggle
- Move all CSS from `translations-dev.css` into the component
- Remove complex DOM scanning for markers
- Focus only on detecting `[missing.key]` patterns
- Add simple modal for adding translations

#### 3. Simplify useT Composable
- Remove Unicode marker injection
- Keep simple `[key]` format for missing translations
- Remove complex detection logic

#### 4. Remove Redundant Code
- Delete `missing-translation-detector.client.ts` plugin
- Delete `DevTranslationWrapper.vue` component
- Delete `translations-dev.css` file

#### 5. Add Simple Translation Modal
- Basic form to add translation for a missing key
- Support for current locale only (MVP)
- Save to system translations

### Testing Plan
- **Manual Testing**: Use `test-auto-dev.vue` page
- **Verification**:
  - Missing translations show as `[key.name]` in red
  - Right-click on missing translation opens add modal
  - Adding translation updates the display
  - Dev mode toggle works correctly

### Definition of Done
- [ ] Dev mode toggle button appears in development only
- [ ] Missing translations display as `[key.name]`
- [ ] Missing translations are highlighted in red when dev mode is ON
- [ ] Right-click on missing translation shows context menu
- [ ] "Add Translation" option opens modal
- [ ] Can successfully add a translation through the modal
- [ ] Page refreshes to show new translation
- [ ] No console errors
- [ ] Clean, maintainable code under 200 lines total

## Phase 2: Future Enhancements (Not Now)
- Edit existing translations
- Show system vs team overrides
- Multi-language editing
- Keyboard shortcuts
- Import/export functionality

## Phase 3: Advanced Features (Much Later)
- Full translation tracking
- Inline editing
- Translation history
- Batch operations

## Success Metrics
- **Simplicity**: < 200 lines of code total
- **Performance**: No noticeable impact on page load
- **Reliability**: Works consistently without errors
- **User Experience**: Developers can quickly identify and fix missing translations

## Code Smell Avoidance
- ❌ No complex state management
- ❌ No memory-leaking Maps
- ❌ No global event listeners without cleanup
- ✅ Simple, focused functionality
- ✅ Clear separation of concerns
- ✅ KISS principle applied

## Architecture Decision
**Chosen Approach**: Missing-Only Detection
- Simple `[key]` pattern detection
- Minimal DOM interaction
- Context menu only for missing translations
- One modal for adding translations

**Rejected Approaches**:
- Full translation tracking system (over-engineered)
- Unicode markers (unreliable)
- Complex state management (unnecessary)

---

*Created: 2025-01-17*
*Status: Ready for Phase 1 Implementation*