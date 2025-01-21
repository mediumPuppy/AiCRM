import express from 'express'
import apiKeysRouter from './api/routes/api-keys'
import { specs, swaggerUi } from './swagger'

const app = express()
app.use(express.json())

// API Routes
app.use('/api/api-keys', apiKeysRouter)

// Add before your routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`)
})

export default app