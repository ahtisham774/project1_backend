
const Subject = require('../models/Subject');
const Activity = require("../models/Activities")
const Lesson = require("../models/Lesson")
const Conversation = require("../models/Conversation")
const ConversationItem = require("../models/ConversationItem")
const Question = require("../models/Question")
const Quiz = require("../models/Quiz")
const multer = require('multer');
const path = require('path');
const fs = require('fs');


// Set up multer storage for image upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/activities');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const audioStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/audio');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadAudio = multer({ storage: audioStorage });

const upload = multer({ storage: storage });
// Middleware function to fetch a subject by ID and attach it to the request object
const getAllActivities = async (req, res, next) => {
  
    try {

        let subject = await Subject.findOne({ _id: req.params.id }).select("subject activities")
            .populate({
                path: 'activities',
                select: "title order coverImage type description", // Exclude the 'activities' field
            });
        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }
        return res.status(200).json(subject)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


//middleware function to return content list of activities of give id
const getActivitiesContentById = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { required } = req.body
        let activity;
        if (required === 'lessons') {
            //get get lesson from activity and populate it and select title description and coverImage from lesson
            activity = await Activity.findById(id).select("title type lessons")
                .populate({
                    path: 'lessons',
                    select: "title description order coverImage", // Exclude the 'activities' field
                });
        }
        else if (required === 'homeworks') {
            activity = await Activity.findById(id).select("title type homeworks")
        }

        if (!activity) {
            return res.status(404).json({ message: 'Activities not found' });
        }
        return res.status(200).json(activity)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


//getMaterialByLesson
const getMaterialByLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { required } = req.body
        let lesson;
        if (required === 'materials') {
            //get get lesson from activity and populate it and select title description and coverImage from lesson
            lesson = await Lesson.findById(id).select("title order type materials")
        }
        else if (required === 'game') {
            lesson = await Lesson.findById(id).select("title order type games").populate({
                path: 'games',
                populate: {
                    path: 'questions',
                    model: 'Question',
                },
            });
        }

        else if (required === 'conversation') {
            lesson = await Lesson.findById(id).select("type conversation").populate({
                path: "conversation",
                populate: {
                    path: "conversations.person1 conversations.person2",
                    model: "ConversationItem",
                },
            });

        }

        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        return res.status(200).json(lesson)
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const deleteConversation = async (req, res) => {
    try {
        const conversationId = req.params.id;
        const { conversation_id } = req.body;
        // Use the $pull operator to remove the conversation by ID from the array
        const result = await Conversation.updateOne(
            { _id: conversationId },
            { $pull: { conversations: { _id: conversation_id } } }
        );
        console.log(result)
        // Check if any modifications were made
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found or not modified' });
        }

        return res.status(200).json({ message: "Successfully deleted!!!" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

const createLessonGame = async (req, res) => {
    try {

        const id = req.params.id
        // Extract lesson data from the request body
        const name = req.body.name;
        const questions = req.body.questions;
        const type = req.body.gameType

        // Create questions and get their IDs
        const questionIds = await Promise.all(questions.map(async q => {
            const { question, options, correctOption } = q;

            const newQuestion = new Question({
                question,
                options,
                answer: correctOption,
            });

            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));

        const lesson = await Lesson.findById(id)
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }


        const quiz = new Quiz({
            name,
            questions: questionIds,
            type

        });
        const quizId = await quiz.save()
        //make lesson game array unique
        const unique = [...new Set([...lesson.games, quizId._id])];
        lesson.games = unique;
        await lesson.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

const deleteLessonGame = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const gameId = req.query.gameId;
        console.log(lessonId)
        console.log(gameId)
       const updateLesson = await Lesson.updateOne({
            _id: lessonId
        }, {
            $pull: {
                games: gameId
            }
        });
        console.log(updateLesson)
        return res.status(200).json({ message: "Successfully deleted!!!" })
    } catch (err) {
        console.error('Error deleting game:', err);
        res.status(500).json({ message: 'Internal Server Error' });
    }

}

const updateConversationAudio = async (req, res) => {
    try {
        const id = req.params.id;
        //get coverImage
        const audio = req.file.filename;

        // Find the subject by ID
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        conversation.audio = audio;
        await conversation.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}


// Middleware function to create a new subject
const createActivities = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title,  type } = req.body;
        //get coverImage
        const coverImage = req.file.filename;



        // Find the subject by ID
        const subject = await Subject.findById(id);

        if (!subject) {
            return res.status(404).json({ message: 'Subject not found' });
        }

        // Create a new subject with the given name and coverImage
        const activities = new Activity({
            title,
        
            type,
            coverImage,
        });
        // Save the subject to the database
        await activities.save();

        // Add the subject's ID to the subject's Activities array
        subject.activities.push(activities._id);

        // Save the updated subject
        await subject.save();

        res.status(200).json({ message: "Created Successfully!!!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

//middleware function to add material in activity material list
const addLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description, type } = req.body
        //get coverImage
        const coverImage = req.file.filename;

        // Find the subject by ID
        const activity = await Activity.findById(id);


        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        //create new Lesson
        const lesson = new Lesson({
            title,
            description,
            type,
            coverImage
        })
        //save lesson
        await lesson.save();
        //push lesson id in activity
        activity.lessons.push(lesson._id);
        await activity.save();
        return res.status(200).json({ message: "Successfully added!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

//middleware function to add material in lesson material list
const addMaterial = async (req, res, next) => {
    try {
        const id = req.params.id;
        //get coverImage
        const coverImage = req.file.filename;

        // Find the subject by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        lesson.materials.push(coverImage)
        await lesson.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};
async function saveConversationItem({ name, text, translation }) {
    const newItem = new ConversationItem({ name, text, translation });
    return newItem.save();
}

const createConversation = async (req, res) => {
    try {
        const id = req.params.id;
        const title = req.body.title, conversation = JSON.parse(req.body.conversation);
        const audio = req.file.filename;


        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ success: false, message: 'Lesson not found' });
        }

        if (!audio || !title || !conversation) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields' });
        }

        const conversationIds = [];

        // Parallel creation of ConversationItem instances

        for (const con of conversation) {

            const person1Item = new ConversationItem({
                name: con.person1Name,
                text: con.person1Text,
                translation: con.person1Translation,
            });

            const person2Item = new ConversationItem({
                name: con.person2Name,
                text: con.person2Text,
                translation: con.person2Translation,
            });

            await person1Item.save();
            await person2Item.save();
            conversationIds.push({
                person1: person1Item._id,
                person2: person2Item._id
            });
        }


        const newConversation = new Conversation({
            audio,
            title,
            conversations: conversationIds,
        });

        await newConversation.save();
        lesson.conversation = newConversation._id;
        await lesson.save();

        return res.status(200).json({ message: 'Successfully added!!!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateConversation = async (req, res) => {
    try {
        const id = req.params.id;
        const { title } = req.body;

       

        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if(req.file){
            conversation.audio = req.file.filename;
        }
        if(title){
            conversation.title = title;
        }
       
        await conversation.save();

        return res.status(200).json({ message: 'Successfully updated!!!' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }

}

//create function to add conversation in give conversation
const createConversationItem = async (req, res) => {
    try {
        const id = req.params.id;
        const conversations = JSON.parse(req.body.conversation);
        const conversation = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        let conversationIds;


        const person1Item = new ConversationItem({
            name: conversations[0].person1.name,
            text: conversations[0].person1.text,
            translation: conversations[0].person1.translation,
        });

        const person2Item = new ConversationItem({
            name: conversations[1].person2.name,
            text: conversations[1].person2.text,
            translation: conversations[1].person2.translation,
        });

        await person1Item.save();
        await person2Item.save();
        conversationIds = {
            person1: person1Item._id,
            person2: person2Item._id
        };

        conversation.conversations.push(conversationIds);
        await conversation.save();
        return res.status(200).json({ message: "Successfully added!!!" })

    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

//remove material from lesson
const removeMaterial = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { filename } = req.body;

        // Find the lesson by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        // Remove the filename from the materials array
        lesson.materials.pull(filename);

        // Construct the file path
        const directory = path.join(__dirname, '..', 'public', 'images', 'activities', filename);

        // Check if the file exists before attempting to remove it
        if (fs.existsSync(directory)) {
            // Remove the file
            fs.unlinkSync(directory);
            await lesson.save();
            return res.status(200).json({ message: 'Successfully removed!!!' });
        } else {
            // File does not exist
            await lesson.save();
            return res.status(200).json({ message: 'Successfully removed!!!' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const deleteQuestion = async (req, res) => {
    try {
        const quizIdToDelete = req.params.quizId;
        const questionIdToDelete = req.params.questionId;



        // Find the Quiz that contains the deleted question
        const quiz = await Quiz.findById(quizIdToDelete);

        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        // Delete the question from the Question schema
        await Question.findByIdAndDelete(questionIdToDelete);
        // Remove the question's ID from the Quiz schema
        quiz.questions = quiz.questions.filter(id => id !== questionIdToDelete);
        await quiz.save();

        res.status(200).json({ message: 'Question successfully deleted' });
    } catch (error) {
        console.error('Error deleting question:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

const editGame = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const updatedQuestions = req.body.questions;
        const name = req.body.name;
        const quizToEdit = await Quiz.findById(quizId)
        if (!quizToEdit) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        if(name){
            quizToEdit.name = name;
        }
        // Get existing question IDs from the quiz
        const existingQuestionIds = quizToEdit.questions;

        // Process each updated question
        const updatedQuestionIds = await Promise.all(updatedQuestions.map(async q => {
            // Check if q is already in existing questions
            const existingQuestionId = existingQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                await Question.findByIdAndUpdate(existingQuestionId, {
                    question: q.question,
                    options: q.options,
                    answer: q.correctOption,
                });
                return existingQuestionId;
            } else {
                // Create a new question
                const { question, options, correctOption } = q;
                const newQuestion = new Question({
                    question,
                    options,
                    answer: correctOption,
                });
                const savedQuestion = await newQuestion.save();
                return savedQuestion._id;
            }
        }));

        // Make the quiz's questions array unique
        const unique = [...new Set([...existingQuestionIds, ...updatedQuestionIds])];
        quizToEdit.questions = unique;
        await quizToEdit.save();

        res.status(200).json({ message: 'Questions successfully edited' });
    } catch (error) {
        console.error('Error editing questions:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

//update Activity
const updateActivity = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        //get coverImage
        const coverImage = req.file?.filename;

        // Find the subject by ID
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        activity.title = title;
        activity.description = description;
        if (coverImage) {
            activity.coverImage = coverImage;
        }
        await activity.save();
        return res.status(200).json({ message: "Successfully updated!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};





const updateActivitiesOrder = async (req, res) => {
    try {
        const { activities } = req.body;
       

        // Generate update operations for each subject
        const updateOperations = activities.map(({ id, order }, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: order }
            }
        }));


        await Activity.bulkWrite(updateOperations);
        const updatedActivities = await Activity.find({ _id: { $in: activities.map(activity => activity.id) } }).select("title order coverImage type description");

        // Check if activities were found
        if (!updatedActivities) {
            return res.status(404).json({ message: "Activities not found" });
        }
        return res.status(200).json({ message: "Successfully updated activities order", activity: updatedActivities });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};
const updateLessonsOrder = async (req, res) => {
    try {
        const { lessons } = req.body;
       

        // Generate update operations for each subject
        const updateOperations = lessons.map(({ id, order }, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: order }
            }
        }));


        await Lesson.bulkWrite(updateOperations);
        const updatedLessons = await Lesson.find({ _id: { $in: lessons.map(lesson => lesson.id) } }).select("title order coverImage type description");

        // Check if lessons were found
        if (!updatedLessons) {
            return res.status(404).json({ message: "Lessons not found" });
        }
        return res.status(200).json({ message: "Successfully updated ", lesson: updatedLessons });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: 'Server error' });
    }
};


const deleteActivity = async (req, res, next) => {
    try {
        const id = req.params.id;
        // Find the subject by ID
        const activity = await Activity.findByIdAndDelete(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        return res.status(200).json({ message: "Successfully deleted!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};

const updateLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title, description } = req.body;
        //get coverImage
        const coverImage = req.file?.filename;

        // Find the subject by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        lesson.title = title;
        lesson.description = description;
        if (coverImage) {
            lesson.coverImage = coverImage;
        }
        await lesson.save();
        return res.status(200).json({ message: "Successfully updated!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


const deleteLesson = async (req, res, next) => {
    try {
        const id = req.params.id;
        // Find the subject by ID
        const lesson = await Lesson.findByIdAndDelete(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        return res.status(200).json({ message: "Successfully deleted!!!" })
        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
};


module.exports = { editGame };


uploadImage = upload.single('coverImage');
audio = uploadAudio.single("audio")


module.exports = {
    getAllActivities,
    createActivities,
    updateConversationAudio,
    createConversation,
    getActivitiesContentById,
    deleteConversation,
    createConversationItem,
    createLessonGame,
    editGame,
    deleteLessonGame,
    updateConversation,
    deleteQuestion,
    addMaterial,

    addLesson,
    removeMaterial,
    getMaterialByLesson,
    updateActivity,
    updateActivitiesOrder,
    updateLessonsOrder,

    deleteActivity,
    updateLesson,
    deleteLesson,
    
    uploadImage,
    audio

};