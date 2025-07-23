const Question = require("../models/Question")
const Quiz = require("../models/Quiz")
const Student = require("../models/Student")
const UseOfEnglish = require("../models/UseOFEnglish")
const { updateProgressAndAvgOfGame } = require("./ActivitiesController")



exports.create = async (req, res) => {
    try {
        const { level } = req.body
        const useOfEnglish = new UseOfEnglish({
            level
        })
        await useOfEnglish.save()
        res.status(201).json({ message: "Level created successfully" })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}
exports.editLevel = async (req, res) => {
    try {
        const { level } = req.params
        const newLevel = req.body.level
        const levelToEdit = await UseOfEnglish.findById(level)
        if (!levelToEdit) {
            return res.status(404).json({ message: "Level not found" })

        }
        levelToEdit.level = newLevel
        await levelToEdit.save()
        res.status(200).json({ message: "Level edited successfully" })
    } catch (err) {
        res.status(500).json({ error: err })

    }

}
exports.getLevels = async (req, res) => {
    try {
        const levels = await UseOfEnglish.find().select("level")
        res.status(200).json(levels)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}
exports.getGamesByLevel = async (req, res) => {
    try {
        const { level } = req.params
        const games = await UseOfEnglish.findById(level).populate({
            path: "games",
            populate: {
                path: "questions",
                model: "Question",
            }
        })
        res.status(200).json(games)
    } catch (err) {
        res.status(500).json({ error: err })
    }
}
exports.addGames = async (req, res) => {
    try {
        const { level } = req.params
        const { name, gameType } = req.body;
        const questions = JSON.parse(req.body.questions);
        const useOfEnglish = await UseOfEnglish.findById(level)
        if (!useOfEnglish) {
            return res.status(404).json({ message: "Level not found" })
        }
        const questionIds = await Promise.all(questions.map(async (q) => {
            const { question, translation, translation2, options, answer,hint, optionals } = q;

            const newQuestion = new Question({
                question,
                translation,
                translation2,
                options,
                optionals,
                hint,
                answer,
            });

            const savedQuestion = await newQuestion.save();
            return savedQuestion._id;
        }));

        const quiz = new Quiz({
            name,
            questions: questionIds,
            type: gameType,

        });

        const savedQuiz = await quiz.save();
        const uniqueGames = [...new Set([...useOfEnglish.games, savedQuiz._id])];

        useOfEnglish.games = uniqueGames


        await useOfEnglish.save()
        res.status(201).json({ message: "Game added successfully" })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

exports.editGame = async (req, res) => {
    try {
        const { game } = req.params;
        const { name, gameType } = req.body;
        const questions = JSON.parse(req.body.questions);
        const quizToEdit = await Quiz.findById(game);
        if (!quizToEdit) {
            return res.status(404).json({ message: "Game not found" });
        }

        if (name) {
            quizToEdit.name = name;
        }
        if (gameType) {
            quizToEdit.type = gameType;
        }
        const existingQuestionIds = quizToEdit.questions;
        const updatedQuestionIds = await Promise.all(questions.map(async (q) => {
            // Check if q is already in existing questions
            const existingQuestionId = existingQuestionIds.find(id => id == q._id);

            if (existingQuestionId) {
                // Update the existing question
                const existingQuestion = await Question.findById(existingQuestionId)
              
                // update the non empty field only 
                existingQuestion.question = q.question;

                existingQuestion.options = q.options;
                existingQuestion.optionals = q.optionals;
                existingQuestion.translation = q.translation;
                existingQuestion.translation2 = q.translation2;
                existingQuestion.answer = q.answer;
                existingQuestion.hint = q.hint;


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
                    hint: q.hint,
                    optionals,
                    answer: answer,
                });

                const savedQuestion = await newQuestion.save();
                return savedQuestion._id;
            }
        }));

        const unique = [...new Set([...existingQuestionIds, ...updatedQuestionIds])];
        quizToEdit.questions = unique;
        await quizToEdit.save();
        res.status(201).json({ message: "Game edited successfully" });
    } catch (err) {
        res.status(500).json({ error: err });
    }
}

exports.deleteGame = async (req, res) => {
    try {
        const { level } = req.params;
        const { games } = req.body;
        const useOfEnglish = await UseOfEnglish.findById(level)
        if (!useOfEnglish) {
            return res.status(404).json({ message: "Level not found" })
        }
        const index = useOfEnglish.games.indexOf(games);
        if (index > -1) {
            useOfEnglish.games.splice(index, 1);
        }
        await useOfEnglish.save()

        res.status(200).json({ message: "Game deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: err })
    }

}

exports.deleteLevel = async (req, res) => {
    try {
        const { level } = req.params
        const levelToDelete = await UseOfEnglish.findOneAndDelete({ level })
        if (!levelToDelete) {
            return res.status(404).json({ message: "Level not found" })
        }
        res.status(200).json({ message: "Level deleted successfully" })
    } catch (err) {
        res.status(500).json({ error: err })
    }
}

exports.updateGamesOrder = async (req, res) => {
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
                select: "question options answer translation translation2"
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


exports.getProgress = async (req, res) => {
    try {
        const { studentId } = req.body
        const student = await Student.findById(studentId)
            .select("useOfEnglish")
            .populate({
                path: "useOfEnglish",
                select: "games progress",
                populate: {
                    path: "games",

                    select: "progress",
                    model: "Quiz"

                }

            })
        if (!student) {
            return res.status(404).json({ message: "Student not found" })
        }

        student.useOfEnglish.forEach(async (level) => {
            level.games.forEach(async game => {
                await updateProgressAndAvgOfGame(game._id, studentId)
            })
            let progressObj = {
                studentId,
                progress: 0,
                avg: 0,
                status: "Not Started"
            }
            let totalAvg = 0;
            let totalProgress = 0;
            let count = 0;
            let progCount = 0;
            level?.games.forEach(game => {
                let progress = game?.progress?.find(item => item?.studentId.toString() === studentId.toString());

                if (progress) {
                    totalAvg += progress.avg;
                    totalProgress += progress.progress;
                    if (progress.avg > 0) {

                        count++;
                    }
                    progCount++;
                }
            });

            progressObj.avg = count > 0 ? Math.round(totalAvg / count) : 0;
            progressObj.progress = progCount > 0 ? Math.round(totalProgress / progCount) : 0;
            progressObj.status = progressObj.progress > 0 ? progressObj.progress == 100 ? "Completed" : "In Progress" : "Not Started";
            let existingProgress = level.progress.find(item => item.studentId.toString() === studentId.toString());
            if (existingProgress) {
                existingProgress.avg = progressObj.avg;
                existingProgress.progress = progressObj.progress;
                existingProgress.status = progressObj.status;
            } else {
                level.progress.push(progressObj);
            }
            await level.save();


        })

        res.status(200).json({ message: "Progress updated successfully" })



    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: err })
    }
}



