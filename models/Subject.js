const mongoose = require('mongoose')
const subjectSchema =new  mongoose.Schema({
    subject:{
        type:String,
    },
    coverImage:{
        type:String,
    },
    description:{
        type:String,
    },
    order:{
        type:Number,
        default:0
    },
    activities:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:'Activity',
            index:true
        }
    ],
    isAvailable:{
        type:Boolean,
        default:false
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
            }
            ,
            avg: {
                type: Number,
                default: 0
            }

        }
    ]

})
const Subject = mongoose.model('Subject',subjectSchema)
module.exports = Subject