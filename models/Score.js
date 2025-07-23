const mongoose = require("mongoose")

const ScoreSchema = new mongoose.Schema({
    quizId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
        index:true,
    },
    records: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Student",
                index:true,

            },
            studentName: {
                type: String,
            },
            answers: [
                {
                    questionId: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "Question",
                    },

                    answer: {
                        type: String,
                    },
                    isCorrect: {
                        type: Boolean,
                    },
                }
            ],
            score: {
                type: Number,
                default: 0,
            },
            date_created: {
                type: Date,
                default: Date.now,
            },
            start_time: {
                type: Date
            },
            end_time: {
                type: Date
            }
        }
    ],
    date_created: {
        type: Date,
        default: Date.now,
    }

})
module.exports = mongoose.model("Score", ScoreSchema);