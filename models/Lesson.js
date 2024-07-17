const mongoose = require("mongoose")

const lessonSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    coverImage: {
        type: String,
    },
    description: {
        type: String,

    },
    type: {
        type: String,
        required: true
    },
    order: {
        type: Number,
        default: 9999
    },
    materials: [
        {
            type: String,
        }
    ],
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'

    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz'
    }],
    reading: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reading'
        }
    ],
    imageQuiz: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ImageQuiz'
        }
    ]

})

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;