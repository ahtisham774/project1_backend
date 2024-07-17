const mongoose = require('mongoose');

// Define the question schema
const questionSchema = new mongoose.Schema({
    question: {
        type: String,
    },
    hint: {
        type: String,
    },
    options: {
        type: [String],
    },
    image:{
        type: String,
    },
    translation: {
        type: String,
    },
    translation2: {
        type: String,
    },
    answer: {
        type: String,
    },
    optionals: [
        {
            type: String,
        }
    ],
    userAnswer: {
        type: String,
        default: ""
    },
    isCorrect: {
        type: Boolean,
        default: false,
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

// Create the model
const Question = mongoose.model('Question', questionSchema);
module.exports = Question;