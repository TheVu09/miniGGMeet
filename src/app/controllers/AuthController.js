const bcrypt = require('bcryptjs')
const User = require('../../models/User')

module.exports = {
  loginPage (req, res) {
    res.render('auth-login', { error: null })
  },
  registerPage (req, res) {
    res.render('auth-register', { error: null })
  },
  async register (req, res) {
    try {
      let { username, displayName, password } = req.body
      username = (username || '').trim()
      displayName = (displayName || '').trim()
      password = (password || '').trim()
      if (!username || !displayName || !password) {
        return res.render('auth-register', { error: 'Vui lòng nhập đầy đủ thông tin' })
      }
      if (password.length < 6) {
        return res.render('auth-register', { error: 'Mật khẩu phải có ít nhất 6 ký tự' })
      }
      const exists = await User.findOne({ username })
      if (exists) return res.render('auth-register', { error: 'Tên đăng nhập đã tồn tại' })
      const hash = await bcrypt.hash(password, 10)
      const user = await User.create({ username, displayName, passwordHash: hash })
      req.session.user = { id: user._id.toString(), username, displayName }
      res.redirect('/')
    } catch (e) {
      console.error('Register error:', e)
      if (e && e.code === 11000) {
        return res.render('auth-register', { error: 'Tên đăng nhập đã tồn tại' })
      }
      res.render('auth-register', { error: 'Đăng ký thất bại. Vui lòng thử lại.' })
    }
  },
  async login (req, res) {
    try {
      const { username, password } = req.body
      const user = await User.findOne({ username })
      if (!user) return res.render('auth-login', { error: 'Sai tài khoản hoặc mật khẩu' })
      const ok = await bcrypt.compare(password || '', user.passwordHash || '')
      if (!ok) return res.render('auth-login', { error: 'Sai tài khoản hoặc mật khẩu' })
      req.session.user = { id: user._id.toString(), username: user.username, displayName: user.displayName }
      res.redirect('/')
    } catch (e) {
      res.render('auth-login', { error: 'Đăng nhập thất bại' })
    }
  },
  logout (req, res) {
    req.session.destroy(() => {
      res.redirect('/auth/login')
    })
  }
}
