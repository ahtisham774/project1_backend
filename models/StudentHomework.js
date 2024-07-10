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
                    },
                    description: {
                        type: String,
                    },
                    teacherDownload: {
                        type: String,
                    },
                    studentDownload: {
                        type: String,
                    },
                    status:{
                        type: String,
                        default: ""
                    },
                    dueDate: {
                        type: Date,
                        default: Date.now
                    },
                    isDone: {
                        type: Boolean,
                        default: false
                    },
                    percentage: {
                        type: Number,
                        default: 0
                    },
                    date_created: {
                        type: Date,
                        default: Date.now
                    }
                }]
        }
    ]
})
module.exports = mongoose.model('StudentHomework', StudentHomework)