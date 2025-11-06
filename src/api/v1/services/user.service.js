// User Service - Business logic for user operations
const User = require('../../../models/User')
const { NotFoundError, ConflictError } = require('../../../utils/error.util')

/**
 * Get user by ID
 * @param {string} userId 
 * @returns {Promise<User>}
 */
async function getUserById(userId) {
  const user = await User.findById(userId)
    .populate('friends', 'displayName email')
    .populate('friendRequests', 'displayName email')
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return user
}

/**
 * Get user by email
 * @param {string} email 
 * @returns {Promise<User>}
 */
async function getUserByEmail(email) {
  const user = await User.findOne({ email })
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return user
}

/**
 * Send friend request
 * @param {string} userId - Sender ID
 * @param {string} targetEmail - Target user email
 * @returns {Promise<void>}
 */
async function sendFriendRequest(userId, targetEmail) {
  // Find target user
  const targetUser = await User.findOne({ email: targetEmail })
  
  if (!targetUser) {
    throw new NotFoundError('User not found')
  }
  
  if (targetUser._id.toString() === userId) {
    throw new ConflictError('Cannot send friend request to yourself')
  }
  
  // Check if already friends
  const sender = await User.findById(userId)
  if (sender.friends.includes(targetUser._id)) {
    throw new ConflictError('Already friends with this user')
  }
  
  // Check if request already sent
  if (targetUser.friendRequests.includes(userId)) {
    throw new ConflictError('Friend request already sent')
  }
  
  // Add to friend requests
  targetUser.friendRequests.push(userId)
  await targetUser.save()
}

/**
 * Accept friend request
 * @param {string} userId - Current user ID
 * @param {string} requesterId - Requester ID
 * @returns {Promise<void>}
 */
async function acceptFriendRequest(userId, requesterId) {
  const user = await User.findById(userId)
  const requester = await User.findById(requesterId)
  
  if (!user || !requester) {
    throw new NotFoundError('User not found')
  }
  
  // Remove from friend requests
  user.friendRequests = user.friendRequests.filter(
    id => id.toString() !== requesterId
  )
  
  // Add to friends for both users
  if (!user.friends.includes(requesterId)) {
    user.friends.push(requesterId)
  }
  
  if (!requester.friends.includes(userId)) {
    requester.friends.push(userId)
  }
  
  await user.save()
  await requester.save()
}

/**
 * Reject friend request
 * @param {string} userId - Current user ID
 * @param {string} requesterId - Requester ID
 * @returns {Promise<void>}
 */
async function rejectFriendRequest(userId, requesterId) {
  const user = await User.findById(userId)
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  // Remove from friend requests
  user.friendRequests = user.friendRequests.filter(
    id => id.toString() !== requesterId
  )
  
  await user.save()
}

/**
 * Remove friend
 * @param {string} userId - Current user ID
 * @param {string} friendId - Friend ID to remove
 * @returns {Promise<void>}
 */
async function removeFriend(userId, friendId) {
  const user = await User.findById(userId)
  const friend = await User.findById(friendId)
  
  if (!user || !friend) {
    throw new NotFoundError('User not found')
  }
  
  // Remove from both users' friends list
  user.friends = user.friends.filter(id => id.toString() !== friendId)
  friend.friends = friend.friends.filter(id => id.toString() !== userId)
  
  await user.save()
  await friend.save()
}

/**
 * Get user's friends list
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
async function getFriends(userId) {
  const user = await User.findById(userId)
    .populate('friends', 'displayName email')
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return user.friends
}

/**
 * Get user's friend requests
 * @param {string} userId 
 * @returns {Promise<Array>}
 */
async function getFriendRequests(userId) {
  const user = await User.findById(userId)
    .populate('friendRequests', 'displayName email')
  
  if (!user) {
    throw new NotFoundError('User not found')
  }
  
  return user.friendRequests
}

module.exports = {
  getUserById,
  getUserByEmail,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getFriendRequests
}
