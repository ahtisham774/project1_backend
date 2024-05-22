const mongoose = require('mongoose');
const StudentHomework = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    homeworks: [
        {
            month: {
                type: String,
                required: true
            },
            year: {
                type: String,
                required: true
            },
            homework: [
                {
                    title: {
                        type: String,
                    },
                    link: {
                        type: String,
                    }
                    , dueDate: {
                        type: Date,
                        default: Date.now()
                    },
                    isDone: {
                        type: Boolean,
                        default: false
                    },
                    percentage: {
                        type: Number,
                        default: 0
                    }
                }]
        }
    ]
})
module.exports = mongoose.model('StudentHomework', StudentHomework)