import express from 'express'
import apiKeysRouter from './api/routes/api-keys'
import { specs, swaggerUi } from './swagger'
import articleRoutes from './api/routes/articles'

const app = express()
app.use(express.json())

// API Routes
app.use('/api/api-keys', apiKeysRouter)
app.use('/api/articles', articleRoutes)

// Add before your routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Only start server if not being imported for tests
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
  })
}

export default app