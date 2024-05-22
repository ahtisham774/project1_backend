
const Level = require('../models/Levels');
const Subject = require('../models/Subject');
const multer = require('multer');
const path = require('path');


// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/subjects');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
// Middleware function to fetch a level by ID and attach it to the request object
const getLevelById = async (req, res, next) => {
    try {

        let level = await Level.findOne({ _id: req.params.id }).select("level subjects")
            .populate({
                path: 'subjects',
                select: '-activities', // Exclude the 'activities' field
            });
        if (!level) {
            return res.status(404).json({ message: 'Level not found' });
        }
        return res.status(200).json(level)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

// Middleware function to create a new level
const createLevel = async (req, res, next) => {
    try {
        //just add level to Level model
        const { level } = req.body;
        const newLevel = new Level({
            level,
        });
        await newLevel.save();
        return res.status(201).json({ message: "Created Successfully!!!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Middleware function to update a level by ID
const updateLevelById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { subject, description } = req.body;
        //get coverImage
        const coverImage = req.file.filename;



        // Find the level by ID
        const level = await Level.findById(id);

        if (!level) {
            return res.status(404).json({ message: 'Level not found' });
        }

        // Create a new subject with the given name and coverImage
        const newSubject = new Subject({
            subject: subject,
            description,
            coverImage,
        });
        // Save the subject to the database
        await newSubject.save();

        // Add the subject's ID to the level's Subjects array
        level.subjects.push(newSubject._id);

        // Save the updated level
        await level.save();

        res.status(200).json({ message: "Created Successfully!!!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

//Middleware function to get all level 
const getAllLevel = async (req, res, next) => {
    try {
        let level = await Level.find().select({ level: 1, _id: 1 });

        if (!level) {
            return res.status(404).json({ message: 'Level not found' });
        }
        return res.status(200).json(level)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// Middleware function to delete a level by ID
const deleteLevelById = async (req, res, next) => {
    try {
        const level = req.level;
        await level.remove();
        res.json({ message: 'Level deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


//update subject
const updateSubject = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { subject, description } = req.body;
        //get coverImage
        const coverImage = req.file?.filename;

        // Find the subject by ID
        const subjectObj = await Subject.findById(id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        console.log(subject, description)
        subjectObj.subject = subject;
        subjectObj.description = description;
        if (coverImage) {

            subjectObj.coverImage = coverImage;
        }
        await subjectObj.save();
        return res.status(200).json({ message: "Successfully updated!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const updateSubjectsOrder = async (req, res) => {
    try {
        const { subjects } = req.body;

        // Generate update operations for each subject
        const updateOperations = subjects.map(({ id, order }, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: order }
            }
        }));


        await Subject.bulkWrite(updateOperations);
        const updatedSubjects = await Subject.find({ _id: { $in: subjects.map(subject => subject.id) } });

        // Check if subjects were found
        if (!updatedSubjects) {
            return res.status(404).json({ message: "Subjects not found" });
        }

        return res.status(200).json({ message: "Successfully updated subjects order", subject: updatedSubjects });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};


const updateLevelName = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { level } = req.body;
        // Find the level by ID
        const newLevel = await Level.findById(id);
        if (!newLevel) {
            return res.status(404).json({ message: 'Level not found' });
        }
        newLevel.level = level;
        await newLevel.save();
        return res.status(200).json({ message: "Successfully updated!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteSubject = async (req, res, next) => {
    try {
        const id = req.params.id;
        // Find the subject by ID
        const subject = await Subject.findByIdAndDelete(id);
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        return res.status(200).json({ message: "Successfully deleted!!!" })
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


uploadImage = upload.single('coverImage');

module.exports = {
    getAllLevel,
    updateLevelName,
    getLevelById,
    createLevel,
    updateLevelById,
    updateSubject,
    updateSubjectsOrder,
    deleteSubject,
    deleteLevelById,
    uploadImage

};