import * as fs from 'fs'
import * as path from 'path'
import { supabase } from '../lib/supabase'

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await supabase.rpc('exec', { query: `
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `})

    const migrationsPath = path.join(__dirname, '../../../supabase/migrations')
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`Found ${files.length} migration files`)

    for (const file of files) {
      // Check if migration was already executed
      const { data: rows } = await supabase
        .from('migrations')
        .select()
        .eq('name', file)
        .single()

      if (rows) {
        console.log(`Skipping migration ${file} - already executed`)
        continue
      }

      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8')
      
      try {
        await supabase.rpc('exec', { query: 'BEGIN' })
        await supabase.rpc('exec', { query: sql })
        await supabase.from('migrations').insert({ name: file })
        await supabase.rpc('exec', { query: 'COMMIT' })
        console.log(`Successfully ran migration: ${file}`)
      } catch (error: unknown) {
        await supabase.rpc('exec', { query: 'ROLLBACK' })
        if (error instanceof Error) {
          throw new Error(`Migration ${file} failed: ${error.message}`)
        }
      }
    }
  } catch (error: unknown) {
    console.error('Error running migrations:', error)
    throw error
  }
}

runMigrations()
