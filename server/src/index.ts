import 'module-alias/register'
import { addAliases } from 'module-alias'
import path from 'path'

// Add path aliases
addAliases({
  '@': __dirname
})

import express from 'express'
import { specs, swaggerUi } from './swagger'

import apiKeysRouter from './api/routes/api-keys'
import articleRoutes from './api/routes/articles'
import attachmentRoutes from './api/routes/attachments'
import chatSessionRoutes from './api/routes/chat-sessions'
import companyRoutes from './api/routes/companies'
import contactRoutes from './api/routes/contacts'
import customFieldRoutes from './api/routes/custom-fields'
import noteRoutes from './api/routes/notes'
import portalSessionRoutes from './api/routes/portal-sessions'
import tagRoutes from './api/routes/tags'
import teamRoutes from './api/routes/teams'
import ticketRoutes from './api/routes/tickets'
import userRoutes from './api/routes/users'
import webhookRoutes from './api/routes/webhooks'
import authRoutes from './api/routes/auth'
import clientAuthRoutes from './api/routes/clientAuth'
import activityRoutes from './api/routes/activity'
import aiRoutes from './api/routes/ai'
import metricsRoutes from './api/routes/metrics'

const app = express()
app.use(express.json())

// Serve static files from the React client
app.use(express.static(path.join(__dirname, '../../client/dist')))

// API Routes
app.use('/api/metrics', metricsRoutes)
app.use('/api/ai', aiRoutes)
app.use('/api/api-keys', apiKeysRouter)
app.use('/api/articles', articleRoutes)
app.use('/api/attachments', attachmentRoutes)
app.use('/api/chat/sessions', chatSessionRoutes)
app.use('/api/companies', companyRoutes)
app.use('/api/contacts', contactRoutes)
app.use('/api/custom-fields', customFieldRoutes)
app.use('/api/notes', noteRoutes)
app.use('/api/portal-sessions', portalSessionRoutes)
app.use('/api/tags', tagRoutes)
app.use('/api/teams', teamRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/users', userRoutes)
app.use('/api/webhooks', webhookRoutes)
app.use('/api', authRoutes)
app.use('/api', clientAuthRoutes)
app.use('/api/activity', activityRoutes)

// Add before your routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
})

// Only start server if not being imported for tests
if (require.main === module) {
  const PORT = process.env.PORT || 3001
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`)
  })
}

export default app