const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const mongoose = require('mongoose')

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Debug logs
console.log("GROQ KEY:", process.env.GROQ_API_KEY ? "Found ✅" : "Missing ❌")
console.log("MONGODB_URI:", process.env.MONGODB_URI ? "Found ✅" : "Missing ❌")

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }))
app.use(express.json())
app.use(morgan('dev'))

// Routes
const placesRouter = require('./routes/places')
const savedRouter = require('./routes/saved')
const aiRouter = require('./routes/ai')

app.use('/api/places', placesRouter)
app.use('/api/saved', savedRouter)
app.use('/api/ai', aiRouter)

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ✅ NEW: Root route (homepage)
app.get('/', (req, res) => {
  res.send('Vibe & Go API is running 🚀')
})

// MongoDB connection + server start
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ MongoDB connected')

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
  })
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message)
})