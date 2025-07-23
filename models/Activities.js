const mongoose = require("mongoose")

const activitySchema = new mongoose.Schema({
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
    order: {
        type: Number,
        default: 0
    },
    type: {
        type: String,
        required: true
    },
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Lesson'
        }
    ],
    homeworks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework'
    }],
    isDone: {
        type: Boolean,
        default: false
    },
    progress: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                index:true,
            },
            status: {
                type: String,
                default: "Not Started",
                index:true,
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

const Activity = mongoose.model('Activity', activitySchema);
module.exports = Activity;