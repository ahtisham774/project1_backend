const mongoose = require('mongoose');
const quizSchema = new mongoose.Schema({
    name:{
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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});
const Quiz = mongoose.model('Quiz', quizSchema);
module.exports = Quiz;