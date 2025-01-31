// import * as fs from 'fs'
// import * as path from 'path'
// import { supabase } from '../lib/supabase'

// async function runMigrations() {
//   try {
//     console.log('Starting migration process...')
    
//     // Start transaction before creating migrations table
//     await supabase.rpc('exec', { query: 'BEGIN' })
    
//     try {
//       // Create migrations table if it doesn't exist
//       console.log('Creating migrations table if not exists...')
//       const { error: tableError } = await supabase.rpc('exec', { query: `
//         CREATE TABLE IF NOT EXISTS public.migrations (
//           name TEXT PRIMARY KEY,
//           executed_at TIMESTAMPTZ DEFAULT NOW()
//         );
//       `})
//       if (tableError) throw tableError

//       const migrationsPath = path.join(__dirname, '../../../supabase/migrations')
//       const files = fs.readdirSync(migrationsPath)
//         .filter(file => file.endsWith('.sql'))
//         .sort()

//       console.log(`Found ${files.length} migration files`)

//       for (const file of files) {
//         try {
//           // Check if migration was already executed
//           const { data: rows, error: checkError } = await supabase
//             .from('migrations')
//             .select()
//             .eq('name', file)
//             .single()

//           if (checkError && !checkError.message.includes('No rows found')) {
//             throw checkError
//           }

//           if (rows) {
//             console.log(`Skipping migration ${file} - already executed`)
//             continue
//           }

//           console.log(`Running migration: ${file}`)
//           const sql = fs.readFileSync(path.join(migrationsPath, file), 'utf8')
          
//           const { error: execError } = await supabase.rpc('exec', { query: sql })
//           if (execError) {
//             console.error(`Error executing migration ${file}:`, execError)
//             throw execError
//           }

//           const { error: insertError } = await supabase
//             .from('migrations')
//             .insert({ name: file })
//           if (insertError) {
//             console.error(`Error recording migration ${file}:`, insertError)
//             throw insertError
//           }

//           console.log(`Successfully ran migration: ${file}`)
//         } catch (error) {
//           console.error(`Error processing migration ${file}:`, error)
//           throw error
//         }
//       }

//       // If we get here, commit the transaction
//       await supabase.rpc('exec', { query: 'COMMIT' })
//       console.log('All migrations completed successfully')

//     } catch (error) {
//       // If any error occurs, rollback the entire transaction
//       console.error('Rolling back transaction due to error:', error)
//       await supabase.rpc('exec', { query: 'ROLLBACK' })
//       throw error
//     }

//   } catch (error: unknown) {
//     console.error('Error running migrations:', error)
//     process.exit(1) // Exit with error code
//   }
// }

// // Add proper process handling
// process.on('unhandledRejection', (error) => {
//   console.error('Unhandled rejection:', error)
//   process.exit(1)
// })

// runMigrations()
