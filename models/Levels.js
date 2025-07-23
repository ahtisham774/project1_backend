const mongoose = require('mongoose');

const levelSchema = new mongoose.Schema({
    level: {
        type: String,
    },
    subjects: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Subject',
            index:true
        },
        
    ],
     order:{
        type:Number,
        default:0
    },
    progress: [
        {
            studentId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Student',
                index:true
            },
            status: {
                type: String,
                default: "Not Started"
            },
            progress: {
                type: Number,
                default: 0
            },
            avg: {
                type: Number,
                default: 0
            }


        }
    ]

})

const Level = mongoose.model('Level', levelSchema);
module.exports = Level;