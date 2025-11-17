const mongoose = require('mongoose')

module.exports = async function connectDB () {
  try {
    // const mongoUrl = process.env.MONGO_URL_ATLAS || 'mongodb+srv://dauthevu_db_user:IErYvAJdjwTEEg31@miniggmeet.mgyinjd.mongodb.net/miniggmeet?retryWrites=true&w=majority&appName=miniggmeet'
    const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/miniggmeet'
    
    // Extract database name from URL (remove query parameters)
    const dbName = mongoUrl.split('/').pop().split('?')[0]
    
    mongoose.set('strictQuery', true)
    await mongoose.connect(mongoUrl, {
      dbName: dbName
    })
    console.log('Đã kết nối MongoDB thành công')
    console.log('Database:', mongoose.connection.db.databaseName)
    console.log('Connection URL:', mongoUrl.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@'))

    mongoose.connection.on('error', err => {
      console.error('MongoDB error:', err)
    })
  } catch (error) {
    console.error('Lỗi kết nối MongoDB:', error)
    throw error
  }
}
