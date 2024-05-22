const mongoose = require('mongoose')
const ReminderSchema = new mongoose.Schema({
    teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Teacher'
    },
    reminders: [
        {

            title: {
                type: String,
                required: true
            },
            dueDate: {
                type: Date,
                default: Date.now()
            },
            isDone: {
                type: Boolean,
                default: false
            }
        }
    ]
})
module.exports = mongoose.model('Reminder', ReminderSchema)