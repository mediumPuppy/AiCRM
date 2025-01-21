import express from 'express'
import { specs, swaggerUi } from './swagger'

import apiKeysRouter from './api/routes/api-keys'
import articleRoutes from './api/routes/articles'
import chatSessionRoutes from './api/routes/chat-sessions'
import companyRoutes from './api/routes/companies'

const app = express()
app.use(express.json())

// API Routes
app.use('/api/api-keys', apiKeysRouter)
app.use('/api/articles', articleRoutes)
app.use('/api/chat/sessions', chatSessionRoutes)
app.use('/api/companies', companyRoutes)
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