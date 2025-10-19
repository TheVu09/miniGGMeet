const User = require('../../models/User')

module.exports = {
    async list(req, res) {
        const user = req.session.user
        if (!user) return res.redirect('/')
        const me = await User.findById(user.id).populate('friends friendRequests')
        res.render('friends', { user, me })
    },

    async request(req, res) {
        const user = req.session.user
        if (!user) return res.redirect('/')
        const { username } = req.body
        const target = await User.findOne({ username })
        if (!target) return res.status(404).send('Không tìm thấy người dùng')
        if (!target.friendRequests.map(id => id.toString()).includes(user.id)) {
            target.friendRequests.push(user.id)
            await target.save()
        }
        res.redirect('/friends')
    },

    async accept(req, res) {
        const user = req.session.user
        if (!user) return res.redirect('/')
        const { id } = req.body
        const me = await User.findById(user.id)
        const requester = await User.findById(id)
        if (!me || !requester) return res.redirect('/friends')
        me.friendRequests = me.friendRequests.filter(x => x.toString() !== id)
        if (!me.friends.map(x => x.toString()).includes(id)) me.friends.push(id)
        if (!requester.friends.map(x => x.toString()).includes(me._id.toString())) requester.friends.push(me._id)
        await me.save(); await requester.save()
        res.redirect('/friends')
    }
}
