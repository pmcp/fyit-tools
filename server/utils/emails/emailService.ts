import { and, eq } from 'drizzle-orm'
import { emailTemplates } from '@@/server/database/schema/teams'
import { defaultTemplates, type EmailTemplateType } from './templates'
import { nanoid } from 'nanoid'

/**
 * Send an email using a team's custom template or default template
 */
export async function sendTeamEmail(
  teamId: string,
  type: EmailTemplateType,
  to: string | string[],
  locale: string,
  data: Record<string, any>
) {
  const db = useDB()

  // Get custom template or fall back to default
  const customTemplate = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.teamId, teamId),
        eq(emailTemplates.type, type)
      )
    )
    .get()

  // Fallback chain: Custom → Default → English default
  const template =
    customTemplate?.translations?.[locale] ||
    customTemplate?.translations?.['en'] ||
    defaultTemplates[type]?.[locale] ||
    defaultTemplates[type]?.['en']

  if (!template) {
    throw new Error(`No email template found for type: ${type}`)
  }

  // Simple template replacement
  let subject = template.subject
  let body = template.body

  // Replace variables in subject and body
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, String(value))
    body = body.replace(regex, String(value))
  })

  // Handle arrays for items (basic implementation)
  if (data.items && Array.isArray(data.items)) {
    const itemsHtml = data.items.map((item: any) => {
      if (typeof item === 'object') {
        return `<tr>
          <td>${item.name || ''}</td>
          <td>${item.quantity || ''}</td>
          <td>${item.price || ''}</td>
          <td>${item.total || ''}</td>
        </tr>`
      }
      return `<li>${item}</li>`
    }).join('')

    body = body.replace(/{{items}}/g, itemsHtml)
  }

  // Send via your email provider
  // This is where you'd integrate with SendGrid, Resend, AWS SES, etc.
  await sendEmail({
    to: Array.isArray(to) ? to : [to],
    subject,
    html: body
  })

  // Log email sent (optional)
  await logEmailSent({
    teamId,
    type,
    to: Array.isArray(to) ? to.join(', ') : to,
    locale,
    sentAt: new Date()
  })

  return { success: true }
}

/**
 * Create or update an email template for a team
 */
export async function upsertEmailTemplate(
  teamId: string,
  type: EmailTemplateType,
  translations: Record<string, { subject: string; body: string }>
) {
  const db = useDB()

  // Check if template exists
  const existing = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.teamId, teamId),
        eq(emailTemplates.type, type)
      )
    )
    .get()

  if (existing) {
    // Update existing template
    await db
      .update(emailTemplates)
      .set({
        translations,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, existing.id))
      .run()
  } else {
    // Create new template
    await db
      .insert(emailTemplates)
      .values({
        id: nanoid(),
        teamId,
        type,
        translations,
        updatedAt: new Date()
      })
      .run()
  }

  return { success: true }
}

/**
 * Get all email templates for a team
 */
export async function getTeamEmailTemplates(teamId: string) {
  const db = useDB()

  const templates = await db
    .select()
    .from(emailTemplates)
    .where(eq(emailTemplates.teamId, teamId))
    .all()

  // Merge with defaults
  const result: Record<string, any> = {}

  // Start with all default templates
  for (const [type, localeTemplates] of Object.entries(defaultTemplates)) {
    result[type] = { ...localeTemplates }
  }

  // Override with custom templates
  for (const template of templates) {
    if (template.translations) {
      result[template.type] = {
        ...result[template.type],
        ...template.translations
      }
    }
  }

  return result
}

/**
 * Preview an email template with sample data
 */
export async function previewEmailTemplate(
  teamId: string,
  type: EmailTemplateType,
  locale: string,
  sampleData: Record<string, any>
) {
  const db = useDB()

  // Get custom template or fall back to default
  const customTemplate = await db
    .select()
    .from(emailTemplates)
    .where(
      and(
        eq(emailTemplates.teamId, teamId),
        eq(emailTemplates.type, type)
      )
    )
    .get()

  const template =
    customTemplate?.translations?.[locale] ||
    customTemplate?.translations?.['en'] ||
    defaultTemplates[type]?.[locale] ||
    defaultTemplates[type]?.['en']

  if (!template) {
    throw new Error(`No email template found for type: ${type}`)
  }

  // Apply sample data
  let subject = template.subject
  let body = template.body

  Object.entries(sampleData).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g')
    subject = subject.replace(regex, String(value))
    body = body.replace(regex, String(value))
  })

  return { subject, body }
}

/**
 * Send email implementation (placeholder - integrate with your email provider)
 */
async function sendEmail({ to, subject, html }: {
  to: string[]
  subject: string
  html: string
}) {
  // TODO: Integrate with your email provider (SendGrid, Resend, AWS SES, etc.)
  console.log('Sending email:', { to, subject })

  // For now, just log the email
  // In production, you would use something like:
  // await resend.emails.send({ to, subject, html })
  // or
  // await sendgrid.send({ to, subject, html })
}

/**
 * Log email sent (optional tracking)
 */
async function logEmailSent(data: {
  teamId: string
  type: string
  to: string
  locale: string
  sentAt: Date
}) {
  // TODO: Implement email logging if needed
  console.log('Email sent:', data)
}
