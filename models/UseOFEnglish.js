const mongoose = require("mongoose")
const Model = new mongoose.Schema({
    level: {
        type: String,
    },
    games: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Quiz',
            index:true
        }
    ],
    progress: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                index:true
            },
            status: {
                type: String,
                default: "Not Started"
            },
            progress: {
                type: Number,
                default: 0
            },
            avg: {
                type: Number,
                default: 0
            }


        }
    ],
    date_created: {
        type: Date,
        default: Date.now

    }
})

const UseOFEnglish = mongoose.model('UseOFEnglish', Model)
module.exports = UseOFEnglish