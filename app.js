require('dotenv').config()
const path = require('path')
const express = require('express')
const http = require('http')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const cookieParser = require('cookie-parser')
const { initSocket } = require('./src/socket')
const connectDB = require('./src/config/db')

const app = express()
const server = http.createServer(app)
const io = initSocket(server)

const PORT = process.env.PORT || 3000

// Kết nối MongoDB
connectDB().catch((err) => {
  console.error('Không thể kết nối MongoDB:', err)
  process.exit(1)
})

// Thiết lập view engine EJS
app.set('views', path.join(__dirname, 'src', 'resources', 'views'))
app.set('view engine', 'ejs')

// Middleware cơ bản
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(cookieParser())

// Phiên làm việc (session) + hỗ trợ nhiều không gian phiên cho mục đích test
const sessionStore = MongoStore.create({ mongoUrl: process.env.MONGO_URL })
function makeSession (name) {
  return session({
    name,
    secret: process.env.SESSION_SECRET || 'change-this-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24, path: '/' },
    store: sessionStore
  })
}
const sessionDefault = makeSession('connect.sid')
const sessionA = makeSession('sid-a')
const sessionB = makeSession('sid-b')

// Nhận ns từ query ?ns=a|b và lưu cookie __ns để giữ ổn định giữa các trang
app.use((req, res, next) => {
  const ns = (req.query.ns || req.cookies.__ns || '').toLowerCase()
  if (req.query.ns && req.query.ns !== req.cookies.__ns) {
    res.cookie('__ns', req.query.ns, { maxAge: 1000 * 60 * 60 * 24, httpOnly: false, path: '/' })
  }
  if (ns === 'a') return sessionA(req, res, next)
  if (ns === 'b') return sessionB(req, res, next)
  return sessionDefault(req, res, next)
})

// Static files
app.use(express.static(path.join(__dirname, 'src', 'public')))

// Routes
const routes = require('./src/api/v1/routes')
const viewRoutes = require('./src/api/v1/routes/views.routes')
const { errorHandler } = require('./src/api/v1/middleware/error.middleware')

// View Routes (SSR - Server-Side Rendering) - Must be first
app.use('/', viewRoutes)

// API Routes v1 (REST API)
app.use('/api/v1', routes)

// Global error handler (must be after all routes)
app.use(errorHandler)

// 404 đơn giản
app.use((req, res) => {
  res.status(404).render('index', { error: 'Trang không tồn tại', servers: [], user: null })
})

server.listen(PORT, () => {
  console.log(`MINIGGMeet đang chạy: http://localhost:${PORT}`)
})
