const mongoose = require('mongoose')

const ExerciseSchema = new mongoose.Schema({
    questions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Question'
    }],
})

const Exercise = mongoose.model('Exercise', ExerciseSchema)
module.exports = Exercise