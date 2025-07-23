const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    explanation: {
        type: String,
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question',
        index:true
    }],
    type: {
        type: String,
    },
    grammarType: {
        type: String,

    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
    order: {
        type: Number,
        default: 0
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
});
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;