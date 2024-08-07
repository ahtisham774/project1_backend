
const Homework = require('../models/Homework');
const HomeworkLevel = require("../models/HomeworkLevels")
const HomeworkActivity = require("../models/HomeworkActivity");
const Activity = require('../models/Activities');


// Middleware function to get a specific homework by ID
async function getHomeworkById(req, res, next) {
    //get what user what for example subjects or homework
    let id = req.params.id;
    console.log(id)
    let required = req.body.required
    console.log(required)
    let homework;
    try {
        if (required == 'homework') {
            homework = await Homework.findById(id, { homeworks: 1 });
        } else if (required == 'subjects') {
            homework = await Homework.findById(id, { subject: 1 });
        } else {
            homework = await Homework.findById(id);
        }
        if (homework == null) {
            return res.status(404).json({ message: 'Homework not found' });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    return res.json(homework);

}


async function createHomework(req, res) {
    try {
        const id = req.params.id
        let activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        const homework = new Homework({
            title: req.body.title,
            link: req.body.link,
            dueDate: req.body.dueDate,
            isDone: req.body.isDone,
        });
        const hw = await homework.save();
        activity.homeworks.push(hw._id)
        await activity.save();
        res.status(201).json({ message: "Successfully Created!!!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
async function createHomeworkSection(req, res) {
    try {
        const id = req.params.id
        let activity = await HomeworkActivity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        const homework = new Homework({
            title: req.body.title,
            link: req.body.link,
            dueDate: req.body.dueDate,
            isDone: req.body.isDone,
        });
        const hw = await homework.save();
        activity.homeworks.push(hw._id)
        await activity.save();
        res.status(201).json({ message: "Successfully Created!!!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

const deleteHomeworkActivity = async (req, res) => {
    try {
        const id = req.params.id;
        const activity = await HomeworkActivity.findByIdAndDelete(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        res.json({ message: 'Activity deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }

}


async function createHomeworkLevel(req, res) {


    try {
        const homework = new HomeworkLevel({
            level: req.body.level,
            subjects: []
        });
        await homework.save();
        res.status(201).json({ message: "Successfully Created!!!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}
//create homeworkSubject
async function createHomeworkActivities(req, res) {


    try {
        const id = req.params.id
        let homework = await HomeworkLevel.findById(id);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }
        const activity = new HomeworkActivity({
            title: req.body.title,
            homeworks: []
        });
        const act = await activity.save();
        homework.activities.push(act._id)
        await homework.save();
        res.status(201).json({ message: "Successfully Created!!!" });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

//get All homework levels
async function getAllHomeworkLevels(req, res) {
    try {
        const homework = await HomeworkLevel.find();
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function getAllHomeworkActivities(req, res) {
    let id = req.params.id
    try {
        const homework = await HomeworkLevel.findById(id).
            select("activities").
            populate('activities', { title: 1, _id: 1 })
            ;
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
//get all homework of give activity
async function getAllHomework(req, res) {
    let id = req.params.id
    try {
        const homework = await Activity.findById(id).
            select("homeworks").
            populate('homeworks', { title: 1, link: 1, dueDate: 1, isDone: 1 })
            ;
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
async function getAllHomeworkSections(req, res) {
    let id = req.params.id
    try {
        const homework = await HomeworkActivity.findById(id).
            select("homeworks").
            populate('homeworks', { title: 1, link: 1, dueDate: 1, isDone: 1 })
            ;
        res.json(homework);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

//update homework by ID
async function updateHomework(req, res) {
    let id = req.params.id

    try {
        const homework = await Homework.findById(id);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }
        if (req.body.link != null) {
            homework.link = req.body.link;
        }

        if (req.body.isDone != null) {
            homework.isDone = req.body.isDone;
        }
        else {
            homework.dueDate = req.body.dueDate;
        }
        await homework.save();
        res.json({ message: 'Updated homework' });
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

// DELETE a homework
async function deleteHomework(req, res) {
    let id = req.params.id
    try {
        const homework = await Homework.findByIdAndDelete(id);
        if (!homework) {
            return res.status(404).json({ message: 'Homework not found' });
        }
        res.json({ message: 'Homework deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = {
    createHomework,
    createHomeworkSection,
    getAllHomework,
    getAllHomeworkSections,
    createHomeworkLevel,
    createHomeworkActivities,
    getAllHomeworkLevels,
    getAllHomeworkActivities,
    deleteHomeworkActivity,
    updateHomework,
    deleteHomework,
    getHomeworkById,
    updateHomework,
    deleteHomework
};
