
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const Student = require('../models/Student');
const Teacher = require("../models/Teacher")


// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/profiles');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });




exports.getStudents = async (req, res) => {
    try {
        const students = await Student.find().select('firstName lastName profileImage');
        res.status(200).json(students);
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }
}

exports.updateStatus = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id);
        if (!student) return res.status(404).json({ message: 'Student not found' });
        student.status = req.body.status;
        await student.save();
        res.status(200).json(student);
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }

}

exports.getStudentsStatus = async (req, res) => {
    try {
        const students = await Student.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } },]);
        res.status(200).json(students);
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }
}

// assign level to student
exports.assignLevel = async (req, res) => {
    try {
        const levelID = req.body.levelID;
        const students = JSON.parse(req.body.students);

        console.log(levelID, students);

        await Student.updateMany(
            { _id: { $in: students }, levels: { $ne: levelID } },
            { $addToSet: { levels: levelID } }
        );

        res.status(200).json({ message: 'Level assigned' });
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: 'Invalid credentials' });
    }
};

//get students levels
exports.getStudentLevels = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('levels').populate("levels");
        res.status(200).json(student);
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }
}

exports.getStudentByLevel = async (req, res) => {
    try {
        const students = await Student.find({ levels: req.params.id }).select('firstName lastName profileImage');
        res.status(200).json(students);
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }

}


// Register a new student
exports.registerStudent = async (req, res) => {
    try {
        // Check if student already exists and rollNo already exist
        const existingRollNo = await Student.findOne({ rollNo: req.body.rollNo });
        if (existingRollNo) {
            return res.status(400).json({ message: 'Roll No already exists' });
        }
        const existingStudent = await Student.findOne({ email: req.body.email });
        if (existingStudent) {
            return res.status(400).json({ message: 'Student already exists' });
        }
        const existingTeacher = await Teacher.findOne({ email: req.body.email });
        if (existingTeacher) {
            return res.status(400).json({ message: 'This email is registered as Teacher' });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        // Create new student object
        const newStudent = new Student({
            rollNo: req.body.rollNo,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            profileImage: req.file ? (req.file.filename ? req.file.filename : "") : ""
        });

        // Save student to database
        const savedStudent = await newStudent.save();

        // Generate JWT token



        res.status(200).json({ email: savedStudent.email });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Login a student
exports.loginStudent = async (req, res) => {
    try {

        let user;
        if (req.body.userType === "teacher") {
            user = await Teacher.findOne({ email: req.body.email });
        }
        else {
            user = await Student.findOne({ email: req.body.email, status: "active" });
        }
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        // Validate the password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        console.log(validPassword, user)
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        res.status(200).json({ "email": req.body.email, "userType": req.body.userType });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get student details
exports.getStudentDetails = async (req, res) => {
    try {
        // Find student by id
        const student = await Student.find().select('-password -dateCreated -dateUpdated');
        res.status(200).json(student);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
//get student by ID
exports.getStudentById = async (req, res) => {
    try {
        // Find student by id
        const student = await Student.findById(req.params.id).select('firstName lastName email country profileImage');
        const newStudent = {
            ...student._doc,
        }
        return res.status(200).json(newStudent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// Update student details
exports.updateStudentDetails = async (req, res) => {
    try {
        // Find and update the student

        const updates = Object.keys(req.body)

        if (updates.includes("password")) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        if (req.file) {
            req.body.profileImage = req.file.filename;
        }
        const student = await Student.findById(req.params.id)
        updates.forEach((update) => student[update] = req.body[update])
        await student.save();
        const {
            _id, firstName, lastName, email, country, profileImage
        } = student._doc,


            newStudent = {
                _id, firstName, lastName, email, country, profileImage
            }
        res.status(200).json(newStudent);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// Delete a student
exports.deleteStudent = async (req, res) => {
    try {
        // Find and delete the student
        await Student.findOneAndDelete({ email: req.params.email });
        res.status(200).json({ message: 'Student deleted' });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}
// create a function that takes token and return the student
exports.getCurrentUser = async (req, res) => {
    const email = req.query.email;

    try {
        if (!email) {
            return res.status(401).json({ message: 'email is missing' });
        }
        let teacher = await Teacher.findOne({ email: email }).select(
            '-password -dateCreated -dateUpdated -__v'
        );
        let student = await Student.findOne({ email: email }).select(
            '-password -dateCreated -dateUpdated -__v'
        );
        if (teacher) {
            return res.status(200).json({ ...teacher._doc, userType: 'teacher' });
        }
        if (student) {
            return res.status(200).json({ ...student._doc, userType: 'student' });
        }
        return res.status(401).json({ message: 'Invalid email' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.registerTeacher = async (req, res) => {
    try {
        const existingTeacher = await Teacher.findOne({ email: req.body.email });
        console.log("existingTeacher: ", existingTeacher)
        if (existingTeacher) {
            return res.status(400).json({ message: 'Teacher already exists' });
        }
        let student = await Student.findOne({ email: req.body.email });
        console.log("student: ", student)
        if (student) {
            return res.status(400).json({ message: 'You are already registered as Student' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const newTeacher = new Teacher({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            password: hashedPassword,
            profileImage: req.file ? (req.file.filename ? req.file.filename : "") : ""
        });
        const savedTeacher = await newTeacher.save();
        res.status(200).json({ email: savedTeacher.email });
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }
}


exports.getStudentName = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).select('firstName lastName');
        if (student) {

            res.status(200).json(student);
        }
        else {
            res.status(404).json({ message: 'Student not found' });
        }
    }
    catch (error) {
        console.log(error)
        res.status(400).json({ message: 'Invalid credentials' });
    }
}





// Handle image upload
exports.uploadImage = upload.single('profileImage');
