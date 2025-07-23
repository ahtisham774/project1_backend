const mongoose = require("mongoose")

const ReadingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    paragraph: {
        type: String,

    },
    order: {
        type: Number,
        default: 99999
    },
    audio: {
        type: String,

    },
    readingGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        index:true
    },
    listeningGame: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        index:true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
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
    ]

})
module.exports = mongoose.model("Reading", ReadingSchema)
