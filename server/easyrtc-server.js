// Load required modules
var http    = require("http");              // http server core module
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var easyrtc = require("easyrtc");               // EasyRTC external module
var mongoose = require('mongoose');
var exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    TwitterStrategy = require('passport-twitter'),
    GoogleStrategy = require('passport-google'),
    FacebookStrategy = require('passport-facebook');

// connect to the database
mongoose.connect('mongodb://localhost/my_db');

var config = require('./config.js'); //config file contains all tokens and other private info
var funct = require('./functions.js'); //funct file contains our helper functions for our Passport and database work

// Set process name
process.title = "node-easyrtc";

// Get port or default to 8080
var port = process.env.PORT || 8080;

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
const host = '127.0.0.1'
// host = '192.168.0.104'
var app = express(host);


//===============PASSPORT===============

// Passport session setup.
passport.serializeUser(function(user, done) {
  console.log("serializing " + user.username);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  console.log("deserializing " + obj);
  done(null, obj);
});

// Use the LocalStrategy within Passport to login/"signin" users.
passport.use('local-signin', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localAuth(username, password)
    .then(function (user) {
      if (user) {
        console.log("LOGGED IN AS: " + user.username);
        req.session.success = 'You are successfully logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
        req.session.error = 'Could not log user in. Please try again.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));
// Use the LocalStrategy within Passport to register/"signup" users.
passport.use('local-signup', new LocalStrategy(
  {passReqToCallback : true}, //allows us to pass back the request to the callback
  function(req, username, password, done) {
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        console.log("REGISTERED: " + user.username);
        req.session.success = 'You are successfully registered and logged in ' + user.username + '!';
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT REGISTER");
        req.session.error = 'That username is already in use, please try a different one.'; //inform user could not log them in
        done(null, user);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
  }
));

//===============EXPRESS================
// Configure Express
app.use(logger('combined'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride('X-HTTP-Method-Override'));
app.use(session({secret: 'supernova', saveUninitialized: true, resave: true}));
app.use(passport.initialize());
app.use(passport.session());

// Session-persisted message middleware
app.use(function(req, res, next){
  var err = req.session.error,
      msg = req.session.notice,
      success = req.session.success;

  delete req.session.error;
  delete req.session.success;
  delete req.session.notice;

  if (err) res.locals.error = err;
  if (msg) res.locals.notice = msg;
  if (success) res.locals.success = success;

  next();
});

// Configure express to use handlebars templates
var hbs = exphbs.create({
    defaultLayout: 'main',
});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

//===============ROUTES===============

//displays our homepage
app.get('/home', function(req, res){
  res.render('home', {user: req.session.user});
});

//
app.get('/lobby', function(req, res){
  let room = req.cookies['group_session_room'];
  if (req.session.user && room) {
    res.render('lobby', {group_session_room:room, user: req.session.user});
  } else{
    res.render('lobby', {user: req.session.user});
  }
  
});

//displays our signup page
app.get('/signin', function(req, res){
  console.log(req.session)
  let room = req.cookies['group_session_room'];
  if (req.session.user && room) {
    // if already signin, redirect to lobby page
    res.render('lobby', {group_session_room:room, user: req.session.user});
  } else {
    res.render('signin');
  }
});

app.get('/signup', function(req, res){
  res.render('signup');
})

//sends the request through our local signup strategy, and if successful takes user to homepage, otherwise returns then to signin page
// app.post('/local-reg', passport.authenticate('local-signup', {
//   successRedirect: '/lobby',
//   failureRedirect: '/signin'
//   })
// );

//sends the request through our local login/signin strategy, and if successful takes user to homepage, otherwise returns then to signin page
// app.post('/login', passport.authenticate('local-signin', {
//   successRedirect: 'lobby',
//   failureRedirect: '/signin'
//   })
// );

app.post('/local-reg', (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) { return res.render('signup', {error: 'Sign up exception'}) }
    if (!user) { return res.render('signup', {error: 'Username already exist'})}
    req.session.user = user;
    return res.redirect('lobby');
  })(req, res, next);
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local-signin', (err, user, info) => {
    if (err) { return res.render('signin', {error: 'Sign up exception'}) }
    if (!user) { return res.render('signin', {error: 'User does not exist'})}
    req.session.user = user;
    return res.redirect('lobby');
  })(req, res, next);
});

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  if (!req.session.user) {
    res.redirect('/signin'); 
  } else {
    const name = req.session.user.username;
    console.log("LOGGIN OUT " + req.session.user.username)
    delete req.session.user;
    req.logout();
    res.redirect('/signin');
    req.session.notice = "You have successfully been logged out " + name + "!";
  }

});

//=====================================

// - Simple route middleware to ensure user is authenticated.
// - Call this at the start of a get or post
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { 
    return next(); 
  }
  // req.session.error = 'Please sign in!';
  res.redirect('/signin');
}

// app.use(serveStatic('server/static', {'index': ['index.html']}));
// app.use('/room', ensureAuthenticated);
app.use('/room', serveStatic('server/static', {'index': ['home.html']}));

//======== CREATING GROUP SESSION ========

// Maybe switch to just session instead of cookies for security reasons

// when create group session:
// server returns an id for the room
// save id in a cookie and in a session
// use the coookie to load the room id in the static html

// Getting friends to join room as well:
// Have an "invite" button with friends list when creating room
// Allow friends to enter a code to join the room on the "create room" page

// -- Create room page --
// [Create new room] -> gives room id to share with friends
// [Join room: enter room id ___]
// [Go to room]

app.get('/createRoom', function(req, res){
    // if (req.room_name){} // user creates group name
    let randomInt = Math.floor((Math.random() * 10000000) + 1);
    let room_name = randomInt.toString(16);
    // send a cookie
    res.cookie('group_session_room', room_name.toString());
    req.session.group_session_room = room_name;

    if (req.session.user) {
      res.render('lobby', {group_session_room: room_name, user: req.session.user});
    } else {
      res.render('lobby', {group_session_room: room_name});
    }
});

app.post('/joinRoom', function(req, res){
    var roomInfo = req.body;
    if(!roomInfo.room_id){
        res.render('lobby', {});
    } else {
        let room_id = roomInfo.room_id;
        res.cookie('group_session_room', room_id);
        req.session.group_session_room = room_id;
        
        if (req.session.user) {
          res.render('lobby', {group_session_room: room_id, user: req.session.user});
        } else {
          res.render('lobby', {group_session_room: room_id});
        }
    }
});

//=====================================

// Start Express http server
var webServer = http.createServer(app);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

var myIceServers = [
  {"url":"stun:stun.l.google.com:19302"},
  {"url":"stun:stun1.l.google.com:19302"},
  {"url":"stun:stun2.l.google.com:19302"},
  {"url":"stun:stun3.l.google.com:19302"}
  // {
  //   "url":"turn:[ADDRESS]:[PORT]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // },
  // {
  //   "url":"turn:[ADDRESS]:[PORT][?transport=tcp]",
  //   "username":"[USERNAME]",
  //   "credential":"[CREDENTIAL]"
  // }
];
easyrtc.setOption("appIceServers", myIceServers);
easyrtc.setOption("logLevel", "debug");
easyrtc.setOption("demosEnable", false);

// Overriding the default easyrtcAuth listener, only so we can directly access its callback
easyrtc.events.on("easyrtcAuth", function(socket, easyrtcid, msg, socketCallback, callback) {
    easyrtc.events.defaultListeners.easyrtcAuth(socket, easyrtcid, msg, socketCallback, function(err, connectionObj){
        if (err || !msg.msgData || !msg.msgData.credential || !connectionObj) {
            callback(err, connectionObj);
            return;
        }

        connectionObj.setField("credential", msg.msgData.credential, {"isShared":false});

        console.log("["+easyrtcid+"] Credential saved!", connectionObj.getFieldValueSync("credential"));

        callback(err, connectionObj);
    });
});

// To test, lets print the credential to the console for every room join!
easyrtc.events.on("roomJoin", function(connectionObj, roomName, roomParameter, callback) {
    console.log("["+connectionObj.getEasyrtcid()+"] Credential retrieved!", connectionObj.getFieldValueSync("credential"));
    easyrtc.events.defaultListeners.roomJoin(connectionObj, roomName, roomParameter, callback);
});

// Start EasyRTC server
var rtc = easyrtc.listen(app, socketServer, null, function(err, rtcRef) {
    console.log("Initiated");

    rtcRef.events.on("roomCreate", function(appObj, creatorConnectionObj, roomName, roomOptions, callback) {
        console.log("roomCreate fired! Trying to create: " + roomName);

        appObj.events.defaultListeners.roomCreate(appObj, creatorConnectionObj, roomName, roomOptions, callback);
    });
});

//listen on port
webServer.listen(port, function () {
  console.log('listening on http://localhost:' + port);
});
