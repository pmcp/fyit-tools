# Claude Code Setup Instructions

## 🎯 What This Is

This is your personalized Claude Code setup for Nuxt development with:
- **Nuxt UI 4** focus with NuxtHub deployment
- **Domain-Driven Design** using Nuxt layers
- **Functional programming** patterns
- **Solo developer** optimized workflow
- **Testing focus** with Playwright integration

## 📁 What's Included

### CLAUDE.md
Your main configuration file that tells Claude:
- How to work with your tech stack
- When to use Nuxt MCP vs Context7
- How to structure code with layers
- Testing patterns with authentication
- NuxtHub deployment specifics

### Slash Commands
Quick commands you can use in Claude Code:

- **/brief** - Helps structure vague requirements into clear tasks
- **/test** - Generates comprehensive tests with auth handling
- **/layer** - Creates new domain layers with proper structure
- **/think** - Deep analysis mode for complex problems
- **/workflow** - Orchestrates complete feature development
- **/parallel** - Executes multiple tasks simultaneously
- **/refine** - Iterative code improvement
- **/review** - Code review checklist
- **/track** - Track decisions and context

### Agents
Specialized assistants for specific tasks:

**Core Development:**
- **@ui-builder** - Creates all Nuxt UI 4 components with VueUse integration
- **@api-designer** - Designs type-safe APIs with NuxtHub integration
- **@nuxt-architect** - High-level Nuxt architecture decisions

**Domain & Quality:**
- **@domain-architect** - DDD expert, creates and manages domain layers
- **@template-scout** - Finds existing solutions in templates
- **@code-smell-detector** - Identifies code quality issues

**Testing & Workflow:**
- **@test-specialist** - Comprehensive testing and mocking expert
- **@test-fixer** - Auto-fixes failing tests (proactive)
- **@code-reviewer-proactive** - Auto-reviews after changes (proactive)

**Workflow:**
- **@git-specialist** - Git workflow automation

### Hooks (Safety Features)
Automated code quality and safety checks:

- **Pre-edit validation** - Blocks edits to sensitive files (.env, secrets)
- **Post-edit formatting** - Auto-formats code after changes
- **Custom hooks** - Add your own validation/automation
- **Exit code 2** - Use in hooks to block dangerous operations

Configured via `.claude/hooks-config.json` and scripts in `.claude/hooks/`

## 🚀 Installation

### Option 1: Quick Setup
```bash
# Make the script executable
chmod +x setup.sh

# Run setup for your project
./setup.sh
```

### Option 2: Manual Setup
```bash
# Copy CLAUDE.md to your project root
cp CLAUDE.md /path/to/your/project/

# Copy .claude folder to your project
cp -r .claude /path/to/your/project/
```

## 💡 How to Use

### 1. Starting a New Feature
```
You: /brief I need a user profile page where users can edit their details

Claude: [Provides structured task brief with domain, components, and testing plan]

You: Great, implement it

Claude: [Follows the brief to implement]
```

### 2. Creating Components
```
You: @nuxt-ui-builder create a dashboard card that shows user statistics

Claude: [Creates Nuxt UI 4 component with proper patterns]
```

### 3. Adding Tests
```
You: /test add tests for the user profile feature

Claude: [Generates Playwright E2E tests with auth mocking]
```

### 4. Creating New Domains
```
You: /layer create a billing domain for subscription management

Claude: [Creates complete layer structure with proper isolation]
```

## 🔧 Customization

### Adding Your Own Commands
Create a new file in `.claude/slash-commands/[command].md`:
```markdown
# /[command] - Description

Your instructions here...
```

### Adding Your Own Agents
Create a new file in `.claude/agents/[agent].md`:
```markdown
# Agent Name

You are a [role]...

## Responsibilities
...
```

### Modifying CLAUDE.md
Feel free to edit CLAUDE.md to:
- Add project-specific patterns
- Include your team's conventions
- Add commonly used libraries
- Update deployment instructions

## 🏗️ Project Structure Example

```
your-project/
├── CLAUDE.md                 # Your configuration
├── .claude/                  # Claude Code assets
│   ├── agents/              # Specialized agents
│   └── slash-commands/      # Quick commands
├── layers/                  # Domain layers
│   ├── core/               # Shared utilities
│   ├── auth/               # Authentication
│   └── user/               # User management
├── app/                     # Main application
├── server/                  # API routes
└── nuxt.config.ts          # Nuxt configuration
```

## 📊 Workflow Example

### Day-to-day Development

1. **Start with a brief**: `/brief [your requirement]`
2. **Review the plan**: Make sure it aligns with your vision
3. **Implement**: Let Claude build following the plan
4. **Test**: `/test` to generate tests
5. **Deploy**: Push to NuxtHub

### Creating a New Domain

1. **Design domain**: `/layer create [domain-name]`
2. **Build components**: `@nuxt-ui-builder` for UI
3. **Add API**: `@api-designer` for endpoints
4. **Test everything**: `/test` for comprehensive tests

## 🤔 Should You Use DAIC?

DAIC (Discussion → Alignment → Implementation → Completion) forces Claude to discuss before implementing. 

**Pros:**
- No surprise refactors
- Better understanding of your codebase
- Fewer mistakes
- You stay in control

**Cons:**
- Slightly slower for simple tasks
- Can feel restrictive for quick fixes

**Recommendation**: Try it for a week. Most developers don't go back.

To add DAIC, check out the Sessions system: https://github.com/cline/claude-code-sessions

## 🐛 Troubleshooting

### Claude not following patterns?
- Make sure CLAUDE.md is in your project root
- Check that Claude Code can see the .claude folder
- Try being more explicit: "Follow the patterns in CLAUDE.md"

### Agents not working?
- Agents need to be in `.claude/agents/` folder
- Use @ to mention them: `@agent-name`
- Make sure the .md file is properly formatted

### Commands not recognized?
- Commands need to be in `.claude/slash-commands/`
- Use / to trigger them: `/command`
- Check file permissions

## 📚 Best Practices

1. **Always check Nuxt MCP first** - It knows your project structure
2. **Use layers for isolation** - One domain = one layer
3. **Test as you go** - Don't leave testing for later
4. **Keep CLAUDE.md updated** - Add patterns as you establish them
5. **Use agents for specialized tasks** - They're focused and efficient

## 🚦 CI/CD Recommendation

While you don't have CI/CD now, consider adding:

1. **GitHub Actions** for automated testing
2. **Husky** for pre-commit hooks
3. **Automatic deployment** to NuxtHub on main branch

Simple `.github/workflows/test.yml`:
```yaml
name: Test
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:e2e
```

## 🎉 You're Ready!

Your Claude Code environment is set up for productive Nuxt development. Remember:
- Start with `/brief` for clarity
- Use agents for specialized tasks
- Keep domains in separate layers
- Test everything with Playwright
- Deploy confidently to NuxtHub

Happy coding! 🚀