const mongoose = require('mongoose');

const homeworkLevels = new mongoose.Schema({
    level: {
        type: String,
    },
    activities: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'HomeworkActivity'
        }
    ],

})

const HomeworkLevels = mongoose.model('HomeworkLevels', homeworkLevels);
module.exports = HomeworkLevels;