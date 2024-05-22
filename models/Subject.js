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
            ref:'Activity'
        }
    ],
    isAvailable:{
        type:Boolean,
        default:false
    }

})
const Subject = mongoose.model('Subject',subjectSchema)
module.exports = Subject