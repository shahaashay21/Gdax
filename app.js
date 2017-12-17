var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var SequelizeAuto = require('sequelize-auto');
var CronJob = require('cron').CronJob;

var ltc = require('./routes/ltcValue');
var eth = require('./routes/ethValue');
var btc = require('./routes/btcValue');
var cron = require('./routes/cron');
var account = require('./routes/account');

require('dotenv').config();

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);
app.use('/account', account);
app.use('/ltc', ltc);
app.use('/btc', btc);
app.use('/eth', eth);

var auto = new SequelizeAuto('coinbot', 'root', '', {
    host: 'localhost',
    dialect: 'mysql',
    directory: path.join(__dirname, 'models'), // prevents the program from writing to disk
    port: 3306,
    additional: {
        timestamps: true
    }
});

auto.run(function (err) {
});

new CronJob('*/10 * * * * *', function() {
    cron.runCronJob();
}, null, true, 'America/Los_Angeles');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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

app.set('port', process.env.PORT || 3000);

/**
 * Create HTTP server.
 */

http.createServer(app).listen(app.get('port'), function(){
    console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
