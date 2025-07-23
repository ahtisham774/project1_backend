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
        ref: 'Conversation',
        index:true

    },
    games: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quiz',
        index:true
    }],
    reading: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Reading',
            index:true
        }
    ],
    imageQuiz: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ImageQuiz',
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
    ]


})

const Lesson = mongoose.model('Lesson', lessonSchema);
module.exports = Lesson;