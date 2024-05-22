
const Tracking = require("../models/Tracking")
const Class = require("../models/Class")
const ClassManagement = require("../models/ClassManagement")
const Student = require("../models/Student")



const createClassLink = async (req, res) => {
    try {
        const student = req.params.id
        const { link } = req.body
        const level = await Student.findById(student)
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            level.classLink = link
            await level.save()
            return res.status(200).json({ message: "Link Assigned" })
        }
    }
    catch (err) {
        return res.status(500).json({ message: err.message })
    }
}

const getClassLink = async (req, res) => {
    try {
        const student = req.params.id
        const level = await Student.findById(student)
        if (!level) {
            return res.status(404).json({ message: "Student Not found" })
        } else {
            return res.status(200).json(level.classLink)
        }
    }
    catch (err) {
        res.status(400).json({ message: err.message });
    }
}



const createClass = async (req, res) => {
    const year = req.body.year;
    const studentId = req.params.id;
    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Create an array of classes to insert
    const classesToInsert = months.map((month) => ({
        name: `${month}`,
        description: "",
        goal: "",
        tracking: []
    }));

    const classIds = [];
    try {
        // Use insertMany to insert multiple classes
        const insertedClasses = await Class.insertMany(classesToInsert);
        insertedClasses.forEach((insertedClass) => {
            classIds.push(insertedClass._id);
        });

        // create ClassManagement and add data to it
        const yearlyClass = {
            year: year,
            monthlyClasses: classIds
        };
        let classManagement;
        classManagement = await Student.findOne({ _id: studentId });
        if (!classManagement) {
            res.status(404).json({ message: "Student not found" });
        }
        if (classManagement) {
            classManagement.classes.push(yearlyClass);
            await classManagement.save();
            return res.status(201).json({ message: "Created Successfully!" });
        }

    } catch (err) {
        res.status(400).json({ message: err.message });
    }
};


const getYears = async (req, res) => {
    try {
        const studentId = req.params.id;
        const years = await Student.findOne({ _id: studentId }, { "classes.year": 1, "classes._id": 1 });
        if (!studentId) {
            return res.status(404).json({ message: "Cannot find student" });
        }
        // if no years found
        if (years == null || years?.length === 0) {
            return res.status(404).json({ message: "No years found" });
        }

        res.json(years);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMonthlyClassesByYear = async (req, res) => {
    try {
        const studentId = req.params.id;
        const year = req.query.year;

        // Find the ClassManagement document matching the student ID
        const classManagement = await Student.findOne({ _id: studentId });

        if (!classManagement) {
            return res.status(404).json({ message: "Class management not found" });
        }

        // Find the classes for the requested year
        const requestedYearClasses = classManagement.classes.find(cls => cls.year === year);

        if (!requestedYearClasses) {
            return res.status(404).json({ message: "Classes for the requested year not found" });
        }

        // Get the monthly class IDs for the requested year
        const monthlyClassIds = requestedYearClasses.monthlyClasses;

        // Retrieve the details of each monthly class
        const monthlyClasses = await Class.find({ _id: { $in: monthlyClassIds } })
            .select('name _id');

        res.json(monthlyClasses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getMonthlyClassByYearAndMonth = async (req, res) => {
    try {
        const studentId = req.params.id;
        const year = req.query.year;
        const month = req.query.month;

        // Find the ClassManagement document matching the student ID
        const classManagement = await Student.findOne({ _id: studentId });

        if (!classManagement) {
            return res.status(404).json({ message: "Class management not found" });
        }

        // Find the classes for the requested year
        const requestedYearClasses = classManagement.classes.find(cls => cls.year === year);

        if (!requestedYearClasses) {
            return res.status(404).json({ message: "Classes for the requested year not found" });
        }

        // Get the monthly class IDs for the requested year
        const monthlyClassIds = requestedYearClasses.monthlyClasses;

        // Retrieve the details of each monthly class
        const monthlyClasses = await (await Class.find({ _id: { $in: monthlyClassIds } })).find(cls => cls.name === month);

        res.json(monthlyClasses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
//get classes with name only
const getClasses = async (req, res) => {
    try {
        const classes = await Class.find({}, { name: 1 });
        res.json(classes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getClassItems = async (req, res) => {
    try {
        const required = req.body.required;
        let classItem;

        if (required === "description") {
            classItem = await Class.findById(req.params.id, { description: 1 });
        } else if (required === "goal") {
            classItem = await Class.findById(req.params.id, { goal: 1 });
        } else if (required === 'tracking') {
            classItem = await Class.findById(req.params.id, { tracking: 1 }).populate("tracking");
        }

        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }

        return res.json(classItem);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};



const createTracking = async (req, res) => {
    try {
        const id = req.params.id
        const classItem = await Class.findById(id);
        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }
        let track
        if (req.body.dueDate) {
            track = new Tracking({
                name: req.body.name,
                dueDate: req.body.dueDate
            })
        } else {
            track = new Tracking({
                name: req.body.name
            })
        }
        //add to existing array of items in the model
        const tracking = new Tracking(
            track
        )

        const newTracking = await tracking.save();
        classItem.tracking.push(newTracking._id);
        await classItem.save();
        res.status(201).json({ message: "Created!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}


const createTrackingBulk = async (req, res) => {
    try {
        const id = req.params.id
        const count = req.body.count
        const classItem = await Class.findById(id);
        if (!classItem) {
            return res.status(404).json({ message: "Cannot find class" });
        }
        let tracking = []
        for (let i = 0; i < count; i++) {
            tracking.push({
                name: "Class Done"
            })
        }
        const newTracking = await Tracking.insertMany(tracking);
        newTracking.forEach((track) => {
            classItem.tracking.push(track._id);
        })
        await classItem.save();
        res.status(201).json({ message: "Created!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }

}

const updateClassInfo = async (req, res) => {
    try {
        const id = req.params.id;
        const { description, goal } = req.body;

        const updatedClass = await Class.findById(id);

        if (!updatedClass) {
            return res.status(404).json({ message: 'Class not found' });
        }

        if (description) {
            updatedClass.description = description;
        }
        if (goal) {
            updatedClass.goal = goal;
        }
        await updatedClass.save()
        res.json({ message: "Added Successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const updateTracking = async (req, res) => {
    try {
        const id = req.params.id;
        const { isDone, dueDate } = req.body;
        const updatedTracking = await Tracking.findById(id);
        if (!updatedTracking) {
            return res.status(404).json({ message: "Tracking not found" });
        }
        if (isDone !== null) {
            updatedTracking.isDone = isDone;
        }
        if (dueDate !== null) {
            updatedTracking.dueDate = dueDate;
        }
        await updatedTracking.save();
        res.json({ message: "Updated Successfully!" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

}

module.exports = {
    createClass,
    createTracking,
    updateClassInfo,
    getClasses,
    createTrackingBulk,
    updateTracking,
    getYears,
    getClassItems,
    getMonthlyClassesByYear,
    createClassLink,
    getClassLink,
    getMonthlyClassByYearAndMonth,

}