
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
const Reading = require('../models/Reading');
const { default: mongoose } = require('mongoose');
const ImageQuiz = require('../models/ImageQuiz');


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

const storage1 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/flashcards');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const storage2 = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images/imageQuiz');
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
const uploadFlashCardsImages = multer({ storage: storage1 });
const uploadFImage = uploadFlashCardsImages.array('image')
const uploadImageQuiz = multer({ storage: storage2 }).array("image")
// Middleware function to fetch a subject by ID and attach it to the request object
const getAllActivities = async (req, res, next) => {

    try {

        const activities = await Subject.findById(req.params.id).select("activities")

        const data = await Activity.find(
            {
                _id: { $in: activities.activities }
            }
        )

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
            let test = await Lesson.findById(id).select("type")
            console.log(test.type)
            if (test.type == "Reading/Listening") {
                lesson = await Lesson.aggregate([
                    { $match: { _id: new mongoose.Types.ObjectId(id) } },
                    {
                        $lookup: {
                            from: 'readings',
                            localField: 'reading',
                            foreignField: '_id',
                            as: 'readingDetails'
                        }
                    },
                    { $unwind: '$readingDetails' },  // Deconstructs the array to output a document for each element
                    {
                        $lookup: {
                            from: 'quizzes',
                            localField: 'readingDetails.readingGame',
                            foreignField: '_id',
                            as: 'readingGameDetails'
                        }
                    },
                    {
                        $lookup: {
                            from: 'quizzes',
                            localField: 'readingDetails.listeningGame',
                            foreignField: '_id',
                            as: 'listeningGameDetails'
                        }
                    },
                    { $unwind: '$readingGameDetails' },
                    { $unwind: '$listeningGameDetails' },
                    {
                        $lookup: {
                            from: 'questions',
                            localField: 'readingGameDetails.questions',
                            foreignField: '_id',
                            as: 'readingGameQuestions'
                        }
                    },
                    {
                        $lookup: {
                            from: 'questions',
                            localField: 'listeningGameDetails.questions',
                            foreignField: '_id',
                            as: 'listeningGameQuestions'
                        }
                    },
                    {
                        $addFields: {
                            'readingDetails.readingGame': {
                                $mergeObjects: ['$readingGameDetails', { questions: '$readingGameQuestions' }]
                            },
                            'readingDetails.listeningGame': {
                                $mergeObjects: ['$listeningGameDetails', { questions: '$listeningGameQuestions' }]
                            }
                        }
                    },
                    {
                        $group: {
                            _id: '$_id',
                            title: { $first: '$title' },
                            order: { $first: '$order' },
                            type: { $first: '$type' },
                            games: { $push: '$readingDetails' }
                        }
                    },
                    {
                        $project: {
                            _id: 1,
                            title: 1,
                            order: 1,
                            type: 1,
                            games: 1
                        }
                    }
                ]);

                lesson = lesson[0]



            }
            else if (test.type == "ImageQuiz") {
                let data = await Lesson.findById(id).select("title order type imageQuiz").populate("imageQuiz")
                let { imageQuiz, ...rest } = data.toObject();
                lesson = {
                    ...rest,
                    games: imageQuiz
                };
            }
            else {
                lesson = await Lesson.findById(id).select("title order type games").populate({
                    path: 'games',
                    populate: {
                        path: 'questions',
                        model: 'Question',
                    },
                });
            }
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

        // Check if any modifications were made
        if (result.modifiedCount === 0) {
            return res.status(404).json({ message: 'Conversation not found or not modified' });
        }

        return res.status(200).json({ message: "Successfully deleted!!!", id: conversation_id });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Server error' });
    }
}

// const createLessonGame = async (req, res) => {
//     try {

//         const id = req.params.id
//         // Extract lesson data from the request body
//         const name = req.body.name;
//         const questions = req.body.questions;
//         const type = req.body.gameType
//         const grammarType = req.body.grammarType
//         console.log(req.body)

//         // Create questions and get their IDs
//         // const questionIds = await Promise.all(questions.map(async q => {
//         //     const { question, translation, options, answer, optionals } = q;

//         //     const newQuestion = new Question({
//         //         question,
//         //         translation,
//         //         options,
//         //         optionals,
//         //         answer,
//         //     });

//         //     const savedQuestion = await newQuestion.save();
//         //     return savedQuestion._id;
//         // }));

//         // const lesson = await Lesson.findById(id)
//         // if (!lesson) {
//         //     return res.status(404).json({ message: 'Lesson not found' });
//         // }


//         // const quiz = new Quiz({
//         //     name,
//         //     questions: questionIds,
//         //     type,
//         //     grammarType

//         // });
//         // const quizId = await quiz.save()
//         // //make lesson game array unique
//         // const unique = [...new Set([...lesson.games, quizId._id])];
//         // lesson.games = unique;
//         // await lesson.save();
//         // return res.status(200).json({ message: "Successfully added!!!" })

//     } catch (error) {
//         console.error('Error creating lesson:', error);
//         res.status(500).json({ message: 'Internal Server Error' });
//     }

// }
const createLessonGame = async (req, res) => {
    try {
        const id = req.params.id;
        const { name, gameType, grammarType } = req.body;
        const questions = JSON.parse(req.body.questions); // Parse the questions from the string

        // Assuming you've set up a way to handle file uploads, e.g., using multer
        const files = req.files;
        let index = 0;
        const questionIds = await Promise.all(questions.map(async (q) => {
            const { question, translation, translation2, options, answer, optionals } = q;

            const newQuestion = new Question({
                question,
                translation,
                translation2,
                options,
                optionals,
                answer,
            });

            if (q.image) {
                const imageFile = files[index] || null;

                if (imageFile) {
                    newQuestion.image = imageFile.filename; // Store the path to the image
                    index += 1
                }
            }

            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));

        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const quiz = new Quiz({
            name,
            questions: questionIds,
            type: gameType,
            grammarType
        });

        const savedQuiz = await quiz.save();

        // Make lesson game array unique
        const uniqueGames = [...new Set([...lesson.games, savedQuiz._id])];
        lesson.games = uniqueGames;
        await lesson.save();

        return res.status(200).json({ message: "Successfully added!!!" });

    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
const editGame = async (req, res) => {
    try {
        const quizId = req.params.quizId;
        const { name } = req.body;

        const questions = JSON.parse(req.body.questions); // Parse the questions from the string

        // Assuming you've set up a way to handle file uploads, e.g., using multer
        const files = req.files;


        const quizToEdit = await Quiz.findById(quizId)
        if (!quizToEdit) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        if (name) {
            quizToEdit.name = name;
        }

        // Get existing question IDs from the quiz
        const existingQuestionIds = quizToEdit.questions;
        let index = 0;
        // Process each updated question
        const updatedQuestionIds = await Promise.all(questions.map(async (q) => {
            // Check if q is already in existing questions
            const existingQuestionId = existingQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                const existingQuestion = await Question.findById(existingQuestionId)
                // update the non empty field only 
                if (q.question) existingQuestion.question = q.question;

                if (q.options) existingQuestion.options = q.options;
                if (q.optionals) existingQuestion.optionals = q.optionals;
                if (q.translation) existingQuestion.translation = q.translation;
                if (q.translation2) existingQuestion.translation2 = q.translation2;
                if (q.answer) existingQuestion.answer = q.answer;
                // also if image is updated then change the image of question also


                if (q.image) {
                    const imageFile = files[index] || null;

                    if (imageFile) {
                        existingQuestion.image = imageFile.filename; // Store the path to the image
                        index += 1
                    }
                }

                await existingQuestion.save();







                return existingQuestionId;
            } else {
                // Create a new question
                const { question, options, answer, optionals } = q;
                const newQuestion = new Question({
                    question,
                    options,
                    translation: q.translation,
                    translation2: q.translation2,
                    optionals,
                    answer: answer,
                });
                if (q.image) {
                    const imageFile = files[index] || null;
                    if (imageFile) {
                        newQuestion.image = imageFile.filename; // Store the path to the image
                        index += 1;
                    }
                }
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
const addReadingAndListening = async (req, res) => {
    try {
        const id = req.params.id;
        const { title, paragraph, type } = req.body;
        const readingGames = JSON.parse(req.body.readingGames)
        const listeningGames = JSON.parse(req.body.listeningGames)


        const audio = req?.file?.filename;
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }

        const questionIds = await Promise.all(readingGames.map(async q => {
            const { question, translation, hint, options, answer } = q;
            const newQuestion = new Question({
                question,
                translation,
                hint,
                options,
                answer: answer,
            });
            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));
        const quiz = new Quiz({
            name: "Reading",
            questions: questionIds,
            type,
            grammarType: "options"
        });
        const readingID = await quiz.save();


        const questionIds2 = await Promise.all(listeningGames.map(async q => {
            const { question, translation, hint, options, answer } = q;
            const newQuestion = new Question({
                question,
                translation,
                hint,
                options,
                answer: answer,
            });
            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));
        const quiz2 = new Quiz({
            name: "Listening",
            questions: questionIds2,
            type: "mcqs",
            grammarType: "options"
        });
        const listeningID = await quiz2.save();


        const reading = new Reading({
            title,
            paragraph,
            audio,
            readingGame: readingID._id,
            listeningGame: listeningID._id
        });
        await reading.save()
        lesson.reading.push(reading._id)
        await lesson.save();
        return res.status(200).json({ message: "Successfully added!!!" })
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }



}
const editReadingAndListening = async (req, res) => {
    // update the non empty data only
    try {
        const id = req.params.id;
        const { title, paragraph } = req.body;
        const readingGames = JSON.parse(req.body.readingGames)
        const listeningGames = JSON.parse(req.body.listeningGames)
        const audio = req?.file?.filename;
        const reading = await Reading.findById(id)
        if (!reading) {
            return res.status(404).json({ message: 'Reading not found' });
        }
        if (title) {
            reading.title = title;
        }
        if (paragraph) {
            reading.paragraph = paragraph;
        }
        if (audio) {
            reading.audio = audio;
        }

        const existingReadingQuestion = await Quiz.findById(reading.readingGame);
        const existingListeningQuestion = await Quiz.findById(reading.listeningGame);

        const existingReadingQuestionIds = existingReadingQuestion.questions;

        const existingListeningQuestionIds = existingListeningQuestion.questions;
        const updatedReadingQuestionIds = await Promise.all(readingGames.map(async (q) => {
            // Check if q is already in existing questions
            const existingQuestionId = existingReadingQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                const existingQuestion = await Question.findById(existingQuestionId)
                // update the non empty field only 
                if (q.question) existingQuestion.question = q.question;

                if (q.options) existingQuestion.options = q.options;

                if (q.translation) existingQuestion.translation = q.translation;
                if (q.hint) existingQuestion.hint = q.hint;
                if (q.answer) existingQuestion.answer = q.answer;

                await existingQuestion.save();

                return existingQuestionId;
            } else {
                // Create a new question
                const { question, options, hint, answer } = q;
                const newQuestion = new Question({
                    question,
                    options,
                    hint,
                    translation: q.translation,
                    answer: answer,
                });

                const savedQuestion = await newQuestion.save();
                return savedQuestion._id;
            }
        }));
        const updatedListeningQuestionIds = await Promise.all(listeningGames.map(async (q) => {
            // Check if q is already in existing questions
            const existingQuestionId = existingListeningQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                const existingQuestion = await Question.findById(existingQuestionId)
                // update the non empty field only 
                if (q.question) existingQuestion.question = q.question;

                if (q.options) existingQuestion.options = q.options;

                if (q.translation) existingQuestion.translation = q.translation;
                if (q.hint) existingQuestion.hint = q.hint;
                if (q.answer) existingQuestion.answer = q.answer;

                await existingQuestion.save();

                return existingQuestionId;
            } else {
                // Create a new question
                const { question, options, hint, answer } = q;
                const newQuestion = new Question({
                    question,
                    options,
                    hint,
                    translation: q.translation,
                    answer: answer,
                });

                const savedQuestion = await newQuestion.save();
                return savedQuestion._id;
            }
        }));

        const uniqueReadingQuestions = [...new Set([...existingReadingQuestionIds, ...updatedReadingQuestionIds])];
        existingReadingQuestion.questions = uniqueReadingQuestions
        await existingReadingQuestion.save();
        reading.readingGame = existingReadingQuestion._id;

        const uniqueListeningQuestions = [...new Set([...existingListeningQuestionIds, ...updatedListeningQuestionIds])];
        existingListeningQuestion.questions = uniqueListeningQuestions
        await existingListeningQuestion.save();

        reading.listeningGame = existingListeningQuestion._id;


        await reading.save()
        return res.status(200).json({ message: "Successfully added!!!" })
    } catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });

    }


}


const addImageQuiz = async (req, res) => {
    try {
        const id = req.params.id
        const { title } = req.body
        const gamesData = JSON.parse(req.body.games)

        const files = req.files
        const lesson = await Lesson.findById(id)
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        let index = 0;

        const games = await Promise.all(gamesData.map(async q => {
            const { questions } = q;
            const imageFile = files[index] || null;
            index += 1;
            return ({
                image: imageFile.filename,
                questions
            })
        }
        )

        )
        const imageQuiz = new ImageQuiz({
            title,
            games
        })

        await imageQuiz.save()
        lesson.imageQuiz = imageQuiz._id
        await lesson.save()
        return res.status(200).json({ message: "Successfully added!!!" })


    }
    catch (error) {
        console.error('Error creating lesson:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deleteLessonGame = async (req, res) => {
    try {
        const lessonId = req.params.id;
        const gameId = req.query.gameId;
        const gameType = req.query.gameType;
        let gameToDelete = {
            games: gameId
        }
        if (gameType == "Reading/Listening") {
            gameToDelete = {
                reading: gameId
            }
        }
        const updateLesson = await Lesson.updateOne({
            _id: lessonId
        }, {
            $pull: gameToDelete

        });
        if (updateLesson.modifiedCount === 0) {

            return res.status(404).json({ message: 'Game not found or not modified' });

        }

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
        const files = req.files;


        // Find the subject by ID
        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (files[0]) {

            conversation.audio = files[0].filename;
        }
        if (files[1]) {
            conversation.fastAudio = files[1].filename;

        }
        await conversation.save();
        return res.status(200).json({
            message: "Successfully added!!!",
            audio: conversation.audio,
            fastAudio: conversation.fastAudio
        })

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
        const { title, type } = req.body;
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
        const { title, type } = req.body
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
        const files = req.files
        const audio = files[0].filename
        const fastAudio = files[1].filename


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
            fastAudio,
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
        const conversations = JSON.parse(req.body.conversations)
        const files = req.files


        const conversation = await Conversation.findById(id);
        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        if (files[0]) {
            conversation.audio = files[0].filename;
        }
        if (files[1]) {
            conversation.fastAudio = files[1].filename;
        }
        if (title) {
            conversation.title = title;
        }

        for (const con of conversations) {
            const person1Item = await ConversationItem.findById(con.person1._id)
            if (!person1Item) {
                return res.status(404).json({ message: 'Conversation item not found' });
            }
            person1Item.name = con.person1.name;
            person1Item.text = con.person1.text;
            person1Item.translation = con.person1.translation;
            await person1Item.save();

            const person2Item = await ConversationItem.findById(con.person2._id)
            if (!person2Item) {
                return res.status(404).json({ message: 'Conversation item not found' });
            }
            person2Item.name = con.person2.name;
            person2Item.text = con.person2.text;
            person2Item.translation = con.person2.translation;
            await person2Item.save();

        }

        await conversation.save();

        return res.status(200).json({ message: 'Successfully updated!!!', conversations: conversations });
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

const addConversationBelow = async (req, res) => {
    try {
        const id = req.params.id;
        const conversation = JSON.parse(req.body.conversation);
        const index = req.body.index
        const conversationDoc = await Conversation.findById(id);

        if (!conversation) {
            return res.status(404).json({ message: 'Conversation not found' });
        }
        let conversationIds;

        const person1Item = new ConversationItem({
            name: conversation.person1.name,
            text: conversation.person1.text,
            translation: conversation.person1.translation,
        });
        const person2Item = new ConversationItem({
            name: conversation.person2.name,
            text: conversation.person2.text,
            translation: conversation.person2.translation,
        });
        await person1Item.save();
        await person2Item.save();
        conversationIds = {
            person1: person1Item._id,
            person2: person2Item._id
        };
        const updatedConversations = [
            ...conversationDoc.conversations.slice(0, index + 1),
            conversationIds,
            ...conversationDoc.conversations.slice(index + 1)
        ];
        conversationDoc.conversations = updatedConversations;
        await conversationDoc.save();

        //get current conversation
        const updatedConversation = await Conversation.findById(id).populate({
            path: 'conversations.person1',
            model: 'ConversationItem',
        }).populate({
            path: 'conversations.person2',
            model: 'ConversationItem',
        });

        // return the current conversation item



        return res.status(200).json({ conversation: updatedConversation.conversations[index + 1] })

    } catch (error) {
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



//update Activity
const updateActivity = async (req, res, next) => {
    try {
        const id = req.params.id;
        const { title } = req.body;
        //get coverImage
        const coverImage = req.file?.filename;

        // Find the subject by ID
        const activity = await Activity.findById(id);
        if (!activity) {
            return res.status(404).json({ message: 'Activity not found' });
        }
        activity.title = title;

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
const updateGamesOrder = async (req, res) => {
    try {
        const { games } = req.body;


        // Generate update operations for each subject
        const updateOperations = games.map(({ id, order }, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: order }
            }
        }));


        await Quiz.bulkWrite(updateOperations);
        const updatedGames = await Quiz.find({ _id: { $in: games.map(game => game.id) } }).populate(
            {
                path: 'questions',
                model: 'Question',
                select: "question options answer"
            }
        );

        // Check if games were found
        if (!updatedGames) {
            return res.status(404).json({ message: "Games not found" });
        }
        return res.status(200).json({ message: "Successfully updated games order", game: updatedGames });
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
        const { title } = req.body;
        //get coverImage
        const coverImage = req.file?.filename;

        // Find the subject by ID
        const lesson = await Lesson.findById(id);
        if (!lesson) {
            return res.status(404).json({ message: 'Lesson not found' });
        }
        lesson.title = title;
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


let uploadImage = upload.single('coverImage');
let audio = uploadAudio.single("audio")
let conversationAudio = uploadAudio.array("audio")


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
    addReadingAndListening,
    editReadingAndListening,
    addImageQuiz,
    addLesson,
    removeMaterial,
    getMaterialByLesson,
    updateActivity,
    updateActivitiesOrder,
    updateLessonsOrder,
    updateGamesOrder,
    deleteActivity,
    updateLesson,
    deleteLesson,
    addConversationBelow,
    uploadImage,
    audio,
    uploadFImage,
    uploadImageQuiz,
    conversationAudio

};