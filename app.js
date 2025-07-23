// var createError = require('http-errors');
// var express = require('express');
// var path = require('path');
// var cookieParser = require('cookie-parser');
// var logger = require('morgan');
// var cors = require('cors')
// var db = require('./database/database')
// var indexRouter = require('./routes/index');
// var usersRouter = require('./routes/users');
// var homeworkRouter = require('./routes/homework');
// var classRouter = require('./routes/class');
// var levelRouter = require('./routes/level');
// var activitiesRouter = require('./routes/activities')
// var conversationRouter = require('./routes/conversation')
// var studentLevel = require("./routes/assignLevel")
// var averageHomework = require("./routes/averageHomework")
// var studentHomework = require("./routes/studentHomework")
// var studentGoals = require("./routes/studentGoals")
// var classDescription = require("./routes/classDescription")
// var studentGrammarResult = require("./routes/studentGrammarResult")
// var reminder = require("./routes/reminder")
// const multer = require('multer');


// const notesRoutes = require('./controllers/NoteController');
// const paymentRoutes = require('./routes/studentPayment');
// const useOfEnglishRoutes = require("./routes/useOfEnglish");
// const Message = require('./models/Message');
// const Room = require('./models/Room');
// const Student = require('./models/Student');


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, './public/images/messages');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });


// var app = express();

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');

// app.use(cors());
// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use('/api', express.static(path.join(__dirname, '/public')));

// app.use('/', indexRouter);
// app.use('/api/auth/users', usersRouter);
// app.use('/api/user', usersRouter);
// app.use('/api/level', levelRouter);
// app.use('/api/subject', activitiesRouter);
// app.use('/api/activity', activitiesRouter);
// app.use('/api/lesson', activitiesRouter);
// app.use('/api/conversation', activitiesRouter);
// app.use('/api/quiz', activitiesRouter);
// app.use('/api/grammar-result', studentGrammarResult);
// app.use('/api/classes', classRouter);
// app.use('/api/tracking', classRouter);
// app.use('/api/conversation-item', conversationRouter);
// app.use('/api/notes/', notesRoutes);
// app.use('/api/homework', homeworkRouter);
// app.use('/api/student', studentLevel);
// app.use('/api/average-homework', averageHomework);
// app.use('/api/student-homework', studentHomework);
// app.use('/api/student-goals', studentGoals);
// app.use('/api/class-description', classDescription);
// app.use('/api/reminder', reminder);
// app.use('/api/payment', paymentRoutes);
// app.use('/api/use_of_english', useOfEnglishRoutes);
// app.post('/api/send_image', upload.single('image'), (req, res) => {
//   res.json({ url: `/images/messages/${req.file.filename}` });
// });

// // Backend Routes (app.js)
// app.get('/api/teacher/students-with-unreads', async (req, res) => {
//   try {
//     const teacherId = req.user.id; // From authentication
//     const students = await Student.aggregate([
//       { $match: { userType: 'student' } },
//       {
//         $lookup: {
//           from: 'messages',
//           let: { studentId: '$_id' },
//           pipeline: [
//             {
//               $match: {
//                 $expr: {
//                   $and: [
//                     { $eq: ['$to', teacherId] },
//                     { $eq: ['$from', '$$studentId'] },
//                     { $eq: ['$isRead', false] }
//                   ]
//                 }
//               }
//             },
//             { $count: 'unreadCount' }
//           ],
//           as: 'unreads'
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           firstName: 1,
//           lastName: 1,
//           profileImage: 1,
//           unreadCount: { $ifNull: [{ $arrayElemAt: ['$unreads.unreadCount', 0] }, 0] },
//           lastMessageTime: 1
//         }
//       },
//       { $sort: { lastMessageTime: -1 } }
//     ]);

//     res.json(students);
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.get('/api/messages/:studentId', async (req, res) => {
//   try {
//     const { studentId } = req.params;
//     const page = parseInt(req.query.page) || 1;
//     const limit = parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     const messages = await Message.find({
//       $or: [
//         { from: studentId, to: req.user.id },
//         { from: req.user.id, to: studentId }
//       ]
//     })
//       .sort({ timestamp: -1 })
//       .skip(skip)
//       .limit(limit)
//       .lean();

//     res.json({
//       data: messages.reverse(), // Reverse to maintain chronological order
//       hasMore: messages.length === limit
//     });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// app.post('/api/:id/getMessages', async (req, res) => {
//   const user = req.body.user;
//   const messages = await Room.findOne({ roomId: req.params.id }).select("messages").populate("messages")
//   if (messages) {
//     messages.messages.forEach(message => {
//       message.from !== user && message.isRead === false && (message.isRead = true)
//     })
//     messages.save()
//     res.json(messages.messages)
//   }
//   else {
//     res.json([])
//   }

// })
// app.get('/api/unreadMessagesCount/:userId', async (req, res) => {
//   try {
//       const count = await Message.countDocuments({
//           to: req.params.userId,
//           isRead: false
//       });
//       res.json({ unreadCount: count });
//   } catch (error) {
//       res.status(500).json({ error: 'Server error' });
//   }
// });

// app.post('/api/mark-messages-read', async (req, res) => {
//   try {
//       await Message.updateMany(
//           { 
//               to: req.body.userId,
//               roomId: req.body.roomId,
//               isRead: false 
//           },
//           { $set: { isRead: true } }
//       );
//       res.json({ success: true });
//   } catch (error) {
//       res.status(500).json({ success: false });
//   }
// });
// // catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   next(createError(404));
// });
// app.use(function (req, res, next) {
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     "*"
//   )
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Types"
//   )
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PATCH, DELETE, OPTIONS"
//   )
//   next(createError(404));
// });
// // error handler
// app.use(function (err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// module.exports = app;

var createError = require("http-errors")
var express = require("express")
var path = require("path")
var cookieParser = require("cookie-parser")
var logger = require("morgan")
var cors = require("cors")
var db = require("./database/database")
var indexRouter = require("./routes/index")
var usersRouter = require("./routes/users")
var homeworkRouter = require("./routes/homework")
var classRouter = require("./routes/class")
var levelRouter = require("./routes/level")
var activitiesRouter = require("./routes/activities")
var conversationRouter = require("./routes/conversation")
var studentLevel = require("./routes/assignLevel")
var averageHomework = require("./routes/averageHomework")
var studentHomework = require("./routes/studentHomework")
var studentGoals = require("./routes/studentGoals")
var classDescription = require("./routes/classDescription")
var studentGrammarResult = require("./routes/studentGrammarResult")
var reminder = require("./routes/reminder")
const multer = require("multer")

const notesRoutes = require("./controllers/NoteController")
const paymentRoutes = require("./routes/studentPayment")
const useOfEnglishRoutes = require("./routes/useOfEnglish")
const Message = require("./models/Message")
const Room = require("./models/Room")
const Student = require("./models/Student")

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/images/messages")
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`)
  },
})

const upload = multer({ storage })

var app = express()

// view engine setup
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "jade")

app.use(cors())
app.use(logger("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use("/api", express.static(path.join(__dirname, "/public")))

app.use("/", indexRouter)
app.use("/api/auth/users", usersRouter)
app.use("/api/user", usersRouter)
app.use("/api/level", levelRouter)
app.use("/api/subject", activitiesRouter)
app.use("/api/activity", activitiesRouter)
app.use("/api/lesson", activitiesRouter)
app.use("/api/conversation", activitiesRouter)
app.use("/api/quiz", activitiesRouter)
app.use("/api/grammar-result", studentGrammarResult)
app.use("/api/classes", classRouter)
app.use("/api/tracking", classRouter)
app.use("/api/conversation-item", conversationRouter)
app.use("/api/notes/", notesRoutes)
app.use("/api/homework", homeworkRouter)
app.use("/api/student", studentLevel)
app.use("/api/average-homework", averageHomework)
app.use("/api/student-homework", studentHomework)
app.use("/api/student-goals", studentGoals)
app.use("/api/class-description", classDescription)
app.use("/api/reminder", reminder)
app.use("/api/payment", paymentRoutes)
app.use("/api/use_of_english", useOfEnglishRoutes)
app.post("/api/send_image", upload.single("image"), (req, res) => {
  res.json({ url: `/images/messages/${req.file.filename}` })
})
app.post('/api/upload-file', upload.single('file'), (req, res) => {
  try {
    res.json({
      url: `uploads/${req.file.filename}`,
      originalName: req.file.originalname,
      size: req.file.size,
      type: req.file.mimetype
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Backend Routes (app.js)
app.get("/api/teacher/students-with-unreads", async (req, res) => {
  try {
    const students = await Student.aggregate([
      {
        $lookup: {
          from: "rooms",
          let: { studentId: { $toString: "$_id" } },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$roomId", "$$studentId"] },
              },
            },
            {
              $lookup: {
                from: "messages",
                localField: "messages",
                foreignField: "_id",
                as: "messages",
              },
            },
            {
              $project: {
                unreadMessages: {
                  $filter: {
                    input: "$messages",
                    as: "message",
                    cond: {
                      $and: [{ $eq: ["$$message.to", "$$studentId"] }, { $eq: ["$$message.isRead", false] }],
                    },
                  },
                },
              },
            },
          ],
          as: "room",
        },
      },
      {
        $addFields: {
          unreadMessages: { $ifNull: [{ $arrayElemAt: ["$room.unreadMessages", 0] }, []] },
        },
      },
      {
        $addFields: {
          unreadCount: { $size: "$unreadMessages" },
          lastMessageTime: {
            $ifNull: [{ $max: "$unreadMessages.timestamp" }, null],
          },
        },
      },
      {
        $project: {
          _id: 1,
          firstName: 1,
          lastName: 1,
          profileImage: 1,
          unreadCount: 1,
          lastMessageTime: 1,
          status: 1,
        },
      },
      { $sort: { lastMessageTime: -1, unreadCount: -1, firstName: 1, lastName: 1 } },
    ])

    res.json(students)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})
// app.get("/api/messages/:roomId", async (req, res) => {
//   try {
//     const { roomId } = req.params;
//     const page = Number.parseInt(req.query.page) || 1;
//     const limit = Number.parseInt(req.query.limit) || 20;
//     const skip = (page - 1) * limit;

//     // Find the room and populate messages with pagination
//     const room = await Room.findOne({ roomId })
//       .select("messages")
//       .populate({
//         path: "messages",
//         options: {
//           sort: { timestamp: -1 }, // Sort by timestamp descending (newest first)
//           skip: skip,
//           limit: limit
//         }
//       });

//     if (!room) {
//       return res.status(404).json({ error: "Room not found" });
//     }

//     // Count total messages for pagination
//     const totalMessages = await Message.countDocuments({ 
//       _id: { $in: room.messages } 
//     });

//     res.json({
//       data: room.messages.reverse(), // Reverse to show oldest first in chat
//       hasMore: skip + limit < totalMessages,
//       total: totalMessages,
//       page,
//       limit
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.post("/api/:id/getMessages", async (req, res) => {
  const user = req.body.user
  const messages = await Room.findOne({ roomId: req.params.id }).select("messages").populate("messages")
  if (messages) {
    messages.messages.forEach((message) => {
      message.from !== user && message.isRead === false && (message.isRead = true)
    })
    messages.save()
    res.json(messages.messages)
  } else {
    res.json([])
  }
})
app.get("/api/unreadMessagesCount/:userId", async (req, res) => {
  try {
    const count = await Message.countDocuments({
      to: req.params.userId,
      isRead: false,
    })
    res.json({ unreadCount: count })
  } catch (error) {
    res.status(500).json({ error: "Server error" })
  }
})

app.post("/api/mark-messages-read", async (req, res) => {
  try {
    await Message.updateMany(
      {
        to: req.body.userId,
        roomId: req.body.roomId,
        isRead: false,
      },
      { $set: { isRead: true } },
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ success: false })
  }
})
// Updated message endpoint
app.get("/api/messages/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 20
    const skip = (page - 1) * limit

    const room = await Room.findOne({ roomId })
      .select("messages")
      .populate({
        path: "messages",
        options: {
          sort: { timestamp: -1 },
          skip,
          limit
        }
      })

    if (!room) {
      return res.status(404).json({ error: "Room not found" })
    }

    const total = await Room.findOne({ roomId }).populate("messages").then(r => r.messages.length)
   
    res.json({
      data: room.messages.reverse(),
      hasMore: skip + limit < total,
      total,
      page,
      limit
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: "Server error" })
  }
})

// Updated file upload endpoints
// const upload = multer({
//   storage: multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, './public/images/messages')
//     },
//     filename: (req, file, cb) => {
//       cb(null, `${Date.now()}-${file.originalname}`)
//     }
//   }),
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// })

// app.post("/api/send_image", upload.single("image"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No image uploaded" })
//   }
//   res.json({ url: `${req.file.filename}` })
// })

// app.post("/api/upload-file", upload.single("file"), (req, res) => {
//   if (!req.file) {
//     return res.status(400).json({ error: "No file uploaded" })
//   }
//   res.json({
//     url: `/uploads/${req.file.filename}`,
//     originalName: req.file.originalname,
//     size: req.file.size,
//     type: req.file.mimetype
//   })
// })
// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Content-Types")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS")
  next(createError(404))
})
// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message
  res.locals.error = req.app.get("env") === "development" ? err : {}

  // render the error page
  res.status(err.status || 500)
  res.render("error")
})

module.exports = app

