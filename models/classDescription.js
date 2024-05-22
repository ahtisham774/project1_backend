const mongoose = require('mongoose');
const ClassDescriptionSchema = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    classes: [
        {
            month: {
                type: String,
                required: true
            },
            year: {
                type: String,
                required: true
            },
            class: [

                {
                    date: {
                        type: String,
                        required: true
                    }
                    , topic: {
                        type: String,
                        required: true
                    }
                    , dueDate: {
                        type: Date,
                        default: Date.now()
                    },
                    isDone: {
                        type: Boolean,
                        default: false
                    },
                    isCancel:{
                        type: Boolean,
                        default: false
                    }
                }
            ]
        }
    ]
    
})

module.exports = mongoose.model('ClassDescription', ClassDescriptionSchema)