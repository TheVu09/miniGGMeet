const { v4: uuidv4 } = require('uuid')
const MeetingRoom = require('../../models/MeetingRoom')
const User = require('../../models/User')

module.exports = {
    async home(req, res) {
        res.render('index', {
            user: req.session.user || null,
            error: null
        })
    },

    async login(req, res) {
        const { username, displayName } = req.body
        if (!username || !displayName) {
            return res.render('index', { user: null, error: 'Vui lòng nhập đủ thông tin' })
        }
        let user = await User.findOne({ username })
        if (!user) {
            user = await User.create({ username, displayName })
        }
        req.session.user = { id: user._id.toString(), username, displayName: user.displayName }
        res.redirect('/')
    },

    async createMeeting(req, res) {
        try {
            const user = req.session.user
            if (!user) return res.redirect('/')
            const code = uuidv4().slice(0, 8)
            const room = await MeetingRoom.create({
                title: `Cuộc họp của ${user.displayName}`,
                code,
                capacity: 150
            })
            res.redirect(`/meeting/${code}`)
        } catch (e) {
            res.status(500).send('Không thể tạo phòng họp')
        }
    },

    async viewMeeting(req, res) {
        const user = req.session.user
        if (!user) return res.redirect('/')
        const { code } = req.params
        const room = await MeetingRoom.findOne({ code })
        if (!room) return res.status(404).send('Phòng họp không tồn tại')

        res.render('meeting', {
            user,
            room
        })
    }
}
