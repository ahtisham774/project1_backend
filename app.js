var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
var db = require('./database/database')
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var homeworkRouter = require('./routes/homework');
var classRouter = require('./routes/class');
var levelRouter = require('./routes/level');
var activitiesRouter = require('./routes/activities')
var conversationRouter = require('./routes/conversation')
var studentLevel = require("./routes/assignLevel")
var averageHomework = require("./routes/averageHomework")
var studentHomework = require("./routes/studentHomework")
var studentGoals = require("./routes/studentGoals")
var classDescription = require("./routes/classDescription")
var reminder = require("./routes/reminder")

const notesRoutes = require('./controllers/NoteController');
const paymentRoutes = require('./routes/studentPayment');







var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use('/api',express.static(path.join(__dirname, '/public')));

app.use('/', indexRouter);
app.use('/api/auth/users', usersRouter);
app.use('/api/user', usersRouter);
app.use('/api/level', levelRouter);
app.use('/api/subject', activitiesRouter);
app.use('/api/activity', activitiesRouter);
app.use('/api/lesson', activitiesRouter);
app.use('/api/conversation', activitiesRouter);
app.use('/api/quiz', activitiesRouter);
app.use('/api/classes', classRouter);
app.use('/api/tracking', classRouter);
app.use('/api/conversation-item', conversationRouter);
app.use('/api/notes/', notesRoutes);
app.use('/api/homework', homeworkRouter);
app.use('/api/student', studentLevel);
app.use('/api/average-homework', averageHomework);
app.use('/api/student-homework', studentHomework);
app.use('/api/student-goals', studentGoals);
app.use('/api/class-description', classDescription);
app.use('/api/reminder', reminder);
app.use('/api/payment', paymentRoutes);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});
app.use(function (req, res, next) {
    res.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    )
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Types"
    )
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS"
    )
    next(createError(404));
});
// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
