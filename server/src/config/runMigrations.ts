import { Pool } from 'pg'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
})

async function runMigrations() {
  try {
    // Create migrations table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        name TEXT PRIMARY KEY,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    const migrationsPath = path.join(__dirname, '../../../supabase/migrations')
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort()

    console.log(`Found ${files.length} migration files`)

    for (const file of files) {
      // Check if migration was already executed
      const { rows } = await pool.query(
        'SELECT name FROM migrations WHERE name = $1',
        [file]
      )

      if (rows.length > 0) {
        console.log(`Skipping migration ${file} - already executed`)
        continue
      }

      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8')
      
      try {
        await pool.query('BEGIN')
        await pool.query(sql)
        await pool.query('INSERT INTO migrations (name) VALUES ($1)', [file])
        await pool.query('COMMIT')
        console.log(`Successfully ran migration: ${file}`)
      } catch (error: any) {
        await pool.query('ROLLBACK')
        throw new Error(`Migration ${file} failed: ${error.message}`)
      }
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations() 