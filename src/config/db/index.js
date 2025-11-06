const mongoose = require('mongoose')

module.exports = async function connectDB () {
  try {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/miniggmeet'
    mongoose.set('strictQuery', true)
    await mongoose.connect(mongoUrl, {
      dbName: mongoUrl.split('/').pop(),
      useNewUrlParser: true,
      useUnifiedTopology: true
    })
    console.log('✅ Đã kết nối MongoDB thành công')

    mongoose.connection.on('error', err => {
      console.error('MongoDB error:', err)
    })
  } catch (error) {
    console.error('❌ Lỗi kết nối MongoDB:', error)
    throw error
  }
}
