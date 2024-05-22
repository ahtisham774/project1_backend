
const mongoose = require('mongoose');

const homeworkSchema = new mongoose.Schema({

    link: {
        type: String,
    }
    , dueDate: {
        type: Date,
    },
    isDone: {
        type: Boolean,
        default: false
    }


});

const Homework = mongoose.model('Homework', homeworkSchema);

module.exports = Homework;
