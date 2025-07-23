const mongoose = require("mongoose")

const WatchTimeSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        index:true
    }
    ,
    watchTime: [
        {
            quizId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz',
                index:true,
                required: true,
            },
            start_time: {
                type: Date,
                required: true
            },
            end_time: {
                type: Date,
                required: true
            },
        }
    ]
})

module.exports = mongoose.model('WatchTime', WatchTimeSchema)