import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase credentials in environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigrations() {
  try {
    // Path to migrations folder (going up two levels to reach supabase/migrations)
    const migrationsPath = path.join(__dirname, '../../../supabase/migrations')
    
    // Read all migration files
    const files = fs.readdirSync(migrationsPath)
      .filter(file => file.endsWith('.sql'))
      .sort() // This will sort them alphabetically, which works with your timestamp-based naming

    console.log(`Found ${files.length} migration files`)

    // Execute each migration
    for (const file of files) {
      console.log(`Running migration: ${file}`)
      const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8')
      
      const { error } = await supabase.rpc('exec_sql', { sql })
      
      if (error) {
        throw new Error(`Migration ${file} failed: ${error.message}`)
      }
      
      console.log(`Successfully ran migration: ${file}`)
    }

    console.log('All migrations completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
    process.exit(1)
  }
}

runMigrations() 