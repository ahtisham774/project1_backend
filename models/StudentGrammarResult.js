const mongoose = require("mongoose")
const StudentGrammarResultSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    grammarResults: [
        {
            date: {
                type: Date,
                default: Date.now
            },
            score: {
                type: Number,
                default: 0,
            },
            quizId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Quiz'
            },
            questions: [
                {
                    question: {
                        type: String,
                    },
                    options: {
                        type: [String],
                    },
                    answer: {
                        type: String,
                    },
                    userAnswer: {
                        type: String,
                        default: ""
                    },
                    isCorrect: {
                        type: Boolean,
                        default: false,
                    },
                }
            ]
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

module.exports = mongoose.model('StudentGrammarResult', StudentGrammarResultSchema)