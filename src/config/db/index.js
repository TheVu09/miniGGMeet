const mongoose = require('mongoose')

module.exports = async function connectDB () {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/miniggmeet'
  mongoose.set('strictQuery', true)
  await mongoose.connect(mongoUrl, {
    dbName: mongoUrl.split('/').pop()
  })
  console.log('Đã kết nối MongoDB')

  // Hotfix: Xoá index email_1 cũ nếu tồn tại (gây trùng lặp khi email=null)
  try {
    const db = mongoose.connection.db
    const usersCol = db.collection('users')
    const idx = await usersCol.indexes()
    const hasEmailIdx = idx.find(i => i.name === 'email_1')
    if (hasEmailIdx) {
      await usersCol.dropIndex('email_1')
      console.log('Đã xoá index cũ: email_1 trên users')
    }
    // Đảm bảo index duy nhất cho username
    await usersCol.createIndex({ username: 1 }, { unique: true })
  } catch (e) {
    console.warn('Không thể kiểm tra/cập nhật index users:', e?.message || e)
  }
}
