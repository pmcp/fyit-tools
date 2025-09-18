# Agent Documentation Guide

## Overview
This guide explains how agents should save their documentation, reports, and briefings in the correct folder structure.

## Documentation Structure

All agent-generated documentation must be saved in the `docs/` folder with this structure:

```
docs/
├── briefings/           # Task briefings and initial analyses
│   └── [feature-name]-brief.md
├── reports/            # Analysis reports and findings
│   └── [analysis-type]-report-YYYYMMDD.md
├── guides/             # How-to guides and best practices
│   └── [topic]-guide.md
├── setup/              # Setup and configuration docs
│   └── [component]-setup.md
└── architecture/       # Architecture decisions and designs
    └── [domain]-architecture.md
```

## Document Types and Locations

| Document Type | Save Location | Example |
|--------------|---------------|---------|
| Task Briefings | `docs/briefings/` | `translation-implementation-brief.md` |
| Audit Reports | `docs/reports/` | `security-audit-report-20250118.md` |
| Technical Guides | `docs/guides/` | `translation-system-guide.md` |
| Architecture Docs | `docs/architecture/` | `payment-architecture.md` |
| Setup Instructions | `docs/setup/` | `playwright-setup.md` |

## File Naming Conventions

1. **Use kebab-case**: `feature-analysis-brief.md`
2. **Include dates for reports**: `translation-audit-report-20250118.md`
3. **Be descriptive**: `user-authentication-guide.md` not `guide.md`
4. **Use consistent prefixes**: Group related docs with common prefixes

## Implementation

### Updates Made

1. **CLAUDE.md** - Added "Documentation Organization" section with:
   - Complete folder structure
   - Agent documentation rules
   - File naming conventions
   - Added reminder #9 to key reminders

2. **Agent Template** - Created `.claude/agents/AGENT_TEMPLATE.md` with:
   - Built-in documentation output rules
   - Folder structure reference
   - File naming guidelines
   - Output format template

3. **Example Update** - Updated `translations-specialist.md` agent to include:
   - Documentation output rules section
   - Specific save locations for translation docs
   - Audit report save instructions

## For Agent Developers

When creating or updating agents:

1. **Include Documentation Section**: Add the "Documentation Output Rules" section from the agent template
2. **Specify Document Types**: List what types of documents your agent creates
3. **Provide Save Paths**: Give explicit paths for each document type
4. **Add Examples**: Show example file names for clarity

## Example Agent Documentation Section

```markdown
## Documentation Output Rules

### CRITICAL: Where to Save Documentation

When creating any documentation, reports, or briefings, you MUST save them in the correct location:

```
docs/
├── briefings/           # Task briefings
│   └── feature-implementation-brief.md
├── reports/            # Analysis reports
│   └── code-quality-report-YYYYMMDD.md
└── guides/             # Best practices
    └── coding-standards-guide.md
```

### Documentation Rules
1. **Analysis Reports** → Save to `docs/reports/[type]-report-YYYYMMDD.md`
2. **Implementation Briefings** → Save to `docs/briefings/[feature]-brief.md`
3. **Best Practice Guides** → Save to `docs/guides/[topic]-guide.md`
```

## Benefits

- **Consistency**: All documentation in predictable locations
- **Discoverability**: Easy to find related documents
- **Organization**: Clear separation by document type
- **Tracking**: Date-stamped reports for historical reference
- **Collaboration**: Agents and developers know where to look

## Next Steps

To ensure your agents follow these rules:

1. Update existing agents with documentation rules
2. Use the agent template for new agents
3. Check that agents save to correct folders
4. Review periodically for compliance

Remember: Good documentation organization makes the codebase more maintainable and helps track project evolution over time.