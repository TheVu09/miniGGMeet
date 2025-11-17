const userService = require('../../services/user.service')
const ApiResponse = require('../../../../utils/response.util')

exports.getProfile = async (req, res, next) => {
  try {
    const userId = req.user.id
    const user = await userService.getUserById(userId)
    
    return ApiResponse.success(res, { user })
  } catch (error) {
    next(error)
  }
}

exports.getFriends = async (req, res, next) => {
  try {
    const userId = req.user.id
    const friends = await userService.getFriends(userId)
    
    return ApiResponse.success(res, { 
      friends,
      count: friends.length 
    })
  } catch (error) {
    next(error)
  }
}

exports.getFriendRequests = async (req, res, next) => {
  try {
    const userId = req.user.id
    const requests = await userService.getFriendRequests(userId)
    
    return ApiResponse.success(res, { 
      requests,
      count: requests.length 
    })
  } catch (error) {
    next(error)
  }
}

exports.sendFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { email } = req.body
    
    await userService.sendFriendRequest(userId, email)
    
    return ApiResponse.success(res, null, 'Friend request sent successfully')
  } catch (error) {
    next(error)
  }
}

exports.acceptFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { requesterId } = req.body
    
    await userService.acceptFriendRequest(userId, requesterId)
    
    return ApiResponse.success(res, null, 'Friend request accepted')
  } catch (error) {
    next(error)
  }
}

exports.rejectFriendRequest = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { requesterId } = req.body
    
    await userService.rejectFriendRequest(userId, requesterId)
    
    return ApiResponse.success(res, null, 'Friend request rejected')
  } catch (error) {
    next(error)
  }
}

exports.removeFriend = async (req, res, next) => {
  try {
    const userId = req.user.id
    const { friendId } = req.params
    
    await userService.removeFriend(userId, friendId)
    
    return ApiResponse.success(res, null, 'Friend removed successfully')
  } catch (error) {
    next(error)
  }
}
