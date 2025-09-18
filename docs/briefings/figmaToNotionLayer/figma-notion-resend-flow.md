# FigJam to Notion Sync - Resend Email Integration Briefing

## Overview

This briefing details the specific implementation of the FigJam to Notion sync service using **Resend** as the email capture mechanism. Since you already have Resend configured (`RESEND_API_TOKEN` in env.ts), we can leverage their email forwarding and webhook capabilities for a seamless integration.

## Resend Email Capture Architecture

### How Resend Email Forwarding Works

1. **Dedicated Email Address**: Create `figma@yourdomain.com`
2. **Figma Configuration**: Set Figma to send notifications to this email
3. **Resend Receives**: Email arrives at Resend's servers
4. **Webhook Trigger**: Resend posts to your webhook endpoint
5. **Processing Pipeline**: Your app processes and syncs to Notion

### Complete Flow Diagram

```mermaid
graph LR
    A[FigJam Comment] -->|@mention| B[Figma]
    B -->|Email Notification| C[figma@yourdomain.com]
    C -->|MX Records| D[Resend Servers]
    D -->|Webhook POST| E[/api/webhook/resend/figma]
    E -->|Parse & Queue| F[NuxtHub KV]
    F -->|Process| G[Figma API]
    G -->|Build Thread| H[Claude AI]
    H -->|Summary| I[Notion API]
    I -->|Confirm| J[Figma Comment]
```

## Resend Configuration

### Step 1: Domain Configuration

```bash
# Add to your DNS records (yourdomain.com)
Type: MX
Name: @ (or subdomain like mail)
Value: feedback-smtp.us-east-1.amazonses.com
Priority: 10

# Resend domain verification
Type: TXT
Name: _amazonses
Value: [provided by Resend]
```

### Step 2: Email Address Setup

In Resend Dashboard:
1. Navigate to **Email Addresses** → **Add Email**
2. Create: `figma@yourdomain.com`
3. Set forwarding destination: Webhook URL
4. Configure webhook endpoint: `https://yourapp.com/api/webhook/resend/figma`

### Step 3: Webhook Configuration

```typescript
// Add to env.ts
export const env = createEnv({
  server: {
    // ... existing
    RESEND_API_TOKEN: z.string().min(1), // Already exists
    RESEND_WEBHOOK_SECRET: z.string().min(1), // Add this
    FIGMA_SYNC_EMAIL: z.string().email().default('figma@yourdomain.com'), // Add this
  }
})
```

## Implementation Details

### 1. Webhook Endpoint for Resend

```typescript
// server/api/webhook/resend/figma.post.ts
import crypto from 'crypto'
import { parseF igmaEmailFromResend } from '~/server/utils/figmaEmailParser'

export default defineEventHandler(async (event) => {
  // 1. Verify webhook signature
  const signature = getHeader(event, 'resend-signature')
  const body = await readRawBody(event)

  if (!verifyResendSignature(signature, body)) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid webhook signature'
    })
  }

  // 2. Parse Resend webhook payload
  const payload = JSON.parse(body)

  // 3. Check event type
  if (payload.type !== 'email.received') {
    return { status: 'ignored', reason: 'Not an email received event' }
  }

  // 4. Extract email data
  const email = payload.data

  // 5. Verify it's from Figma
  if (!email.from.email.includes('@figma.com')) {
    return { status: 'ignored', reason: 'Not from Figma' }
  }

  // 6. Check for duplicates using Message-ID
  const kv = hubKV()
  const messageId = email.headers['message-id']

  const processed = await kv.get(`processed:email:${messageId}`)
  if (processed) {
    return { status: 'duplicate', messageId }
  }

  // 7. Parse Figma-specific content
  const figmaData = await parseF igmaEmailFromResend(email)

  // 8. Queue for async processing
  const jobId = `figma-sync:${Date.now()}:${messageId}`
  await kv.set(`queue:${jobId}`, {
    email,
    figmaData,
    teamId: await determineTeamId(email.to),
    timestamp: Date.now()
  }, {
    expirationTtl: 3600 // 1 hour TTL
  })

  // 9. Mark as processed
  await kv.set(`processed:email:${messageId}`, true, {
    expirationTtl: 86400 // 24 hours
  })

  // 10. Trigger async processing
  await triggerProcessing(jobId)

  return {
    status: 'queued',
    jobId,
    messageId
  }
})

// Signature verification
function verifyResendSignature(signature: string, body: string): boolean {
  const secret = env.RESEND_WEBHOOK_SECRET
  const hmac = crypto.createHmac('sha256', secret)
  hmac.update(body, 'utf8')
  const digest = hmac.digest('hex')

  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  )
}

// Determine which team this email belongs to
async function determineTeamId(toEmail: string): Promise<string | null> {
  // Option 1: Use email subdomain (team1.figma@yourdomain.com)
  const match = toEmail.match(/^([^.]+)\.figma@/)
  if (match) {
    const teamSlug = match[1]
    const team = await getTeamBySlug(teamSlug)
    return team?.id
  }

  // Option 2: Use default team
  return env.DEFAULT_TEAM_ID

  // Option 3: Look up by mention pattern in email content
}
```

### 2. Resend Email Parser

```typescript
// server/utils/figmaEmailParser.ts
import * as cheerio from 'cheerio'

interface ResendEmailPayload {
  id: string
  from: {
    email: string
    name?: string
  }
  to: string[]
  subject: string
  html?: string
  text?: string
  headers: Record<string, string>
  attachments?: Array<{
    filename: string
    content: string
    contentType: string
  }>
}

export interface ParsedFigmaData {
  commentText: string
  fileName: string
  fileKey: string
  userHandle: string
  trackingUrl: string
  mentionedUser: string
  timestamp: Date
}

export async function parseFigmaEmailFromResend(
  email: ResendEmailPayload
): Promise<ParsedFigmaData> {
  const $ = cheerio.load(email.html || '')

  // Extract Figma file key from tracking URL
  const trackingLink = $('a[href*="click.figma.com"]').first()
  const trackingUrl = trackingLink.attr('href') || ''
  const fileKeyMatch = trackingUrl.match(/file\/([a-zA-Z0-9]+)/)
  const fileKey = fileKeyMatch ? fileKeyMatch[1] : ''

  // Find comment text (usually after mention)
  const mentionPattern = /@(\w+)/g
  let commentText = ''
  let mentionedUser = ''

  $('td').each((_, element) => {
    const text = $(element).text()
    const mentions = text.match(mentionPattern)
    if (mentions && mentions.length > 0) {
      // Extract mentioned user
      mentionedUser = mentions[0].replace('@', '')

      // Get text after mention
      const afterMention = text.split(mentions[0])[1]
      if (afterMention && afterMention.trim()) {
        commentText = afterMention.trim()
      }
    }
  })

  // Extract file name (usually in gray text)
  const fileName = $('span[style*="color:#808080"]').first().text().trim()

  // Extract user who made the comment
  const userHandle = email.from.name || email.from.email.split('@')[0]

  return {
    commentText,
    fileName,
    fileKey,
    userHandle,
    trackingUrl,
    mentionedUser,
    timestamp: new Date()
  }
}
```

### 3. Async Processing Task

```typescript
// server/api/internal/process-figma-sync.post.ts
export default defineEventHandler(async (event) => {
  const { jobId } = await readBody(event)

  // Retrieve job from KV
  const kv = hubKV()
  const job = await kv.get(`queue:${jobId}`)

  if (!job) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Job not found'
    })
  }

  try {
    // 1. Store job in database
    const syncJob = await createSyncJob({
      id: jobId,
      teamId: job.teamId,
      emailData: job.email,
      figmaData: job.figmaData,
      status: 'processing'
    })

    // 2. Fetch Figma comments
    const figmaService = new FigmaService(env.FIGMA_API_TOKEN)
    const comments = await figmaService.getRecentComments(
      job.figmaData.fileKey,
      job.figmaData.timestamp
    )

    // 3. Match email to Figma comment
    const matchedComment = findMatchingComment(
      comments,
      job.figmaData
    )

    if (!matchedComment) {
      throw new Error('Could not match email to Figma comment')
    }

    // 4. Build thread context
    const thread = await figmaService.buildThread(
      job.figmaData.fileKey,
      matchedComment.id
    )

    // 5. Generate AI summary
    const aiService = new AIService(env.ANTHROPIC_API_KEY)
    const summary = await aiService.generateTaskSummary(thread)

    // 6. Create Notion task
    const notionService = new NotionService(env.NOTION_API_KEY)
    const notionTask = await notionService.createTask({
      title: summary.title || job.figmaData.commentText.slice(0, 60),
      description: summary.description,
      figmaFile: job.figmaData.fileName,
      figmaUrl: job.figmaData.trackingUrl,
      actionItems: summary.actionItems,
      priority: summary.priority,
      mentionedUser: job.figmaData.mentionedUser
    })

    // 7. Post confirmation to Figma
    await figmaService.postComment(
      job.figmaData.fileKey,
      matchedComment.id,
      `✅ Task created in Notion: ${notionTask.url}`
    )

    // 8. Update job status
    await updateSyncJob(syncJob.id, {
      status: 'completed',
      notionTaskId: notionTask.id,
      notionTaskUrl: notionTask.url,
      completedAt: new Date()
    })

    // 9. Clean up KV
    await kv.delete(`queue:${jobId}`)

    return {
      status: 'success',
      notionTask: notionTask.url
    }

  } catch (error) {
    // Handle errors
    await updateSyncJob(syncJob.id, {
      status: 'failed',
      error: error.message
    })

    throw error
  }
})
```

### 4. Team-Specific Email Addresses

To support multiple teams, use email aliases:

```typescript
// Configuration for team-specific emails
interface TeamEmailConfig {
  teamId: string
  emailAddress: string // team1.figma@yourdomain.com
  mentions: string[]   // ['@Maarten', '@John']
  notionDatabaseId: string
}

// server/utils/teamEmailRouter.ts
export async function getTeamConfigFromEmail(
  toEmail: string
): Promise<TeamEmailConfig | null> {
  const kv = hubKV()

  // Extract team identifier from email
  // Format: teamslug.figma@yourdomain.com
  const match = toEmail.match(/^([^.]+)\.figma@/)
  if (!match) return null

  const teamSlug = match[1]
  const config = await kv.get(`team:email:${teamSlug}`)

  return config
}
```

### 5. Resend API Integration (for sending)

Since you're already using Resend, you can also use it to send confirmation emails:

```typescript
// server/services/resend.ts
import { Resend } from 'resend'

export class ResendService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(env.RESEND_API_TOKEN)
  }

  async sendTaskCreatedEmail(to: string, task: NotionTask) {
    await this.resend.emails.send({
      from: env.FROM_EMAIL,
      to,
      subject: `Notion Task Created: ${task.title}`,
      html: `
        <h2>Task Created Successfully</h2>
        <p>Your FigJam comment has been converted to a Notion task.</p>
        <p><strong>Title:</strong> ${task.title}</p>
        <p><strong>Priority:</strong> ${task.priority}</p>
        <p><a href="${task.url}">View in Notion</a></p>
      `
    })
  }
}
```

## Database Schema for Resend Integration

```typescript
// server/database/schema/figmaSync.ts
export const emailWebhooks = sqliteTable('email_webhooks', {
  id: text('id').primaryKey().$default(() => nanoid()),
  provider: text('provider').notNull(), // 'resend'
  messageId: text('message_id').notNull().unique(),
  rawPayload: text('raw_payload', { mode: 'json' }).notNull(),
  processedAt: integer('processed_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
})

export const teamEmailConfigs = sqliteTable('team_email_configs', {
  id: text('id').primaryKey().$default(() => nanoid()),
  teamId: text('team_id').notNull().references(() => teams.id),
  emailAddress: text('email_address').notNull().unique(),
  emailSlug: text('email_slug').notNull(), // 'team1' from team1.figma@
  mentions: text('mentions', { mode: 'json' }), // ['@Maarten']
  active: integer('active', { mode: 'boolean' }).default(true),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .$default(() => new Date())
})
```

## Configuration UI

```vue
<!-- app/pages/dashboard/[team]/integrations/figma-resend.vue -->
<template>
  <AppContainer title="Figma Email Integration">
    <UCard>
      <template #header>
        <h3>Email Configuration</h3>
      </template>

      <div class="space-y-4">
        <!-- Email Address Display -->
        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded">
          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Your team's Figma notification email:
          </p>
          <div class="flex items-center gap-2">
            <code class="text-lg font-mono">
              {{ teamSlug }}.figma@{{ domain }}
            </code>
            <UButton
              icon="i-heroicons-clipboard"
              variant="ghost"
              size="xs"
              @click="copyEmail"
            />
          </div>
        </div>

        <!-- Instructions -->
        <UAlert
          icon="i-heroicons-information-circle"
          title="Setup Instructions"
          description="Add this email address to your Figma team notifications settings"
        />

        <!-- Mention Patterns -->
        <UFormField label="Track Mentions" name="mentions">
          <div class="space-y-2">
            <div
              v-for="(mention, idx) in mentions"
              :key="idx"
              class="flex gap-2"
            >
              <UInput
                v-model="mentions[idx]"
                placeholder="@username"
                pattern="@\w+"
              />
              <UButton
                icon="i-heroicons-trash"
                variant="ghost"
                color="red"
                @click="removeMention(idx)"
              />
            </div>
            <UButton
              icon="i-heroicons-plus"
              variant="ghost"
              size="sm"
              @click="addMention"
            >
              Add Mention Pattern
            </UButton>
          </div>
        </UFormField>

        <!-- Notion Configuration -->
        <UFormField label="Notion Database ID" name="notionDatabaseId">
          <UInput
            v-model="notionDatabaseId"
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
          />
        </UFormField>

        <!-- Test Connection -->
        <div class="flex gap-2">
          <UButton
            @click="testEmailConnection"
            :loading="testingEmail"
            variant="outline"
          >
            Test Email Reception
          </UButton>
          <UButton
            @click="testNotionConnection"
            :loading="testingNotion"
            variant="outline"
          >
            Test Notion Connection
          </UButton>
        </div>

        <UButton @click="saveConfiguration" color="primary">
          Save Configuration
        </UButton>
      </div>
    </UCard>

    <!-- Recent Emails -->
    <UCard class="mt-6">
      <template #header>
        <div class="flex justify-between items-center">
          <h3>Recent Emails</h3>
          <UButton
            icon="i-heroicons-arrow-path"
            variant="ghost"
            size="sm"
            @click="refreshEmails"
          />
        </div>
      </template>

      <UTable
        :columns="emailColumns"
        :rows="recentEmails"
        :loading="loadingEmails"
      >
        <template #status-data="{ row }">
          <UBadge :color="getStatusColor(row.status)">
            {{ row.status }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UButton
            size="xs"
            variant="ghost"
            @click="viewEmailDetails(row)"
          >
            View Details
          </UButton>
        </template>
      </UTable>
    </UCard>
  </AppContainer>
</template>

<script setup lang="ts">
const teamSlug = computed(() => route.params.team)
const domain = 'yourdomain.com'

// Test email connection
async function testEmailConnection() {
  testingEmail.value = true
  try {
    // Send test email to the configured address
    await $fetch('/api/teams/${teamId}/integrations/figma/test-email', {
      method: 'POST'
    })

    // Wait for webhook
    const result = await pollForTestEmail()

    if (result.success) {
      toast.success('Email reception working!')
    } else {
      toast.error('Email not received within 30 seconds')
    }
  } finally {
    testingEmail.value = false
  }
}
</script>
```

## Testing the Resend Flow

### 1. Manual Test Script

```typescript
// scripts/test-resend-figma.ts
import { Resend } from 'resend'

async function testResendWebhook() {
  const resend = new Resend(process.env.RESEND_API_TOKEN)

  // Send test email that mimics Figma
  await resend.emails.send({
    from: 'test@figma.com', // Will need to be verified domain
    to: 'team1.figma@yourdomain.com',
    subject: 'Someone mentioned you in a comment',
    html: `
      <div>
        <p>@Maarten Please review the new button design</p>
        <a href="https://click.figma.com/file/abc123">View in Figma</a>
      </div>
    `
  })

  console.log('Test email sent, check webhook logs')
}
```

### 2. Webhook Testing

```typescript
// test/webhook-resend.test.ts
describe('Resend Webhook', () => {
  it('processes Figma emails correctly', async () => {
    const payload = {
      type: 'email.received',
      data: {
        id: 'msg_123',
        from: { email: 'notifications@figma.com' },
        to: ['team1.figma@yourdomain.com'],
        subject: 'New comment',
        html: '<p>@Maarten Check this out</p>',
        headers: { 'message-id': 'test-123' }
      }
    }

    const response = await $fetch('/api/webhook/resend/figma', {
      method: 'POST',
      body: payload,
      headers: {
        'resend-signature': generateTestSignature(payload)
      }
    })

    expect(response.status).toBe('queued')
  })
})
```

## Monitoring & Debugging

### 1. Webhook Logs

```typescript
// server/api/admin/webhook-logs.get.ts
export default defineEventHandler(async (event) => {
  const logs = await db.select()
    .from(emailWebhooks)
    .orderBy(desc(emailWebhooks.createdAt))
    .limit(100)

  return logs.map(log => ({
    ...log,
    payload: JSON.parse(log.rawPayload)
  }))
})
```

### 2. Email Processing Dashboard

```vue
<!-- app/pages/dashboard/[team]/integrations/figma-debug.vue -->
<template>
  <div class="space-y-4">
    <!-- Webhook Activity -->
    <UCard>
      <template #header>Webhook Activity</template>
      <div class="space-y-2">
        <div v-for="log in webhookLogs" :key="log.id">
          <div class="flex justify-between">
            <span>{{ log.messageId }}</span>
            <span>{{ formatDate(log.createdAt) }}</span>
          </div>
        </div>
      </div>
    </UCard>

    <!-- Processing Queue -->
    <UCard>
      <template #header>Processing Queue</template>
      <div v-if="queuedJobs.length">
        <div v-for="job in queuedJobs" :key="job.id">
          {{ job.id }} - {{ job.status }}
        </div>
      </div>
      <p v-else class="text-gray-500">No jobs in queue</p>
    </UCard>
  </div>
</template>
```

## Production Deployment Checklist

### 1. DNS Configuration
- [ ] Add MX records for Resend
- [ ] Verify domain in Resend dashboard
- [ ] Configure SPF/DKIM records

### 2. Environment Variables
```env
# Add to .env
RESEND_API_TOKEN=re_xxxxx          # Already have
RESEND_WEBHOOK_SECRET=whsec_xxxxx  # Generate in Resend dashboard
FIGMA_API_TOKEN=figd_xxxxx
NOTION_API_KEY=secret_xxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxx
```

### 3. Resend Dashboard
- [ ] Create email address: `figma@yourdomain.com`
- [ ] Configure webhook URL: `https://yourapp.com/api/webhook/resend/figma`
- [ ] Set webhook secret
- [ ] Test webhook delivery

### 4. Figma Configuration
- [ ] Add notification email to Figma team settings
- [ ] Test mention notifications
- [ ] Verify email delivery

### 5. Monitoring
- [ ] Set up webhook failure alerts
- [ ] Monitor processing queue
- [ ] Track success rates

## Cost Analysis with Resend

### Resend Pricing
- **Free Tier**: 100 emails/day, 1 domain
- **Pro**: $20/month, 10,000 emails/month
- **Scale**: Custom pricing

### Estimated Usage
- Average mentions per day: 20-50
- Email receives: Free (webhook delivery)
- Email sends (confirmations): 20-50/day
- **Total**: Well within Pro tier

### Comparison
- **Resend**: $20/month (includes sending)
- **SendGrid**: $20-50/month
- **Custom IMAP**: Server costs + complexity

## Advantages of Resend Approach

1. **Simplicity**: No need to manage email servers
2. **Reliability**: Resend handles email infrastructure
3. **Integration**: Already using Resend for sending
4. **Cost-effective**: Single service for send/receive
5. **Webhook-based**: Real-time, no polling required
6. **Scalable**: Handles growth automatically

## Timeline

### Week 1: Core Implementation
- Day 1: Resend webhook endpoint
- Day 2: Email parser for Figma format
- Day 3: Queue processing system
- Day 4: Figma API integration
- Day 5: Testing & debugging

### Week 2: Full Integration
- Day 6-7: Notion API & AI summaries
- Day 8-9: Dashboard UI
- Day 10: End-to-end testing

## Conclusion

Using Resend for email capture provides a clean, reliable solution that:
- Leverages your existing Resend integration
- Requires minimal infrastructure setup
- Provides real-time webhook delivery
- Scales automatically with usage
- Maintains single vendor for email operations

The implementation is straightforward, following your established patterns while providing a robust email-to-webhook pipeline for FigJam to Notion synchronization.