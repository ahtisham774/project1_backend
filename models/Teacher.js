const mongoose = require("mongoose")

const TeacherSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique:true
    },
    password:{
        type:String,
        required:true
    },
    profileImage:{
        type:String,
        default:""
    }
})
const Teacher = mongoose.model("Teacher",TeacherSchema)
module.exports = Teacher
