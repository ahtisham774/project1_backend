const mongoose = require('mongoose');
const AverageHomework = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    average:[
        {
            month: {
                type: String,
                required: true
            },
            year: {
                type: String,
                required: true
            },
            grammar: {
                type: String,
                required: true
            },
            vocabulary: {
                type: String,
                required: true
            },
            listening: {
                type: String,
                required: true
            }
            ,
            reading: {
                type: String,
                required: true
            },
        }
    ]
})
module.exports = mongoose.model('HomeworkAverage', AverageHomework)