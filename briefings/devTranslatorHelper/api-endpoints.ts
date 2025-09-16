// server/api/teams/[teamSlug]/translations.patch.ts
export default defineEventHandler(async (event) => {
  const { teamSlug } = getRouterParams(event)
  const { keyPath, values, category = 'ui', createIfNotExists = false } = await readBody(event)
  
  if (!teamSlug || !keyPath || !values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }
  
  try {
    const db = useDB()
    
    // Get team ID from slug
    const team = await db.select()
      .from(teams)
      .where(eq(teams.slug, teamSlug))
      .first()
    
    if (!team) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Team not found'
      })
    }
    
    // Check if override already exists
    const existingOverride = await db.select()
      .from(translationsUi)
      .where(
        and(
          eq(translationsUi.teamId, team.id),
          eq(translationsUi.keyPath, keyPath),
          eq(translationsUi.namespace, category)
        )
      )
      .first()
    
    if (existingOverride) {
      // Update existing override
      await db.update(translationsUi)
        .set({
          values: JSON.stringify(values),
          updatedAt: new Date()
        })
        .where(eq(translationsUi.id, existingOverride.id))
    } else {
      // Check if system translation exists (for reference)
      const systemTranslation = await db.select()
        .from(translationsSystem)
        .where(
          and(
            isNull(translationsSystem.teamId),
            eq(translationsSystem.keyPath, keyPath),
            eq(translationsSystem.namespace, category)
          )
        )
        .first()
      
      // If no system translation exists and createIfNotExists is true, create it first
      if (!systemTranslation && createIfNotExists) {
        await db.insert(translationsSystem).values({
          teamId: null, // System translation
          keyPath,
          category,
          namespace: category,
          values: JSON.stringify(values),
          userId: 'dev-mode-auto-create',
          description: `Auto-created via dev mode editing for key: ${keyPath}`,
          isOverrideable: true
        })
        
        // Sync to locale files
        await syncTranslationsToFiles()
      }
      
      // Create new team override
      await db.insert(translationsUi).values({
        teamId: team.id,
        keyPath,
        category,
        namespace: category,
        values: JSON.stringify(values),
        userId: 'dev-mode-edit',
        description: createIfNotExists ? 
          'Created via dev mode editing (new translation)' : 
          'Created via dev mode editing'
      })
    }
    
    // Update team settings cache
    await updateTeamTranslationCache(team.id)
    
    return {
      success: true,
      message: existingOverride ? 'Translation override updated' : 'Translation override created',
      created: !existingOverride
    }
    
  } catch (error) {
    console.error('Failed to save team translation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save translation'
    })
  }
})

// server/api/super-admin/translations-system.put.ts
export default defineEventHandler(async (event) => {
  const { keyPath, values, category = 'ui', createIfNotExists = false, description } = await readBody(event)
  
  if (!keyPath || !values) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields'
    })
  }
  
  try {
    const db = useDB()
    
    // Check if system translation exists
    const existing = await db.select()
      .from(translationsSystem)
      .where(
        and(
          isNull(translationsSystem.teamId), // System translation
          eq(translationsSystem.keyPath, keyPath),
          eq(translationsSystem.namespace, category)
        )
      )
      .first()
    
    if (existing) {
      // Update existing system translation
      await db.update(translationsSystem)
        .set({
          values: JSON.stringify(values),
          updatedAt: new Date(),
          ...(description && { description })
        })
        .where(eq(translationsSystem.id, existing.id))
    } else if (createIfNotExists) {
      // Create new system translation
      await db.insert(translationsSystem).values({
        teamId: null, // System translation
        keyPath,
        category,
        namespace: category,
        values: JSON.stringify(values),
        userId: 'dev-mode-edit',
        description: description || `Auto-created via dev mode editing for key: ${keyPath}`,
        isOverrideable: true
      })
    } else {
      throw createError({
        statusCode: 404,
        statusMessage: 'Translation not found and createIfNotExists is false'
      })
    }
    
    // Sync to locale files
    await syncTranslationsToFiles()
    
    return {
      success: true,
      message: existing ? 'System translation updated' : 'System translation created',
      created: !existing
    }
    
  } catch (error) {
    console.error('Failed to save system translation:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to save translation'
    })
  }
})

// Helper function to update team translation cache
async function updateTeamTranslationCache(teamId: string) {
  const db = useDB()
  
  // Get all team overrides
  const overrides = await db.select()
    .from(translationsUi)
    .where(eq(translationsUi.teamId, teamId))
  
  // Build translation object
  const translations: Record<string, Record<string, string>> = {}
  
  for (const override of overrides) {
    const values = JSON.parse(override.values)
    
    for (const [locale, value] of Object.entries(values)) {
      if (!translations[locale]) {
        translations[locale] = {}
      }
      translations[locale][override.keyPath] = value as string
    }
  }
  
  // Update team settings
  await db.update(teamSettings)
    .set({
      translations: JSON.stringify(translations),
      updatedAt: new Date()
    })
    .where(eq(teamSettings.teamId, teamId))
}
