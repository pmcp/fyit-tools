import Database from 'better-sqlite3'
import { nanoid } from 'nanoid'

// Open the database
const db = new Database('server/database/db.sqlite')

// Prepare the insert statement
const insert = db.prepare(`
  INSERT INTO translations_system (
    id, userId, keyPath, category, values, description, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`)

const newTranslation = {
  id: nanoid(),
  userId: 'script',
  keyPath: 'navigation.backToDashboard',
  category: 'navigation',
  values: JSON.stringify({
    en: 'Back to Dashboard',
    nl: 'Terug naar Dashboard',
    fr: 'Retour au tableau de bord'
  }),
  description: 'Link text to return to the main dashboard',
  createdAt: Date.now(),
  updatedAt: Date.now(),
}

try {
  insert.run(
    newTranslation.id,
    newTranslation.userId,
    newTranslation.keyPath,
    newTranslation.category,
    newTranslation.values,
    newTranslation.description,
    newTranslation.createdAt,
    newTranslation.updatedAt
  )
  console.log('✅ Translation added successfully:', newTranslation.keyPath)
} catch (error: any) {
  if (error.message?.includes('UNIQUE constraint failed')) {
    console.log('⚠️  Translation already exists with this keyPath')
  } else {
    console.error('❌ Error adding translation:', error)
  }
}

db.close()