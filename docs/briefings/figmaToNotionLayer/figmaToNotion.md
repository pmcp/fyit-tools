# FigJam to Notion Sync Service - Development Brief

## Project Overview
Build a Nuxt-based web application that automatically syncs FigJam comments containing mentions (@username) to a Notion database as actionable tasks. The system processes email notifications from Figma, extracts comment threads, generates AI summaries, creates Notion tasks, and posts confirmations back to FigJam.

## Core Functionality Requirements

### 1. Email Processing Pipeline
- **Webhook endpoint** at `/api/webhook/figma` to receive email notifications
- Parse HTML emails from Figma to extract:
  - Comment text (focusing on mentions after "@Maarten" or configurable mention)
  - File name from gray text (color:#808080)
  - Tracking URL from click.figma.com links
  - Handle multiple matches by taking the most recent (opacity:1 in HTML)
- Store processed email IDs to prevent duplicates
- Queue mechanism for handling bursts of notifications

### 2. Figma Integration
- Authenticate using Figma API token
- Fetch recent comments from specified file (default: last 10)
- Match email comment with Figma comment by:
  - Text content match
  - User handle match
  - Recency (within 15 minutes)
- Retrieve full comment threads:
  - If comment has parent_id, get parent and all siblings
  - If comment is parent, get all replies
- Post confirmation messages back to thread after Notion task creation

### 3. Thread Processing
- Build complete thread context from parent and replies
- Sort comments chronologically
- Format thread as readable text:
  - Format: `HH:mm - Username: Comment text`
  - Separator: " - " between comments
- Handle nested conversations appropriately

### 4. AI Summary Generation
- Integrate with Claude API (claude-3-haiku model)
- Generate concise task summaries from thread context
- Extract:
  - Task title
  - Key action items
  - Context from discussion
- Handle rate limiting and API errors gracefully

### 5. Notion Task Creation
- Create tasks in specified database
- Map fields:
  - Title: Comment text or AI-generated title
  - Summary: AI-generated summary
  - Figma File: Source file name
  - Figma Thread: Link to original discussion
- Return Notion page URL for confirmation message

### 6. Configuration Management
- Environment variables for all tokens and IDs
- User-configurable settings:
  - Mention patterns to track
  - Figma file keys to monitor
  - Notion database mapping
  - AI summary preferences
- Settings persistence using Nuxt storage layer

### 7. Monitoring & Analytics
- Dashboard showing:
  - Recent sync activities
  - Success/failure rates
  - Processing times
  - Error logs
- Manual sync trigger for specific files/comments
- Bulk reprocessing capability

## Technical Implementation Details

### Data Flow
1. Figma sends email notification → Email service webhook
2. Webhook POST to `/api/webhook/figma` with HTML content
3. Parse email → Extract comment details
4. Query Figma API for matching comment
5. Build full thread context
6. Generate AI summary
7. Create Notion task
8. Post confirmation to Figma
9. Log activity and metrics

### Storage Requirements
- **KV Store** for:
  - Processed email IDs
  - User settings
  - Figma file key mappings
- **Database** for:
  - Sync history logs
  - Error tracking
  - Performance metrics

### API Endpoints
```typescript
POST /api/webhook/figma - Receive email notifications
GET  /api/sync/history - Get recent sync activities
POST /api/sync/manual - Trigger manual sync
GET  /api/sync/stats - Get statistics
POST /api/settings - Update configuration
GET  /api/settings - Get current configuration
POST /api/sync/retry/{id} - Retry failed sync
