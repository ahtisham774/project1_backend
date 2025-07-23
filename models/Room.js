const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
    roomId: String,
    messages: [
        {
            type: mongoose.Types.ObjectId,
            ref: 'Message'

        }
    ]

})
module.exports = mongoose.model('Room', RoomSchema);