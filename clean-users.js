// Script to clean old users without email field
require('dotenv').config()
const mongoose = require('mongoose')

async function cleanUsers() {
  try {
    await mongoose.connect(process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/miniggmeet')
    console.log('Connected to MongoDB')
    
    const User = mongoose.model('User', new mongoose.Schema({}, {strict: false}))
    
    // Find all users
    const users = await User.find({})
    console.log(`Found ${users.length} users`)
    
    // Delete users without email
    const usersWithoutEmail = users.filter(u => !u.email)
    console.log(`Users without email: ${usersWithoutEmail.length}`)
    
    if (usersWithoutEmail.length > 0) {
      for (const user of usersWithoutEmail) {
        console.log(`Deleting user: ${user.username || user._id}`)
        await User.deleteOne({ _id: user._id })
      }
      console.log('✅ Cleaned up old users')
    } else {
      console.log('✅ All users have email field')
    }
    
    await mongoose.disconnect()
    console.log('Done!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

cleanUsers()
