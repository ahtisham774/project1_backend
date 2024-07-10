const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
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
});
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;