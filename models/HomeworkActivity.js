const mongoose = require("mongoose")

const homeworkActivitySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    homeworks:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Homework'
    }],

})

const HomeworkActivity = mongoose.model('HomeworkActivity', homeworkActivitySchema);
module.exports=HomeworkActivity;