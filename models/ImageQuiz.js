const mongoose = require("mongoose")

const ImageQuiz = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    games: [
        {
            image: {
                type: String,
                required: true
            },
            questions: [
                {
                    question: {
                        type: String,
                        required: true
                    },
                    answer: {
                        type: String,
                        required: true
                    },
                    userAnswer: {
                        type: String,
                        default: ""
                    },
                    isCorrect: {
                        type: Boolean,
                        default: false

                    }
                }
            ]
        }
    ],
    order: {
        type: Number,
        default: 99999
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },

});

module.exports = mongoose.model("ImageQuiz", ImageQuiz);;