const breakoutRoomService = require('../../services/breakoutRoom.service')
const ApiResponse = require('../../../../utils/response.util')

async function createBreakoutRooms(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    const { numberOfRooms, roomNames, assignmentType, capacity } = req.body
    
    const rooms = await breakoutRoomService.createBreakoutRooms(meetingId, userId, {
      numberOfRooms,
      roomNames,
      assignmentType,
      capacity
    })
    
    return ApiResponse.created(res, rooms, 'Phòng breakout được tạo thành công')
  } catch (error) {
    next(error)
  }
}

async function assignParticipant(req, res, next) {
  try {
    const userId = req.session.user.id
    const { roomId } = req.params
    const { participantId } = req.body
    
    const room = await breakoutRoomService.assignParticipant(roomId, userId, participantId)
    
    return ApiResponse.success(res, room, 'Người tham gia được phân công thành công')
  } catch (error) {
    next(error)
  }
}

async function joinBreakoutRoom(req, res, next) {
  try {
    const userId = req.session.user.id
    const { roomId } = req.params
    
    const room = await breakoutRoomService.joinBreakoutRoom(roomId, userId)
    
    return ApiResponse.success(res, room, 'Tham gia phòng breakout thành công')
  } catch (error) {
    next(error)
  }
}

async function leaveBreakoutRoom(req, res, next) {
  try {
    const userId = req.session.user.id
    const { roomId } = req.params
    
    const room = await breakoutRoomService.leaveBreakoutRoom(roomId, userId)
    
    return ApiResponse.success(res, room, 'Rời khỏi phòng breakout thành công')
  } catch (error) {
    next(error)
  }
}

async function getMeetingBreakoutRooms(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const rooms = await breakoutRoomService.getMeetingBreakoutRooms(meetingId, userId)
    
    return ApiResponse.success(res, rooms, 'Phòng breakout được lấy thành công')
  } catch (error) {
    next(error)
  }
}

async function startBreakoutRooms(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const result = await breakoutRoomService.startBreakoutRooms(meetingId, userId)
    
    return ApiResponse.success(res, result, 'Phòng breakout được bắt đầu thành công')
  } catch (error) {
    next(error)
  }
}

async function closeBreakoutRoom(req, res, next) {
  try {
    const userId = req.session.user.id
    const { roomId } = req.params
    
    const room = await breakoutRoomService.closeBreakoutRoom(roomId, userId)
    
    return ApiResponse.success(res, room, 'Phòng breakout được đóng thành công')
  } catch (error) {
    next(error)
  }
}

async function closeAllBreakoutRooms(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    
    const result = await breakoutRoomService.closeAllBreakoutRooms(meetingId, userId)
    
    return ApiResponse.success(res, result, 'Tất cả phòng breakout được đóng thành công')
  } catch (error) {
    next(error)
  }
}

async function broadcastToBreakoutRooms(req, res, next) {
  try {
    const userId = req.session.user.id
    const { meetingId } = req.params
    const { message } = req.body
    
    const result = await breakoutRoomService.broadcastToBreakoutRooms(meetingId, userId, message)
    
    return ApiResponse.success(res, result, 'Message broadcasted successfully')
  } catch (error) {
    next(error)
  }
}

module.exports = {
  createBreakoutRooms,
  assignParticipant,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  getMeetingBreakoutRooms,
  startBreakoutRooms,
  closeBreakoutRoom,
  closeAllBreakoutRooms,
  broadcastToBreakoutRooms
}
