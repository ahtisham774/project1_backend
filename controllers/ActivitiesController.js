const Subject = require('../models/Subject')
const Student = require('../models/Student')
const Activity = require('../models/Activities')
const Lesson = require('../models/Lesson')
const Conversation = require('../models/Conversation')
const ConversationItem = require('../models/ConversationItem')
const Question = require('../models/Question')
const Quiz = require('../models/Quiz')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const Reading = require('../models/Reading')
const mongoose = require('mongoose')
const ImageQuiz = require('../models/ImageQuiz')
const Score = require('../models/Score')
const Level = require('../models/Levels')
const WatchTime = require('../models/WatchTime')

// Set up multer storage for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/activities')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  }
})

const storage1 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/flashcards')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  }
})
const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/imageQuiz')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  }
})
const audioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/audio')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    )
  }
})

const uploadAudio = multer({ storage: audioStorage })

const upload = multer({ storage: storage })
const uploadFlashCardsImages = multer({ storage: storage1 })
const uploadFImage = uploadFlashCardsImages.array('image')
const uploadImageQuiz = multer({ storage: storage2 }).array('image')
// Middleware function to fetch a subject by ID and attach it to the request object
const getAllActivities = async (req, res, next) => {
  try {
    const { studentId } = req.body

    let subject = await Subject.findOne({ _id: req.params.id })
      .select('subject activities')
      .populate({
        path: 'activities',
        select: {
          title: 1,
          type: 1,
          coverImage: 1,
          order: 1,

          // Ensure that progress array is filtered to include only the student's progress
          progress: { $elemMatch: { studentId: studentId } }
        }
        // Exclude the 'activities' field
      })
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // // filter the progress of student
    // let activitiesScores = subject.activities.map(item => {
    //     return item.progress.find(f => f.studentId == studentId)?.progress || 0
    // })

    // let average = 0
    // if (activitiesScores.length > 0) {

    //     average = Math.floor(activitiesScores.reduce((acc, score) => acc + score, 0) / activitiesScores.length)
    // }
    // let progress = {
    //     studentId: studentId,
    //     progress: average,
    //     status: average === 100 ? "Completed" : "In Progress"
    // }
    // if (subject.progress) {
    //     let avg = subject.progress.find(item => item.studentId == progress.studentId)
    //     if (avg) {
    //         avg.progress = progress.progress
    //         avg.status = progress.status
    //     }
    //     else {
    //         subject.progress.push(progress)
    //     }
    // }
    // else {
    //     subject.progress = [progress]
    // }

    // await subject.save()

    return res.status(200).json(subject)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateProgressAndAvgOfGame = async (gameId, studentId) => {
  try {
    const games = await Quiz.findById(gameId)
      .select('progress')
      .populate('progress')

    let progress = games?.progress?.find(item => item?.studentId == studentId)
    const score = await Score.findOne({
      quizId: gameId
    })
    let studentScores =
      score?.records?.filter(item => item?.studentId == studentId) || []

    let studentRecord = {
      progress: 0,
      avg: 0,
      status: 'Not Started'
    }
    if (studentScores?.length > 0) {
      studentRecord.avg = Math.round(
        studentScores.reduce(
          (acc, rec) =>
            acc + Math.round((rec.score / rec.answers.length) * 100),
          0
        ) / studentScores.length
      )
      let highestScore =
        (studentScores.reduce(
          (acc, rec) => (acc > rec.score ? acc : rec.score),
          0
        ) *
          100) /
        studentScores[0].answers.length
      studentRecord.progress = highestScore >= 80 ? 100 : 0
      studentRecord.status = highestScore >= 80 ? 'Completed' : 'In Progress'
    }

    if (progress) {
      progress.progress = studentRecord.progress
      progress.avg = studentRecord.avg
      progress.status = studentRecord.status
    } else {
      games.progress.push({
        studentId: studentId,
        progress: studentRecord.progress,
        avg: studentRecord.avg,
        status: studentRecord.status
      })
    }
    await games.save()
  } catch (error) {
    console.error(error)
  }
}

// const updateProgressAndAvgOfReading = async (gameId, studentId) => {
//     try {

//         const games = await Reading.findById(gameId).select("progress readingGame listeningGame").populate("progress")
//         let progress = games?.progress?.find(item => item?.studentId == studentId)
//         const readingGameScores = await Promise.all([games.readingGame, games.listeningGame].map(async (game) => {
//             const records = await Score.findOne({
//                 quizId: game,
//             }).select("records")

//             let averageScore = 0
//             let studentRecords = records?.records?.filter(item => item.studentId == studentId) || []

//             if (studentRecords?.length > 0) {
//                 // averageScore = Math.round(studentRecords.reduce((acc, rec) => acc + rec.score, 0))
//                 averageScore = Math.round(studentRecords.reduce((acc, rec) => acc + rec.score, 0) / studentRecords.length)

//             }
//             return averageScore
//         })
//         )

//         let average = Math.round(readingGameScores.reduce((acc, score) => acc + score, 0) / readingGameScores.length)
//         // let highestScore = readingGameScores.reduce((acc, rec) => acc > rec.score ? acc : rec.score, 0) * 100 / 4
//         let highestScore = readingGameScores.reduce((acc, score) => acc > score ? acc : score, 0) * 100 / 4

//         let studentRecord = {
//             progress: 0,
//             avg: 0,
//             status: "Not Started"
//         }
//         if (readingGameScores?.length > 0) {
//             studentRecord.avg = average
//             studentRecord.progress =
//                 highestScore >= 80 ? 100 : 0
//             studentRecord.status = highestScore >= 80 ? "Completed" : "In Progress"
//         }
//         if (progress) {
//             progress.progress = studentRecord.progress
//             progress.avg = studentRecord.avg
//             progress.status = studentRecord.status
//         }
//         else {
//             games.progress.push(
//                 {
//                     studentId: studentId,
//                     progress: studentRecord.progress,
//                     avg: studentRecord.avg,
//                     status: studentRecord.status
//                 }
//             )
//         }
//         await games.save()
//     }
//     catch (error) {
//         console.error(error)
//     }
// }
const getQuizResult = async (quizId, studentId) => {
  // Fetch the records for the given quizId
  const scoreRecord = await Score.findOne({ quizId }).select('records')

  let averageScore = 0

  let studentRecords =
    scoreRecord?.records?.filter(item => item.studentId == studentId) || []

  return studentRecords
}

const calculateCombinedScore = (readingGameResult, listeningGameResult) => {
  // Ensure the lengths of both arrays are the same (if not, handle accordingly)
  const maxLength = Math.max(
    readingGameResult.length,
    listeningGameResult.length
  )

  let combinedScores = []

  for (let i = 0; i < maxLength; i++) {
    const readingScore = readingGameResult[i] ? readingGameResult[i].score : 0 // Fallback to 0 if no score
    const listeningScore = listeningGameResult[i]
      ? listeningGameResult[i].score
      : 0 // Fallback to 0 if no score

    // Sum the reading and listening scores of the corresponding attempt
    const totalScoreForAttempt = readingScore + listeningScore

    // Store the total score for this attempt
    combinedScores.push(totalScoreForAttempt)
  }

  // Return the combined score array for further processing
  return combinedScores
}

const updateProgressAndAvgOfReading = async (gameId, studentId) => {
  try {
    const games = await Reading.findById(gameId)
      .select('progress readingGame listeningGame')
      .populate('progress')
    const readingGameResult = await getQuizResult(games.readingGame, studentId)
    const listeningGameResult = await getQuizResult(
      games.listeningGame,
      studentId
    )
    const combinedScores = calculateCombinedScore(
      readingGameResult,
      listeningGameResult
    ).map(score => Math.round((score / 8) * 100))
    const avg = Math.round(
      combinedScores.reduce((acc, score) => acc + score, 0) /
        combinedScores.length
    )
    const highestScore = Math.max(...combinedScores)
    const progress = games?.progress?.find(item => item?.studentId == studentId)
    if (progress) {
      progress.progress = highestScore >= 80 ? 100 : 0
      progress.avg = avg || 0
      progress.status = highestScore >= 80 ? 'Completed' : 'In Progress'
    } else {
      games.progress.push({
        studentId: studentId,
        progress: highestScore >= 80 ? 100 : 0,
        avg: avg || 0,
        status: highestScore >= 80 ? 'Completed' : 'In Progress'
      })
    }
    await games.save()
    return games.progress.find(item => item.studentId == studentId)
  } catch (error) {
    console.error('Error updating progress:', error)
  }
}

const getReadingGameProgress = async (req, res) => {
  try {
    const { studentId, gameId } = req.body
    const student = await Student.findById(studentId)
    const progress = await updateProgressAndAvgOfReading(gameId, studentId)
    return res.status(200).json(progress)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const getProgressOfLesson = async (lessonId, studentId) => {
  let lesson = await Lesson.findById(lessonId).select(
    'conversation games reading'
  )
  let progress = 0
  if (lesson.conversation) {
    let conversation = await Conversation.findById(lesson.conversation)
    let records =
      conversation.records.filter(item => item.studentId == studentId) || []

    if (records.length > 0) {
      progress +=
        records.reduce((acc, record) => acc + record.score, 0) / records.length
    }
  }
  if (lesson.games.length > 0) {
    let games = await Promise.all(
      lesson.games.map(async game => {
        const records = await Score.findOne({
          quizId: game
        }).select('records')
        let averageScore = 0
        let studentRecords =
          records.records.filter(item => item.studentId == studentId) || []
        if (studentRecords?.length > 0) {
          averageScore = Math.round(
            studentRecords.reduce(
              (acc, rec) =>
                acc + Math.round((rec.score / rec.answers.length) * 100),
              0
            ) / studentRecords.length
          )
        }
        return averageScore
      })
    )

    let average = games.reduce((acc, score) => acc + score, 0) / games.length
    progress += average
  }
  if (lesson.reading.length > 0) {
    let scores = await Promise.all(
      lesson.reading.map(async reading => {
        const readingGame = await Reading.findById(reading)
        const readingGameScores = await Promise.all(
          [readingGame.readingGame, readingGame.listeningGame].map(
            async game => {
              const records = await Score.findOne({
                quizId: game
              }).select('records')

              let averageScore = 0
              let studentRecords =
                records.records.filter(item => item.studentId == studentId) ||
                []
              if (studentRecords?.length > 0) {
                averageScore = Math.round(
                  studentRecords.reduce(
                    (acc, rec) =>
                      acc + Math.round((rec.score / rec.answers.length) * 100),
                    0
                  ) / studentRecords.length
                )
              }
              return averageScore
            }
          )
        )

        let average =
          readingGameScores.reduce((acc, score) => acc + score, 0) /
          readingGameScores.length
        return average
      })
    )

    let average = scores.reduce((acc, score) => acc + score, 0) / scores.length
    // console.log("Average of ",lesson.type," = ",average)
    progress = average
  }
  return Math.round(progress)
}

//middleware function to return content list of activities of give id
const getActivitiesContentById = async (req, res, next) => {
  try {
    const id = req.params.id
    const { required, studentId } = req.body
    let activity
    if (required === 'lessons') {
      //get get lesson from activity and populate it and select title description and coverImage from lesson
      activity = await Activity.findById(id)
        .select('title type lessons')
        .populate({
          path: 'lessons',
          select: {
            title: 1,
            description: 1,
            coverImage: 1,
            order: 1,
            progress: {
              $elemMatch: { studentId: studentId }
            }
          }
        })
    } else if (required === 'homeworks') {
      activity = await Activity.findById(id).select('title type homeworks')
    }

    if (!activity) {
      return res.status(404).json({ message: 'Activities not found' })
    }

    // console.log(activity.lessons)
    // // filter the progress of student
    // let lessonScores = activity.lessons.map(item => {
    //     return item?.progress?.find(f => f.studentId == studentId)?.progress || 0
    // })

    // let average = 0
    // if (lessonScores.length > 0) {

    //     average = Math.floor(lessonScores.reduce((acc, score) => acc + score, 0) / lessonScores.length)
    // }
    // let progress = {
    //     studentId: studentId,
    //     progress: average,
    //     status: average === 100 ? "Completed" : "In Progress"
    // }
    // if (activity.progress) {
    //     let avg = activity.progress.find(item => item.studentId == progress.studentId)
    //     if (avg) {
    //         avg.progress = progress.progress
    //         avg.status = progress.status
    //     }
    //     else {
    //         activity.progress.push(progress)
    //     }
    // }
    // else {
    //     activity.progress = [progress]
    // }

    // await activity.save()

    return res.status(200).json(activity)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

//getMaterialByLesson
const getMaterialByLesson = async (req, res, next) => {
  try {
    const id = req.params.id
    const { required, studentId } = req.body

    let avg = 0
    let lesson
    if (required === 'materials') {
      //get get lesson from activity and populate it and select title description and coverImage from lesson
      lesson = await Lesson.findById(id).select('title order type materials')
    } else if (required === 'game') {
      let test = await Lesson.findById(id).select('type')

      if (test.type == 'Reading/Listening') {
        lesson = await Lesson.findById(id)
          .select('title order type reading')

          .populate({
            path: 'reading',
            select: {
              title: 1,
              order: 1,
              readingGame: 1,
              listeningGame: 1,
              paragraph: 1,
              audio: 1,
              progress: {
                $elemMatch: { studentId: studentId }
              }
            },
            populate: {
              path: 'readingGame',
              populate: {
                path: 'questions',
                model: 'Question'
              }
            }
          })
          .populate({
            path: 'reading',
            select: {
              title: 1,
              order: 1,
              readingGame: 1,
              listeningGame: 1,
              paragraph: 1,
              audio: 1,
              progress: {
                $elemMatch: { studentId: studentId }
              }
            },
            populate: {
              path: 'listeningGame',
              populate: {
                path: 'questions',
                model: 'Question'
              }
            }
          })

        // lesson.reading.forEach(async game => {
        //     await updateProgressAndAvgOfReading(game._id, studentId)
        // })
      } else if (test.type == 'ImageQuiz') {
        let data = await Lesson.findById(id)
          .select('title order type imageQuiz')
          .populate('imageQuiz')
        let { imageQuiz, ...rest } = data.toObject()
        lesson = {
          ...rest,
          games: imageQuiz
        }
      } else {
        lesson = await Lesson.findById(id)
          .select('title order type games')
          .populate({
            path: 'games',
            populate: {
              path: 'questions',
              model: 'Question'
            },
            select: {
              name: 1,
              questions: 1,
              type: 1,
              grammarType: 1,
              hint:1,
              order: 1,
              explanation: 1,
              progress: {
                $elemMatch: { studentId: studentId }
              }
            }
          })

        // lesson.games.forEach(async game => {
        //     await updateProgressAndAvgOfGame(game._id, studentId)
        // })
        // let totalAvg = 0;
        // let totalProgress = 0;
        // let count = 0;

        // lesson?.games.forEach(game => {
        //     let progress = game?.progress?.find(item => item?.studentId.toString() === studentId.toString());

        //     if (progress) {
        //         totalAvg += progress.avg;
        //         totalProgress += progress.progress;
        //         count++;
        //     }
        // });

        // let avgOfAvg = count > 0 ? totalAvg / count : 0;
        // let avgOfProgress = count > 0 ? totalProgress / count : 0;
        // let lessonProgress = {
        //     studentId: studentId,
        //     progress: avgOfProgress,
        //     avg: avgOfAvg,
        //     status: avgOfProgress === 100 ? "Completed" : "In Progress"
        // }

        // if (lesson.progress) {
        //     let avg = lesson.progress.find(item => item.studentId == lessonProgress.studentId)
        //     if (avg) {
        //         avg.progress = lessonProgress.progress
        //         avg.avg = lessonProgress.avg
        //         avg.status = lessonProgress.status
        //     }
        //     else {
        //         lesson.progress.push(lessonProgress)
        //     }
        // }
        // else {
        //     lesson.progress = [lessonProgress]
        // }
        // await lesson.save()
      }
    } else if (required === 'conversation') {
      lesson = await Lesson.findById(id)
        .select('type conversation')
        .populate({
          path: 'conversation',
          populate: {
            path: 'conversations.person1 conversations.person2',
            model: 'ConversationItem'
          }
        })
    }

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // let score = await getProgressOfLesson(lesson._id, studentId)

    // let progress = {
    //     studentId: studentId,
    //     progress: score,
    //     status: score === 100 ? "Completed" : "In Progress"
    // }
    // if (lesson.progress) {
    //     let avg = lesson.progress.find(item => item.studentId == progress.studentId)
    //     if (avg) {
    //         avg.progress = progress.progress
    //         avg.status = progress.status
    //     }
    //     else {
    //         lesson.progress.push(progress)
    //     }
    // }
    // else {
    //     lesson.progress = [progress]
    // }

    // await lesson.save()

    return res.status(200).json(lesson)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteConversation = async (req, res) => {
  try {
    const conversationId = req.params.id
    const { conversation_id } = req.body
    // Use the $pull operator to remove the conversation by ID from the array
    const result = await Conversation.updateOne(
      { _id: conversationId },
      { $pull: { conversations: { _id: conversation_id } } }
    )

    // Check if any modifications were made
    if (result.modifiedCount === 0) {
      return res
        .status(404)
        .json({ message: 'Conversation not found or not modified' })
    }

    return res
      .status(200)
      .json({ message: 'Successfully deleted!!!', id: conversation_id })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
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
    const id = req.params.id
    const { name, explanation, gameType, grammarType } = req.body
    const questions = JSON.parse(req.body.questions) // Parse the questions from the string

    // Assuming you've set up a way to handle file uploads, e.g., using multer
    const files = req.files
    let index = 0
    const questionIds = await Promise.all(
      questions.map(async q => {
        const {
          question,
          translation,
          translation2,
          options,
          answer,
          hint,
          optionals
        } = q

        const newQuestion = new Question({
          question,
          translation,
          translation2,
          options,
          hint,
          optionals,
          answer
        })

        if (q.image) {
          const imageFile = files[index] || null

          if (imageFile) {
            newQuestion.image = imageFile.filename // Store the path to the image
            index += 1
          }
        }

        const savedQuestion = await newQuestion.save()
        return savedQuestion._id
      })
    )

    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    const quiz = new Quiz({
      name,
      explanation,
      questions: questionIds,
      type: gameType,
      grammarType
    })

    const savedQuiz = await quiz.save()

    // Make lesson game array unique
    const uniqueGames = [...new Set([...lesson.games, savedQuiz._id])]
    lesson.games = uniqueGames
    await lesson.save()

    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
const editGame = async (req, res) => {
  try {
    const quizId = req.params.quizId
    const { name, explanation } = req.body

    const questions = JSON.parse(req.body.questions) // Parse the questions from the string

    // Assuming you've set up a way to handle file uploads, e.g., using multer
    const files = req.files

    const quizToEdit = await Quiz.findById(quizId)
    if (!quizToEdit) {
      return res.status(404).json({ message: 'Quiz not found' })
    }
    if (name) {
      quizToEdit.name = name
    }

    quizToEdit.explanation = explanation

    // Get existing question IDs from the quiz
    const existingQuestionIds = quizToEdit.questions
    let index = 0
    // Process each updated question
    const updatedQuestionIds = await Promise.all(
      questions.map(async q => {
        // Check if q is already in existing questions
        const existingQuestionId = existingQuestionIds.find(id => id == q._id)

        if (existingQuestionId) {
          // Update the existing question
          const existingQuestion = await Question.findById(existingQuestionId)
          // update the non empty field only
          existingQuestion.question = q.question

          existingQuestion.options = q.options
          existingQuestion.hint = q.hint
          existingQuestion.optionals = q.optionals
          existingQuestion.translation = q.translation
          existingQuestion.translation2 = q.translation2
          existingQuestion.answer = q.answer
          // also if image is updated then change the image of question also

          if (q.image) {
            const imageFile = files[index] || null

            if (imageFile) {
              existingQuestion.image = imageFile.filename // Store the path to the image
              index += 1
            }
          }

          await existingQuestion.save()

          return existingQuestionId
        } else {
          // Create a new question
          const { question, options, answer, optionals } = q
          const newQuestion = new Question({
            question,
            options,
            translation: q.translation,
            translation2: q.translation2,
            optionals,
            answer: answer
          })
          if (q.image) {
            const imageFile = files[index] || null
            if (imageFile) {
              newQuestion.image = imageFile.filename // Store the path to the image
              index += 1
            }
          }
          const savedQuestion = await newQuestion.save()
          return savedQuestion._id
        }
      })
    )

    // Make the quiz's questions array unique
    const unique = [...new Set([...existingQuestionIds, ...updatedQuestionIds])]
    quizToEdit.questions = unique
    await quizToEdit.save()

    res.status(200).json({ message: 'Questions successfully edited' })
  } catch (error) {
    console.error('Error editing questions:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
const addReadingAndListening = async (req, res) => {
  try {
    const id = req.params.id
    const { title, paragraph, type } = req.body
    const readingGames = JSON.parse(req.body.readingGames)
    const listeningGames = JSON.parse(req.body.listeningGames)

    const audio = req?.file?.filename
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    const questionIds = await Promise.all(
      readingGames.map(async q => {
        const { question, translation, hint, options, answer } = q
        const newQuestion = new Question({
          question,
          translation,
          hint,
          options,
          answer: answer
        })
        const savedQuestion = await newQuestion.save()
        return savedQuestion._id
      })
    )
    const quiz = new Quiz({
      name: 'Reading',
      questions: questionIds,
      type,
      grammarType: 'options'
    })
    const readingID = await quiz.save()

    const questionIds2 = await Promise.all(
      listeningGames.map(async q => {
        const { question, translation, hint, options, answer } = q
        const newQuestion = new Question({
          question,
          translation,
          hint,
          options,
          answer: answer
        })
        const savedQuestion = await newQuestion.save()
        return savedQuestion._id
      })
    )
    const quiz2 = new Quiz({
      name: 'Listening',
      questions: questionIds2,
      type: 'mcqs',
      grammarType: 'options'
    })
    const listeningID = await quiz2.save()

    const reading = new Reading({
      title,
      paragraph,
      audio,
      readingGame: readingID._id,
      listeningGame: listeningID._id
    })
    await reading.save()
    lesson.reading.push(reading._id)
    await lesson.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}
const editReadingAndListening = async (req, res) => {
  // update the non empty data only
  try {
    const id = req.params.id
    const { title, paragraph } = req.body
    const readingGames = JSON.parse(req.body.readingGames)
    const listeningGames = JSON.parse(req.body.listeningGames)
    const audio = req?.file?.filename
    const reading = await Reading.findById(id)
    if (!reading) {
      return res.status(404).json({ message: 'Reading not found' })
    }
    if (title) {
      reading.title = title
    }
    if (paragraph) {
      reading.paragraph = paragraph
    }
    if (audio) {
      reading.audio = audio
    }

    const existingReadingQuestion = await Quiz.findById(reading.readingGame)
    const existingListeningQuestion = await Quiz.findById(reading.listeningGame)

    const existingReadingQuestionIds = existingReadingQuestion.questions

    const existingListeningQuestionIds = existingListeningQuestion.questions
    const updatedReadingQuestionIds = await Promise.all(
      readingGames.map(async q => {
        // Check if q is already in existing questions
        const existingQuestionId = existingReadingQuestionIds.find(
          id => id == q._id
        )

        if (existingQuestionId) {
          // Update the existing question
          const existingQuestion = await Question.findById(existingQuestionId)
          // update the non empty field only
          if (q.question) existingQuestion.question = q.question

          if (q.options) existingQuestion.options = q.options

          existingQuestion.translation = q.translation
          existingQuestion.hint = q.hint
          existingQuestion.answer = q.answer

          await existingQuestion.save()

          return existingQuestionId
        } else {
          // Create a new question
          const { question, options, hint, answer } = q
          const newQuestion = new Question({
            question,
            options,
            hint,
            translation: q.translation,
            answer: answer
          })

          const savedQuestion = await newQuestion.save()
          return savedQuestion._id
        }
      })
    )
    const updatedListeningQuestionIds = await Promise.all(
      listeningGames.map(async q => {
        // Check if q is already in existing questions
        const existingQuestionId = existingListeningQuestionIds.find(
          id => id == q._id
        )

        if (existingQuestionId) {
          // Update the existing question
          const existingQuestion = await Question.findById(existingQuestionId)
          // update the non empty field only
          if (q.question) existingQuestion.question = q.question

          if (q.options) existingQuestion.options = q.options

          existingQuestion.translation = q.translation
          if (q.hint) existingQuestion.hint = q.hint
          if (q.answer) existingQuestion.answer = q.answer

          await existingQuestion.save()

          return existingQuestionId
        } else {
          // Create a new question
          const { question, options, hint, answer } = q
          const newQuestion = new Question({
            question,
            options,
            hint,
            translation: q.translation,
            answer: answer
          })

          const savedQuestion = await newQuestion.save()
          return savedQuestion._id
        }
      })
    )

    const uniqueReadingQuestions = [
      ...new Set([...existingReadingQuestionIds, ...updatedReadingQuestionIds])
    ]
    existingReadingQuestion.questions = uniqueReadingQuestions
    await existingReadingQuestion.save()
    reading.readingGame = existingReadingQuestion._id

    const uniqueListeningQuestions = [
      ...new Set([
        ...existingListeningQuestionIds,
        ...updatedListeningQuestionIds
      ])
    ]
    existingListeningQuestion.questions = uniqueListeningQuestions
    await existingListeningQuestion.save()

    reading.listeningGame = existingListeningQuestion._id

    await reading.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ message: 'Internal Server Error' })
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
      return res.status(404).json({ message: 'Lesson not found' })
    }
    let index = 0

    const games = await Promise.all(
      gamesData.map(async q => {
        const { questions } = q
        const imageFile = files[index]
        console.log(imageFile)
        index += 1
        return {
          image: imageFile.filename,
          questions
        }
      })
    )
    const imageQuiz = new ImageQuiz({
      title,
      games
    })

    await imageQuiz.save()
    lesson.imageQuiz.push(imageQuiz._id)
    await lesson.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const editImageQuiz = async (req, res) => {
  try {
    const id = req.params.id
    const { title } = req.body
    const gamesData = JSON.parse(req.body.games)

    const files = req.files

    let index = 0
    const imageQuiz = await ImageQuiz.findById(id)

    if (!imageQuiz) {
      return res.status(404).json({ message: 'Image Quiz not found' })
    }
    if (title) {
      imageQuiz.title = title
    }
    // get the existing questions and compare if image is not null them update it otherwise not
    const existingGames = imageQuiz.games
    console.log(existingGames)
    const updatedGames = await Promise.all(
      gamesData.map(async q => {
        const existingGame = existingGames.find(game => game._id == q._id)
        if (existingGame) {
          const imageFile = files[index]
          if (imageFile) {
            existingGame.image = imageFile.filename
          }
          index += 1
          existingGame.questions = q.questions

          return existingGame
        } else {
          const imageFile = files[index]
          index += 1
          return {
            image: imageFile.filename,
            questions: q.questions
          }
        }
      })
    )
    imageQuiz.games = updatedGames
    await imageQuiz.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error('Error creating lesson:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const addGamesResult = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId, answers, score, start_time, end_time } = req.body

    const game = await Quiz.findById(id)
    if (!game) {
      return res.status(404).json({ message: 'Quiz not found!' })
    }
    const student = await Student.findById(studentId)
    if (!student) {
      return res.status(404).json({ message: 'Student Not Found!' })
    }
    let result = await Score.findOne({ quizId: id })
    const record = {
      studentId,
      studentName: student.firstName + ' ' + student.lastName,
      answers,
      score,
      start_time,
      end_time
    }
    if (!result) {
      result = new Score({
        quizId: id,
        records: [record]
      })
    } else {
      result.records.push(record)
    }

    await result.save()
    return res.status(200).json({ message: 'Result Save Successfully' })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getGamesResults = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    let quiz
    console.log(studentId)
    quiz = await Score.findOne({
      quizId: id
    })
    if (studentId) {
      quiz.records = quiz.records.filter(item => item.studentId == studentId)
    }

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }

    return res.status(200).json(quiz.records)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const getLastGamesResults = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    let quiz = await Score.findOne({
      quizId: id
    })
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }
    const studentRecords = quiz.records
      .filter(record => record.studentId == studentId)
      .sort((a, b) => new Date(b.date_created) - new Date(a.date_created))

    // Get the latest record, if exists
    const latestRecord = studentRecords[0] || null

    return res.status(200).json(latestRecord)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteLessonGame = async (req, res) => {
  try {
    const lessonId = req.params.id
    const gameId = req.query.gameId
    const gameType = req.query.gameType
    let gameToDelete = {
      games: gameId
    }
    if (gameType == 'Reading/Listening') {
      gameToDelete = {
        reading: gameId
      }
    }
    const updateLesson = await Lesson.updateOne(
      {
        _id: lessonId
      },
      {
        $pull: gameToDelete
      }
    )
    if (updateLesson.modifiedCount === 0) {
      return res.status(404).json({ message: 'Game not found or not modified' })
    }

    return res.status(200).json({ message: 'Successfully deleted!!!' })
  } catch (err) {
    console.error('Error deleting game:', err)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

const updateConversationAudio = async (req, res) => {
  try {
    const id = req.params.id
    const { type } = req.body
    //get coverImage
    console.log(type)
    const files = req.files

    // Find the subject by ID
    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    if (type == 'slow') {
      conversation.audio = files[0].filename
    }
    if (type == 'fast') {
      conversation.fastAudio = files[0].filename
    }
    await conversation.save()
    return res.status(200).json({
      message: 'Successfully added!!!',
      audio: conversation.audio,
      fastAudio: conversation.fastAudio
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// Middleware function to create a new subject
const createActivities = async (req, res, next) => {
  try {
    const id = req.params.id
    const { title, type } = req.body
    //get coverImage
    const coverImage = req.file.filename

    // Find the subject by ID
    const subject = await Subject.findById(id)

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' })
    }

    // Create a new subject with the given name and coverImage
    const activities = new Activity({
      title,
      type,
      coverImage
    })
    // Save the subject to the database
    await activities.save()

    // Add the subject's ID to the subject's Activities array
    subject.activities.push(activities._id)

    // Save the updated subject
    await subject.save()

    res.status(200).json({ message: 'Created Successfully!!!' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

//middleware function to add material in activity material list
const addLesson = async (req, res, next) => {
  try {
    const id = req.params.id
    const { title, type } = req.body
    //get coverImage
    const coverImage = req.file.filename

    // Find the subject by ID
    const activity = await Activity.findById(id)

    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    //create new Lesson
    const lesson = new Lesson({
      title,
      type,
      coverImage
    })
    //save lesson
    await lesson.save()
    //push lesson id in activity
    activity.lessons.push(lesson._id)
    await activity.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const getConversationsResults = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId } = req.body

    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    let conversation = await Conversation.findById(lesson.conversation)
    let results = []
    conversation.records.forEach(record => {
      let student = {
        _id: record._id,
        studentId: record.studentId,
        studentName: record.studentName,
        audio: record.audio,
        score: record.score,
        start_time: record.start_time,
        end_time: record.end_time
      }
      results.push(student)
    })
    if (studentId) {
      results = results.filter(item => item.studentId == studentId)
    }
    return res.status(200).json(results)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const getReadingAndListeningGames = async (req, res) => {
  try {
    const { id } = req.params
    const reading = await Reading.findById(id)
    if (!reading) {
      return res.status(404).json({ message: 'Reading not found' })
    }

    return res.status(200).json({
      reading: reading.readingGame._id,
      listening: reading.listeningGame._id
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateConversationResult = async (req, res) => {
  try {
    const { id } = req.params
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    let conversation = await Conversation.findById(lesson.conversation)
    const { recordId, score } = req.body
    let record = conversation.records.find(record => record._id == recordId)
    if (record) {
      record.score = score
    }
    await conversation.save()

    return res.status(200).json({ message: 'Successfully updated!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteConversationResult = async (req, res) => {
  try {
    const { id } = req.params
    const { recordId } = req.body
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    let conversation = await Conversation.findById(lesson.conversation)

    conversation.records = conversation.records.filter(
      record => record._id != recordId
    )
    await conversation.save()
    return res.status(200).json({ message: 'Successfully deleted!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

//middleware function to add material in lesson material list
const addMaterial = async (req, res, next) => {
  try {
    const id = req.params.id
    //get coverImage
    const coverImage = req.file.filename

    // Find the subject by ID
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    lesson.materials.push(coverImage)
    await lesson.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}
async function saveConversationItem ({ name, text, translation }) {
  const newItem = new ConversationItem({ name, text, translation })
  return newItem.save()
}

const updateStudentRecord = async (req, res) => {
  try {
    const { id } = req.params
    const { studentId, start_time, end_time } = req.body
    const conversation = await Conversation.findById(id)
    const existStudent = await Student.findById(studentId)
    if (!existStudent) {
      return res.status(404).json({ message: 'Student not found' })
    }
    if (!conversation) {
      return res.status(404).json({ message: 'Not Found' })
    }
    let audios = req.files
    let data = {
      studentId: studentId,
      studentName: existStudent.firstName + ' ' + existStudent.lastName,
      audio: audios[0].filename,
      start_time: start_time,
      end_time: end_time
    }
    conversation.records.push(data)
    // check if record of current student exist then udate it other wise push it
    // let record = conversation.records.find(record => record.studentId == studentId)
    // if (record) {
    //     record.audio = audios[0].filename
    // }
    // else {
    //     conversation.records.push(data)
    // }
    await conversation.save()

    return res.status(200).json({ message: '' })
  } catch (err) {
    return res.status(500).json({ message: 'Server Error' })
  }
}

const createConversation = async (req, res) => {
  try {
    const id = req.params.id
    const title = req.body.title,
      conversation = JSON.parse(req.body.conversation),
      type = req.body.type
    const files = req.files

    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res
        .status(404)
        .json({ success: false, message: 'Lesson not found' })
    }

    const conversationIds = []

    // Parallel creation of ConversationItem instances
    let index = 0
    for (const con of conversation) {
      let personA = {
        name: con.person1Name,
        text: con.person1Text,
        translation: con.person1Translation
      }
      if (con.person1Audio && files[index]) {
        personA = {
          ...personA,

          audio: files[index].filename
        }
        index++
      }

      const person1Item = new ConversationItem(personA)

      const person2Item = new ConversationItem({
        name: con.person2Name,
        text: con.person2Text,
        translation: con.person2Translation
      })

      await person1Item.save()
      await person2Item.save()
      conversationIds.push({
        person1: person1Item._id,
        person2: person2Item._id
      })
    }

    let newCon = {
      title,
      type,
      conversations: conversationIds
    }

    // if (type == "simple") {
    //     const audio = files[0].filename
    //     const fastAudio = files[1].filename
    //     newCon = {
    //         ...newCon,
    //         type,
    //         audio,
    //         fastAudio,

    //     }
    // }

    const newConversation = new Conversation(newCon)

    await newConversation.save()
    lesson.conversation = newConversation._id
    await lesson.save()

    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateConversation = async (req, res) => {
  try {
    const id = req.params.id
    const { title, isSlow, type } = req.body
    const conversations = JSON.parse(req.body.conversations)
    const files = req.files

    const conversation = await Conversation.findById(id)
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    //    if(type == "simple"){

    //     if (files?.length == 2) {
    //         conversation.audio = files[0].filename;
    //         conversation.fastAudio = files[1].filename;
    //     }
    //     else if (isSlow == 'true') {

    //         conversation.audio = files[0].filename;

    //     }
    //     else {
    //         conversation.fastAudio = files[0].filename;

    //     }
    // }
    if (title) {
      conversation.title = title
    }
    let index = 0
    for (const con of conversations) {
      const person1Item = await ConversationItem.findById(con.person1._id)
      if (!person1Item) {
        return res.status(404).json({ message: 'Conversation item not found' })
      }
      person1Item.name = con.person1.name
      person1Item.text = con.person1.text
      person1Item.translation = con.person1.translation
      if (Object.keys(con.person1).includes('audio')) {
        person1Item.audio = files[index].filename
        index++
      }
      await person1Item.save()

      const person2Item = await ConversationItem.findById(con.person2._id)
      if (!person2Item) {
        return res.status(404).json({ message: 'Conversation item not found' })
      }
      person2Item.name = con.person2.name
      person2Item.text = con.person2.text
      person2Item.translation = con.person2.translation
      await person2Item.save()
    }

    await conversation.save()

    return res.status(200).json({ message: 'Successfully updated!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

//create function to add conversation in give conversation
const createConversationItem = async (req, res) => {
  try {
    const id = req.params.id
    const conversations = JSON.parse(req.body.conversation)
    const conversation = await Conversation.findById(id)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    let conversationIds

    const person1Item = new ConversationItem({
      name: conversations[0].person1.name,
      text: conversations[0].person1.text,
      translation: conversations[0].person1.translation
    })

    const person2Item = new ConversationItem({
      name: conversations[1].person2.name,
      text: conversations[1].person2.text,
      translation: conversations[1].person2.translation
    })

    await person1Item.save()
    await person2Item.save()
    conversationIds = {
      person1: person1Item._id,
      person2: person2Item._id
    }

    conversation.conversations.push(conversationIds)
    await conversation.save()
    return res.status(200).json({ message: 'Successfully added!!!' })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const addConversationBelow = async (req, res) => {
  try {
    const id = req.params.id
    const conversation = JSON.parse(req.body.conversation)
    const index = req.body.index
    const conversationDoc = await Conversation.findById(id)

    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' })
    }
    let conversationIds

    const person1Item = new ConversationItem({
      name: conversation.person1.name,
      text: conversation.person1.text,
      translation: conversation.person1.translation
    })
    const person2Item = new ConversationItem({
      name: conversation.person2.name,
      text: conversation.person2.text,
      translation: conversation.person2.translation
    })
    await person1Item.save()
    await person2Item.save()
    conversationIds = {
      person1: person1Item._id,
      person2: person2Item._id
    }
    const updatedConversations = [
      ...conversationDoc.conversations.slice(0, index + 1),
      conversationIds,
      ...conversationDoc.conversations.slice(index + 1)
    ]
    conversationDoc.conversations = updatedConversations
    await conversationDoc.save()

    //get current conversation
    const updatedConversation = await Conversation.findById(id)
      .populate({
        path: 'conversations.person1',
        model: 'ConversationItem'
      })
      .populate({
        path: 'conversations.person2',
        model: 'ConversationItem'
      })

    // return the current conversation item

    return res
      .status(200)
      .json({ conversation: updatedConversation.conversations[index + 1] })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

//remove material from lesson
const removeMaterial = async (req, res, next) => {
  try {
    const id = req.params.id
    const { filename } = req.body

    // Find the lesson by ID
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }

    // Remove the filename from the materials array
    lesson.materials.pull(filename)

    // Construct the file path
    const directory = path.join(
      __dirname,
      '..',
      'public',
      'images',
      'activities',
      filename
    )

    // Check if the file exists before attempting to remove it
    if (fs.existsSync(directory)) {
      // Remove the file
      fs.unlinkSync(directory)
      await lesson.save()
      return res.status(200).json({ message: 'Successfully removed!!!' })
    } else {
      // File does not exist
      await lesson.save()
      return res.status(200).json({ message: 'Successfully removed!!!' })
    }
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteQuestion = async (req, res) => {
  try {
    const quizIdToDelete = req.params.quizId
    const questionIdToDelete = req.params.questionId

    // Find the Quiz that contains the deleted question
    const quiz = await Quiz.findById(quizIdToDelete)

    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' })
    }
    // Delete the question from the Question schema
    await Question.findByIdAndDelete(questionIdToDelete)
    // Remove the question's ID from the Quiz schema
    quiz.questions = quiz.questions.filter(id => id !== questionIdToDelete)
    await quiz.save()

    res.status(200).json({ message: 'Question successfully deleted' })
  } catch (error) {
    console.error('Error deleting question:', error)
    res.status(500).json({ message: 'Internal Server Error' })
  }
}

//update Activity
const updateActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    const { title } = req.body
    //get coverImage
    const coverImage = req.file?.filename

    // Find the subject by ID
    const activity = await Activity.findById(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    activity.title = title

    if (coverImage) {
      activity.coverImage = coverImage
    }
    await activity.save()
    return res.status(200).json({ message: 'Successfully updated!!!' })
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateActivitiesOrder = async (req, res) => {
  try {
    const { activities } = req.body

    // Generate update operations for each subject
    const updateOperations = activities.map(({ id, order }, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: order }
      }
    }))

    await Activity.bulkWrite(updateOperations)
    const updatedActivities = await Activity.find({
      _id: { $in: activities.map(activity => activity.id) }
    }).select('title order coverImage type description')

    // Check if activities were found
    if (!updatedActivities) {
      return res.status(404).json({ message: 'Activities not found' })
    }
    return res.status(200).json({
      message: 'Successfully updated activities order',
      activity: updatedActivities
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
const updateGamesOrder = async (req, res) => {
  try {
    const { games } = req.body

    // Generate update operations for each subject
    const updateOperations = games.map(({ id, order }, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: order }
      }
    }))

    await Quiz.bulkWrite(updateOperations)
    const updatedGames = await Quiz.find({
      _id: { $in: games.map(game => game.id) }
    }).populate({
      path: 'questions',
      model: 'Question',
      select: 'question options answer translation translation2'
    })

    // Check if games were found
    if (!updatedGames) {
      return res.status(404).json({ message: 'Games not found' })
    }
    return res
      .status(200)
      .json({ message: 'Successfully updated games order', game: updatedGames })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}
const updateLessonsOrder = async (req, res) => {
  try {
    const { lessons } = req.body

    // Generate update operations for each subject
    const updateOperations = lessons.map(({ id, order }, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { order: order }
      }
    }))

    await Lesson.bulkWrite(updateOperations)
    const updatedLessons = await Lesson.find({
      _id: { $in: lessons.map(lesson => lesson.id) }
    }).select('title order coverImage type description')

    // Check if lessons were found
    if (!updatedLessons) {
      return res.status(404).json({ message: 'Lessons not found' })
    }
    return res
      .status(200)
      .json({ message: 'Successfully updated ', lesson: updatedLessons })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteActivity = async (req, res, next) => {
  try {
    const id = req.params.id
    // Find the subject by ID
    const activity = await Activity.findByIdAndDelete(id)
    if (!activity) {
      return res.status(404).json({ message: 'Activity not found' })
    }
    return res.status(200).json({ message: 'Successfully deleted!!!' })
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const updateLesson = async (req, res, next) => {
  try {
    const id = req.params.id
    const { title } = req.body
    //get coverImage
    const coverImage = req.file?.filename

    // Find the subject by ID
    const lesson = await Lesson.findById(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    lesson.title = title
    if (coverImage) {
      lesson.coverImage = coverImage
    }
    await lesson.save()
    return res.status(200).json({ message: 'Successfully updated!!!' })
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

const deleteLesson = async (req, res, next) => {
  try {
    const id = req.params.id
    // Find the subject by ID
    const lesson = await Lesson.findByIdAndDelete(id)
    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' })
    }
    return res.status(200).json({ message: 'Successfully deleted!!!' })
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Server error' })
  }
}

// const getCompleteProgress = async (req, res) => {
//     try {
//         const data = await Student.findById(studentId).select("levels").populate(
//             {
//                 path: 'levels',
//                 select: "subjects",
//                 populate: {
//                     path: 'subjects',
//                     select: "activities",
//                     populate: {
//                         path: "activities",
//                         select: "lessons",
//                         populate: {
//                             path: "lessons",
//                             select: "conversation games type reading",
//                             populate: {
//                                 path: "conversation",
//                                 select: "records",
//                                 model: "Conversation",

//                             },
//                             populate: {
//                                 path: "games",
//                                 populate: {
//                                     path: "questions",
//                                     model: "Question"
//                                 }
//                             },
//                             populate: {
//                                 path: "reading",
//                                 select: "readingGame listeningGame",

//                             },
//                         }
//                     }
//                 },

//             }
//         )

//         let levelScores = await Promise.all(data.levels.map(async level => {
//             let subjectScores = await Promise.all(level.subjects.map(async subject => {
//                 let activitiesScores = await Promise.all(subject.activities.map(async activity => {
//                     let lessonScores = await Promise.all(activity.lessons.map(async (lesson) => {
//                         const lessonName = await Lesson.findById(lesson._id).select("title")
//                         // console.log(lesson)
//                         let avg = 0;
//                         if (lesson.conversation) {
//                             let average = 0
//                             const conversation = await Conversation.find({
//                                 _id: lesson.conversation,
//                                 records: {
//                                     $elemMatch: {
//                                         studentId: studentId
//                                     }
//                                 }

//                             }).select("records")
//                             if (conversation.length > 0) {
//                                 conversation.forEach(con => {
//                                     average += con.records.reduce((acc, record) => acc + record.score, 0) / con.records.length
//                                 })
//                                 average = average / conversation.length

//                             }
//                         }
//                         if (lesson.games.length > 0) {
//                             let scores = await Promise.all(lesson.games.map(async (game) => {
//                                 const records = await Score.findOne({
//                                     quizId: game,
//                                     records: {
//                                         $elemMatch: {
//                                             studentId: studentId
//                                         }
//                                     }
//                                 }).select("records")
//                                 let averageScore = 0
//                                 if (records && records.records.length > 0) {

//                                     averageScore = Math.floor(records.records.reduce((acc, rec) => acc + (Math.floor((rec.score / rec.answers.length) * 100)), 0) / records.records.length)

//                                 }

//                                 return averageScore
//                             }))

//                             let average = scores.reduce((acc, score) => acc + score, 0) / scores.length
//                             // console.log("Average of ",lesson.type," = ",average)
//                             avg = average
//                         }
//                         if (lesson.reading.length > 0) {
//                             let scores = await Promise.all(lesson.reading.map(async (reading) => {
//                                 const readingGame = await Reading.findById(reading)
//                                 const readingGameScores = await Promise.all([readingGame.readingGame, readingGame.listeningGame].map(async (game) => {
//                                     const records = await Score.findOne({
//                                         quizId: game,
//                                         records: {
//                                             $elemMatch: {
//                                                 studentId: studentId
//                                             }
//                                         }
//                                     }).select("records")

//                                     let averageScore = 0
//                                     if (records && records.records.length > 0) {
//                                         averageScore = Math.floor(records.records.reduce((acc, rec) => acc + (Math.floor((rec.score / rec.answers.length) * 100)), 0) / records.records.length)
//                                     }
//                                     return averageScore
//                                 })
//                                 )

//                                 let average = readingGameScores.reduce((acc, score) => acc + score, 0) / readingGameScores.length
//                                 return average
//                             })
//                             )

//                             let average = scores.reduce((acc, score) => acc + score, 0) / scores.length
//                             // console.log("Average of ",lesson.type," = ",average)
//                             avg = average
//                         }

//                         // const records = await Conversation.find(lesson.conversation).select("records")

//                         console.log("Lesson: ", lessonName.title, avg)
//                         return avg

//                         // lesson.games = lesson.games.length
//                         // lesson.reading = lesson.reading.length
//                     })
//                     )
//                     // console.log("Lesson Scores:", lessonScores)

//                     let average = 0
//                     if (lessonScores.length > 0) {

//                         average = lessonScores.reduce((acc, score) => acc + score, 0) / lessonScores.length
//                     }

//                     const activitiesName = await Activity.findById(activity._id).select("title")
//                     console.log("Activities", activitiesName.title, average)
//                     return average
//                 })
//                 )
//                 // console.log("Activities Scores:", activitiesScores)
//                 let average = 0;
//                 if (activitiesScores.length > 0)
//                     average = activitiesScores.reduce((acc, score) => acc + score, 0) / activitiesScores.length
//                 const subjectName = await Subject.findById(subject._id).select("subject")
//                 console.log("Subject: ", subjectName.subject, average)
//                 return average

//             })
//             )
//             // console.log("Subject Scores:", subjectScores)

//             let average = subjectScores.length > 0 ? subjectScores.reduce((acc, score) => acc + score, 0) / subjectScores.length : 0
//             const levelName = await Level.findById(level._id).select("level")
//             console.log("Level: ", levelName.level, average)
//             return average
//         })
//         )

//         return res.status(200).json({ levelScores })

//     }
//     catch (err) {
//         console.log(err)
//         return res.status(500).json({ message: "Internal Server Error" })
//     }
// }

const updateProgress = async (object, studentId, score, avg) => {
  try {
    let progress = {
      studentId: studentId,
      progress: Math.round(score),
      avg: Math.round(avg) || 0,
      status:
        score > 0 ? (score == 100 ? 'Completed' : 'In Progress') : 'Not Started'
    }
    if (studentId) {
      if (object.progress) {
        let avg = object.progress.find(
          item => item.studentId == progress.studentId
        )
        if (avg) {
          avg.progress = progress.progress
          avg.status = progress.status
          avg.avg = progress.avg
        } else {
          object.progress.push(progress)
        }
      } else {
        object.progress = [progress]
      }
      await object.save()
    }
  } catch (error) {
    console.error(error)
  }
}

const calculateAverage = scores => {
  if (scores.length === 0) return 0
  return Math.round(
    scores.reduce((acc, score) => acc + score, 0) / scores.length
  )
}

// const getLessonScores = async (lesson, studentId) => {
//     const [conversationScores, gameScores, readingScores] = await Promise.all([
//         // Get conversation scores
//         lesson.conversation ? Conversation.find({
//             _id: lesson.conversation,
//             'records.studentId': studentId
//         }).select("records").then(conversations =>
//             conversations.map(con =>
//                 calculateAverage(con.records.map(record => record.score))
//             )
//         ) : [],

//         // Get game scores
//         lesson.games && lesson.games.length > 0 ? Promise.all(lesson.games.map(async (game) => {
//             const scoreRecord = await Score.findOne({
//                 quizId: game,
//                 'records.studentId': studentId
//             }).select("records");

//             return scoreRecord ? calculateAverage(scoreRecord.records.map(rec =>
//                 Math.floor((rec.score / rec.answers.length) * 100)
//             )) : 0;
//         })) : [],

//         // Get reading scores
//         lesson.reading && lesson.reading.length > 0 ? Promise.all(lesson.reading.map(async (readingId) => {
//             const readingGame = await Reading.findById(readingId).select("readingGame listeningGame");
//             const readingGameScores = await Promise.all([readingGame.readingGame, readingGame.listeningGame].map(async (game) => {
//                 const scoreRecord = await Score.findOne({
//                     quizId: game,
//                     'records.studentId': studentId
//                 }).select("records");

//                 return scoreRecord ? calculateAverage(scoreRecord.records.map(rec =>
//                     Math.floor((rec.score / rec.answers.length) * 100)
//                 )) : 0;
//             }));

//             return calculateAverage(readingGameScores);
//         })) : []
//     ]);

//     return calculateAverage([...conversationScores, ...gameScores, ...readingScores]);
// };

const getLessonScores = async (lesson, studentId) => {
  let progressObj = {
    studentId,
    progress: 0,
    avg: 0,
    status: 'Not Started'
  }
  if (lesson?.games?.length > 0) {
    lesson?.games?.forEach(async game => {
      await updateProgressAndAvgOfGame(game._id, studentId)
    })
    let totalAvg = 0
    let totalProgress = 0
    let count = 0
    let progCount = 0
    lesson?.games.forEach(game => {
      let progress = game?.progress?.find(
        item => item?.studentId.toString() == studentId.toString()
      )
      if (progress) {
        totalAvg += progress.avg || 0
        totalProgress += progress.progress
        if (progress.avg > 0) {
          count++
        }
        progCount++
      }
    })
    progressObj.avg = count > 0 ? totalAvg / count : 0
    progressObj.progress = progCount > 0 ? totalProgress / progCount : 0
    progressObj.status =
      progressObj.progress > 0
        ? progressObj.progress == 100
          ? 'Completed'
          : 'In Progress'
        : 'Not Started'
  }
  if (lesson?.conversation) {
    let conversationRecord = lesson?.conversation?.records.filter(
      record => record.studentId == studentId
    )
    if (conversationRecord.length > 0) {
      let score = calculateAverage(
        conversationRecord.map(record => record.score)
      )
      let highestScore =
        (Math.max(...conversationRecord.map(record => record.score)) * 100) /
        conversationRecord.length
      progressObj.avg = score
      progressObj.progress = highestScore >= 80 ? 100 : 0
      progressObj.status =
        progressObj.progress > 0
          ? progressObj.progress == 100
            ? 'Completed'
            : 'In Progress'
          : 'Not Started'
    }
  }
  if (lesson?.reading?.length > 0) {
    lesson?.reading?.forEach(async reading => {
      await updateProgressAndAvgOfReading(reading._id, studentId)
    })
    let totalAvg = 0
    let totalProgress = 0
    let count = 0
    let progCount = 0
    lesson?.reading.forEach(reading => {
      let progress = reading?.progress?.find(
        item => item?.studentId.toString() === studentId.toString()
      )
      if (progress) {
        totalAvg += progress.avg || 0
        totalProgress += progress.progress
        if (progress.avg > 0) {
          count++
        }
        progCount++
      }
    })
    progressObj.avg = count > 0 ? totalAvg / count : 0
    progressObj.progress = progCount > 0 ? totalProgress / progCount : 0
    progressObj.status =
      progressObj.progress > 0
        ? progressObj.progress == 100
          ? 'Completed'
          : 'In Progress'
        : 'Not Started'
  }
  await updateProgress(lesson, studentId, progressObj.progress, progressObj.avg)
  return {
    progress: progressObj.progress,
    avg: progressObj.avg
  }
}

const getActivityScores = async (activity, studentId) => {
  const lessonScores = await Promise.all(
    activity.lessons.map(lesson => getLessonScores(lesson, studentId))
  )

  // let lessonScores = activity.lessons.map(item => {

  //     return {
  //         progress: item?.progress?.find(f => f.studentId == studentId)?.progress || 0,
  //         avg: item?.progress?.find(f => f.studentId == studentId)?.avg || 0
  //     }
  // })

  let score = calculateAverage(lessonScores?.map(item => item.progress))
  let avg = calculateAverage(
    lessonScores?.filter(item => item.avg != 0)?.map(item => item.avg)
  )

  await updateProgress(activity, studentId, score, avg)
  return {
    score,
    avg
  }
}

const getSubjectScores = async (subject, studentId) => {
  const activityScores = await Promise.all(
    subject.activities.map(activity => getActivityScores(activity, studentId))
  )
  let score = calculateAverage(activityScores?.map(item => item.score))
  let avg = calculateAverage(
    activityScores?.filter(item => item.avg != 0)?.map(item => item.avg)
  )
  await updateProgress(subject, studentId, score, avg)
  return {
    score,
    avg
  }
}

const getLevelScores = async (level, studentId) => {
  const subjectScores = await Promise.all(
    level.subjects.map(subject => getSubjectScores(subject, studentId))
  )
  let score = calculateAverage(subjectScores?.map(item => item.score))
  let avg = calculateAverage(
    subjectScores?.filter(item => item.avg != 0)?.map(item => item.avg)
  )
  await updateProgress(level, studentId, score, avg)
  return {
    score,
    avg
  }
}

const getProgress = async (req, res) => {
  try {
    const { studentId } = req.body
    const student = await Student.findById(studentId)
      .select('levels')
      .populate({
        path: 'levels',
        select: 'subjects progress',
        populate: {
          path: 'subjects',
          select: 'activities progress',
          populate: {
            path: 'activities',
            select: 'lessons progress',
            populate: {
              path: 'lessons',
              select: 'conversation games type reading progress',
              populate: {
                path: 'conversation games reading',
                select: 'records progress'
              }
            }
          }
        }
      })

    const levelScores = await Promise.all(
      student.levels.map(level => getLevelScores(level, studentId))
    )

    return res.status(200).json({ message: 'Update Successfully' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const getWatchTime = async (req, res) => {
  try {
    const { id } = req.params
    const student = await Student.findById(id)
    if (!student) {
      return res.status(404).json({ message: 'Student not found' })
    }

    const scores = await Score.find({
      'records.studentId': id
    }).populate({
      path: 'quizId',
      select: 'name'
    })
    const conversationRecords = await Conversation.find({
      'records.studentId': id
    })

    if (!scores || scores.length === 0) {
      return res
        .status(404)
        .json({ message: 'No scores found for this student' })
    }

    // const result = scores.map(score => {
    //     const quizId = score.quizId;
    //     const records = score.records.filter(record => record.studentId == id);
    //     const groupedByDate = records.reduce((acc, record) => {
    //         if (record.start_time && record.end_time) {
    //             const date = new Date(record.start_time);
    //             const dateKey = date.toLocaleDateString('en-US', {
    //                 day: '2-digit',
    //                 month: 'short',
    //                 year: 'numeric'
    //             });

    //             const startDate = date.toLocaleString('en-US', {
    //                 day: '2-digit',
    //                 month: 'short',
    //                 year: 'numeric',
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 second: '2-digit',
    //                 hour12: false
    //             });

    //             const end_date = new Date(record.end_time);
    //             const endDate = end_date.toLocaleString('en-US', {
    //                 day: '2-digit',
    //                 month: 'short',
    //                 year: 'numeric',
    //                 hour: '2-digit',
    //                 minute: '2-digit',
    //                 second: '2-digit',
    //                 hour12: false
    //             });

    //             const min = Math.round((record.end_time - record.start_time) / 60000);

    //             // Find if the date already exists in the accumulator
    //             const existingEntry = acc.find(entry => entry.date === dateKey);

    //             if (existingEntry) {
    //                 // Add to the existing entry
    //                 existingEntry.totalMinutes += min;
    //             } else {
    //                 // Create a new entry for the date
    //                 acc.push({
    //                     date: dateKey,
    //                     totalMinutes: min,
    //                 });
    //             }
    //         }
    //         return acc;
    //     }, []);

    //     // const groupedByDate = records.map(record => {
    //     //     if (record.start_time && record.end_time) {

    //     //         const date = new Date(record.start_time);
    //     //         const startDate = date.toLocaleString('en-US', {
    //     //             day: '2-digit',
    //     //             month: 'short', // Use 'long' for full month name
    //     //             year: 'numeric',
    //     //             hour: '2-digit',
    //     //             minute: '2-digit',
    //     //             second: '2-digit',
    //     //             hour12: false // Set to true for 12-hour format with AM/PM
    //     //         });
    //     //         const end_date = new Date(record.end_time);
    //     //         const endDate = end_date.toLocaleString('en-US', {
    //     //             day: '2-digit',
    //     //             month: 'short', // Use 'long' for full month name
    //     //             year: 'numeric',
    //     //             hour: '2-digit',
    //     //             minute: '2-digit',
    //     //             second: '2-digit',
    //     //             hour12: false // Set to true for 12-hour format with AM/PM
    //     //         });

    //     //         const year = date.getFullYear();
    //     //         const day = date.toLocaleString('en-US', { weekday: 'long' });
    //     //         const dateNumber = date.getDate();
    //     //         const month = date.getMonth() + 1; // Months are zero-indexed in JS
    //     //         const min = Math.round((record.end_time - record.start_time) / 60000); // Assuming score represents hours, adjust as needed

    //     //         return {
    //     //             day,
    //     //             start: startDate,
    //     //             end: endDate,
    //     //             date: dateNumber,
    //     //             month,
    //     //             year,
    //     //             totalMinutes: min
    //     //         };
    //     //     }
    //     // }).filter(item => item != null);

    //     return {
    //         quizId,
    //         groupedByDate,

    //     };
    // });
    const result = scores.reduce((acc, score) => {
      const quizId = score.quizId
      const quizName = score.name
      const records = score.records.filter(record => record.studentId == id)

      records.forEach(record => {
        if (record.start_time && record.end_time) {
          const date = new Date(record.start_time)
          const dateKey = date.toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          })

          const startDate = date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })

          const end_date = new Date(record.end_time)
          const endDate = end_date.toLocaleString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          })

          const min = Math.round((record.end_time - record.start_time) / 60000)
            ? Math.round((record.end_time - record.start_time) / 60000)
            : 1

          // Find if the dateKey already exists in the accumulator
          const existingDateEntry = acc.find(entry => entry.date === dateKey)

          const quizData = {
            quizId,
            quizName,
            totalMinutes: min
          }

          if (existingDateEntry) {
            // Add quizData to the existing date entry
            if (existingDateEntry.data) {
              // check if quizId already exists in the data array
              const existingQuizData = existingDateEntry.data.find(
                data => data.quizId === quizId
              )
              if (existingQuizData) {
                existingQuizData.totalMinutes += min
              } else {
                existingDateEntry.data.push(quizData)
              }
            }
          } else {
            // Create a new entry for the date
            acc.push({
              date: dateKey,
              data: [quizData]
            })
          }
        }
      })

      return acc
    }, [])

    const conversationRecordsResult = conversationRecords.reduce(
      (acc, conversation) => {
        const conversationId = conversation._id
        const conversationName = conversation.title
        conversation.records.forEach(record => {
          if (record.start_time && record.end_time) {
            const date = new Date(record.start_time)
            const dateKey = date.toLocaleDateString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric'
            })

            const startDate = date.toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })

            const end_date = new Date(record.end_time)
            const endDate = end_date.toLocaleString('en-US', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            })

            const min = Math.round(
              (record.end_time - record.start_time) / 60000
            )
              ? Math.round((record.end_time - record.start_time) / 60000)
              : 1

            // Find if the dateKey already exists in the accumulator
            const existingDateEntry = acc.find(entry => entry.date === dateKey)

            const quizData = {
              quizId: conversationId,
              quizName: conversationName,
              totalMinutes: min
            }

            if (existingDateEntry) {
              // Add quizData to the existing date entry
              if (existingDateEntry.data) {
                // check if quizId already exists in the data array
                const existingQuizData = existingDateEntry.data.find(
                  data => data.quizId === conversationId
                )
                if (existingQuizData) {
                  existingQuizData.totalMinutes += min
                } else {
                  existingDateEntry.data.push(quizData)
                }
              }
            } else {
              // Create a new entry for the date
              acc.push({
                date: dateKey,
                data: [quizData]
              })
            }
          }
        })
        return acc
      },
      []
    )

    return res.status(200).json({
      studentId: id,
      result: [...result, ...conversationRecordsResult]
    })

    // return res.status(200).json({
    //     studentId: id,
    //     result
    // });
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

const newProgress = async (req, res) => {
  try {
    const { id } = req.body
    const studentId = new mongoose.Types.ObjectId(id)

    const pipeline = [
      {
        $match: { _id: studentId }
      },
      {
        $lookup: {
          from: 'levels', // Collection name for levels
          localField: 'levels',
          foreignField: '_id',
          as: 'levels'
        }
      },
      {
        $unwind: '$levels'
      },
      {
        $lookup: {
          from: 'subjects', // Collection name for subjects
          localField: 'levels.subjects',
          foreignField: '_id',
          as: 'levels.subjects'
        }
      },
      {
        $unwind: '$levels.subjects'
      },
      {
        $lookup: {
          from: 'activities', // Collection name for activities
          localField: 'levels.subjects.activities',
          foreignField: '_id',
          as: 'levels.subjects.activities'
        }
      },
      {
        $unwind: '$levels.subjects.activities'
      },
      {
        $lookup: {
          from: 'lessons', // Collection name for lessons
          localField: 'levels.subjects.activities.lessons',
          foreignField: '_id',
          as: 'levels.subjects.activities.lessons'
        }
      },
      {
        $unwind: '$levels.subjects.activities.lessons'
      },
      // {
      //     $lookup: {
      //         from: 'conversations', // Collection name for conversations
      //         localField: 'levels.subjects.activities.lessons.conversation',
      //         foreignField: '_id',
      //         as: 'levels.subjects.activities.lessons.conversation'
      //     }
      // },
      // {
      //     $unwind: '$levels.subjects.activities.lessons.conversation'
      // },
      {
        $lookup: {
          from: 'quizzes', // Collection name for games
          localField: 'levels.subjects.activities.lessons.games',
          foreignField: '_id',
          as: 'games'
        }
      },
      {
        $unwind: '$games'
      }
      // {
      //     $lookup: {
      //         from: 'scores', // Collection name for games
      //         localField: 'levels.subjects.activities.lessons.games',
      //         foreignField: 'quizId',
      //         as: 'levels.subjects.activities.lessons.games.scores'
      //     }
      // },
      // {
      //      $unwind: '$levels.subjects.activities.lessons.games.scores',

      //  },
      //  {
      //     $unwind:'$levels.subjects.activities.lessons.games.scores.records'
      //  },
      //     {
      //         $match:{
      //             'levels.subjects.activities.lessons.games.scores.records.studentId':studentId
      //         }
      //     },
      //     {
      //         $group:{
      //             _id:'$levels.subjects.activities.lessons.games.scores.quizId',
      //             avg:{$avg:'$levels.subjects.activities.lessons.games.scores.records.score'}
      //         }
      //     },
      // {
      //     $match:{
      //         'records.studentId':studentId
      //     }
      // },

      // {
      //     $lookup: {
      //         from: 'reading', // Collection name for readings
      //         localField: 'levels.subjects.activities.lessons.reading',
      //         foreignField: '_id',
      //         as: 'levels.subjects.activities.lessons.reading'
      //     }
      // },
      // {
      //     $project: {
      //         "levels.subjects.activities.lessons.conversation.records": 1,
      //         "levels.subjects.activities.lessons.games.records": 1,
      //         'levels.subjects.activities.lessons.games.scores':1,
      //         "levels.subjects.activities.lessons.reading.records": 1,
      //         "levels.subjects.activities.lessons.progress": 1,
      //         "levels.subjects.activities.progress": 1,
      //         "levels.subjects.progress": 1,
      //         "levels.progress": 1
      //     }
      // }
      // {$project:{
      //     levels:1,

      // }}
    ]

    const student = await Student.aggregate(pipeline).exec()
    return res.status(200).json({ student })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: 'Internal Server Error' })
  }
}

let uploadImage = upload.single('coverImage')
let audio = uploadAudio.single('audio')
let conversationAudio = uploadAudio.array('audio')

module.exports = {
  getProgress,
  getAllActivities,
  createActivities,
  updateConversationAudio,
  createConversation,
  updateStudentRecord,
  getActivitiesContentById,
  deleteConversation,
  createConversationItem,
  createLessonGame,
  editGame,
  deleteLessonGame,
  updateConversation,
  deleteQuestion,
  addMaterial,
  getConversationsResults,
  updateConversationResult,
  deleteConversationResult,
  addReadingAndListening,
  editReadingAndListening,
  addImageQuiz,
  editImageQuiz,
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
  conversationAudio,
  addGamesResult,
  getGamesResults,
  getReadingAndListeningGames,
  getWatchTime,
  updateProgressAndAvgOfGame,
  newProgress,
  getReadingGameProgress,
  getLastGamesResults
}
