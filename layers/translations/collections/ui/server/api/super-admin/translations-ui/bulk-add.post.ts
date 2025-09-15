import { processTranslationObject, bulkAddTranslationsWithCheck } from '../../../database/queries'

export default defineEventHandler(async (event) => {
  // Check if user is super admin
  const { user } = await requireUserSession(event)
  if (!user.superAdmin) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: Super admin access required',
    })
  }

  const body = await readBody(event)
  
  if (!body.translations || typeof body.translations !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid request: translations object required',
    })
  }

  try {
    // Log a sample of the received data to check encoding
    console.log('Received translations sample:', JSON.stringify(body.translations.navigation?.posts || body.translations, null, 2).substring(0, 500))
    
    // Process the translations object into database format
    const translations = processTranslationObject(
      body.translations,
      user.id,
      null, // System-level translations
      'ui'
    )
    
    // Log processed translations to verify encoding
    if (translations.length > 0) {
      console.log('Processed translation sample:', JSON.stringify(translations[0], null, 2))
    }
    
    if (translations.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'No valid translations found to add',
      })
    }
    
    // Bulk add with duplicate checking
    const result = await bulkAddTranslationsWithCheck(translations)
    
    return {
      success: true,
      message: `Successfully added ${result.added.length} translations`,
      added: result.added.length,
      skipped: result.skipped.length,
      totalProcessed: result.totalProcessed
    }
  } catch (error) {
    console.error('Bulk add error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Failed to add translations: ${error.message}`,
    })
  }
})