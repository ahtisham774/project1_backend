const mongoose = require("mongoose")
const classManagementSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Student"
    }
    ,
    classes: [{
        year: {
            type: String,
        }
        ,
        monthlyClasses: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Class"
            }
        ]
    }]
})
const ClassManagement = mongoose.model("ClassManagement", classManagementSchema)
module.exports = ClassManagement