const mongoose = require("mongoose")

const StudentLevel = new mongoose.Schema({
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student'
    },
    grammar: {
        type: String,
        required: true
    },
    vocabulary: {
        type: String,
        required: true
    },
    listening:{
        type:String,
        required:true
    }
    ,
    reading:{
        type:String,
        required:true
    },
    writing:{
        type:String,
        required:true
    },
    speaking:{
        type:String,
        required:true
    },
    overall:{
        type:String,
        required:true
    }
})
module.exports= mongoose.model('StudentLevel',StudentLevel)