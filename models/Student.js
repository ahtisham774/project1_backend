/* The code `router.post('/register-teacher',UserController.uploadImage,
UserController.registerTeacher);` is defining a POST route for registering a new teacher. When a
POST request is made to the '/register-teacher' endpoint, it will first execute the `uploadImage`
middleware function and then call the `registerTeacher` function from the `UserController`. This
route is used to handle the registration process for a new teacher in the application. */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    rollNo: {
        type: Number,
        unique: true,
        index: true,
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: "active"
    }
    ,
    profileImage: {
        type: String
    },
    country: {
        type: String
    },
    classLink: {
        type: String
    },
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
    }],
    levels: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Level'
        }
    ],

    dateCreated: {
        type: Date,
        default: Date.now
    },
    dateUpdated: {
        type: Date,
        default: Date.now
    }
});

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;
