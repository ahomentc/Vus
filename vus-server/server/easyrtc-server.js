// Load required modules
var http    = require("http");              // http server core module
var https   = require("https");
var express = require("express");           // web framework external module
var serveStatic = require('serve-static');  // serve static files
var socketIo = require("socket.io");        // web socket external module
var easyrtc = require("easyrtc");               // EasyRTC external module
var exphbs = require('express-handlebars'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    methodOverride = require('method-override'),
    session = require('express-session'),
    passport = require('passport'),
    LocalStrategy = require('passport-local'),
    FacebookStrategy = require('passport-facebook');

const path = require('path');
    
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const multer  = require('multer');
const upload = multer({ preservePath: true });
const keys = require('../../privateKeys/keys');
const fs = require('fs');
var SHA256 = require("crypto-js/sha256");

var config = require('./config.js'); //config file contains all tokens and other private info
var funct = require('./functions.js'); //funct file contains our helper functions for our Passport and database work
var cors = require('cors');

// Set process name
process.title = "node-easyrtc";

// Get port or default to 8090
//var port = 8090;
var port = process.env.PORT || 8090;

// Setup and configure Express http server. Expect a subfolder called "static" to be the web root.
const host = '127.0.0.1'
// const host = '192.168.0.121'
// const host = '192.168.90.95'
//const host = 'https://18.237.109.96'
// host = '192.168.0.124'
// host = '192.168.0.104'
// host = '192.168.50.97'


var app = express(host);
app.use(cors());


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
        done(null, user);
      }
      if (!user) {
        console.log("COULD NOT LOG IN");
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
    // save stuff to db
    funct.localReg(username, password)
    .then(function (user) {
      if (user) {
        done(null, user);
      }
      if (!user) {
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

app.use(express.cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.session({ secret: 'anything' }));
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(require('express-status-monitor')());

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

app.use(express.static(path.join(__dirname, '/static/landing_page')));
app.get('/',function(req, res){
  if(!req.session.user) {
    res.sendfile(path.join(__dirname + '/static/landing_page/index.html'));
  } else {
    res.render('home', {user: req.session.user})
  }
});

app.get('/old', function(req, res) {
  res.render('home', {user: req.session.user});
});

app.get('/requestvr', (req, res) => {
  if(!req.session.user) {
    res.render('request_vr')
  } else {
    res.render('request_vr', {user: req.session.user})
  }
});

// display lobby
// app.get('/lobby', function(req, res){
//   const room = req.cookies['group_session_room'];
//   console.log("Room = " + room);
//   // room types are username (default: 'zillow', 'theater')
//   const room_types = req.cookies['group_room_types'];
//   console.log(room_types);

//   funct.localCheckGroupExist(room).then(
//     value => {
//       if (value && room_types && room_types !== []) {
//         const resultMap = {};
//         funct.findEnvs(room_types).then(resultList => {
//           resultList.forEach(environment => {
//             if(resultMap[environment.username]) {
//               resultMap[environment.username].push(environment);
//             } else {
//               resultMap[environment.username] = [environment];
//             }
//           });

//           req.session.env_list = resultList;
//           req.session.group_map = resultMap;
//           res.cookie("env_list",JSON.stringify(resultList));
          
//           const hasEnvs = resultList.length > 0;

//           // resultMap will be passed to lobby to give each environment better explainations
//           if (req.session.user) {
//             res.render('lobby', {error: req.session.error, group_session_room:room,hasEnvs: hasEnvs, 
//               user: req.session.user, group_map: resultMap});
//           } else {
//             res.render('lobby', {error: req.session.error, group_session_room:room,hasEnvs: hasEnvs, 
//               group_map: resultMap});
//           }
//         })
//       } else {
//         res.redirect('createRoom');
//       }
//     }
//   )

//   delete req.session.success;
// });

app.use(express.static(path.join(__dirname, '/react_vus/build')));
app.get('/real_estate',function(req, res){
  res.sendfile(path.join(__dirname + '/react_vus/build/index.html'));
});

//displays our signin page
app.get('/signin', function(req, res){
  let room = req.cookies['group_session_room'];
  console.log("Room = " + room);
  if (req.session.user && room) {
    // if already signin, redirect to lobby page
    res.render('/', {group_session_room:room, user: req.session.user});
    // res.redirect(req.session.returnTo || '/');
    // delete req.session.returnTo;
  } else {
    // reset previous group session cookie if not entering as the same user
    res.clearCookie('group_session_room');
    res.render('signin');
  }
});

app.get('/signup', function(req, res){
  res.render('signup');
})

app.post('/local-reg', (req, res, next) => {
  passport.authenticate('local-signup', (err, user, info) => {
    if (err) { return res.render('signup', {error: 'Sign up exception'}) }
    if (!user) { return res.render('signup', {error: 'Username already exist'})}
    req.session.user = user;
    return res.redirect('/');
  })(req, res, next);
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local-signin', (err, user, info) => {
    if (err) { return res.render('signin', {error: 'Sign up exception'}) }
    if (!user) { return res.render('signin', {error: 'User does not exist'})}
    req.session.user = user;

    // create a new room ID when the user logins
    let randomInt = Math.floor((Math.random() * 10000000) + 1);
    let room_name = randomInt.toString(16);
    // send a cookie
    res.cookie('group_session_room', room_name.toString());
    
    return res.redirect('/');
  })(req, res, next);
});

//logs user out of site, deleting them from the session, and returns to homepage
app.get('/logout', function(req, res){
  if (!req.session.user) {
    res.redirect('/signin'); 
  } else {
    const name = req.session.user.username;
    delete req.session.error;
    delete req.session.user;
    req.logout();
    res.redirect('/signin');
    req.session.notice = "You have successfully been logged out " + name + "!";
  }
});

app.get('/vrmanager', (req, res) => {
  if(!req.session.user) {
    res.redirect('signin');
  } else {
    res.render('vrspacemanager', {user: req.session.user})
  }
});

app.get('/uploadImages', (req, res) => {
  if(!req.session.user) {
    res.redirect('signin');
  } else {
    res.render('upload_images', {user: req.session.user})
  }
});

app.get('/home', (req, res) => {
  if(!req.session.user) {
    res.redirect('signin');
  } else {
    res.render('home', {user: req.session.user})
  }
});

app.get('/vr', (req, res) => {
  res.render('vr')
});


app.get('/userconsole', (req, res) => {
  if (!req.session.user){
    res.redirect('signin');
  } else {    
    funct.localGetModels(req.session.user.username).then(
      models => {
        return res.render('userconsole', {user: req.session.user, env: models});
      }
    );
  }
});


// /tour?username=andrei&name=inverrary
app.get('/tour', (req, res) => {
    var username = req.query.username;
    var env_name = req.query.name;
    funct.getNumImages(username,env_name).then(
      num_images => {
        funct.getLabels(username,env_name).then(
          labels => {
              res.setHeader('Access-Control-Allow-Origin', 'https://d3ga0cb3khynzt.cloudfront.net', 'http://localhost:8090', 'https://vusgroup.com');
              res.render('tour', {username: username, env_name: env_name, num_images: num_images, labels: labels})  
          }
        );
      }
    );
});

// http://localhost:8090/grouplink?groupid=6bea02&reroute=/room/dino/index.html
// app.get('/grouplink', (req, res) => {
//     var newRoomID = req.query.groupid;
//     var reroute = req.query.reroute;

//     const previousID =  req.cookies['group_session_room'];
//     funct.localJoinGroup(newRoomID).then(
//       result => {
//         if (!result) {
//           const error = "group ID does not exist";
//           req.session.error = error;
//           res.redirect('lobby');
//         } else {
//           funct.localLeaveGroup(previousID).then(
//             value => {
//               const vus_username = req.cookies['vus_username'];
//               funct.setUserRoom(vus_username,newRoomID);

//               res.cookie('group_session_room', newRoomID.toString());
//               req.session.group_session_room = newRoomID;

//               var directories = [];
//               result.forEach(groupUser => {
//                 directories.push(groupUser.username);
//               });

//               res.cookie('group_room_types', directories);
//               req.session.group_room_types = directories;

//               // create a session id to be stored in cookie for user authentication
//               var sessionID = SHA256(Math.random().toString())

//               // store username and auth code in cookie
//               res.cookie('vus_group_session_auth', sessionID.toString());

//               if (req.session.user) {
//                 res.cookie('vus_username', req.session.user.username);
//               }

//               // store the room in cookie... remove this later
//               res.cookie('group_session_room', newRoomID.toString());
//               req.session.group_session_room = newRoomID;

//               delete req.session.error;
//               res.redirect(reroute);
//             }
//           )
//         }
//       }
//     ).catch(err => {
//       console.log(err);
//     })
// });

app.post('/removeFile', (req, res) => {
  if (!req.session.user) {
    res.redirect('signin');
  } else {
    funct.localRemoveModel(req.session.user.username, req.body.folder).then(
      result => {
        res.redirect('userconsole');
      }
    );
  }
});

// currently working on this
app.post('/uploadImages', upload.array('new_images'), (req,res) => {
    if (req.session.user == null) {
      res.redirect('signin');
    }

    const directoryName = req.body.folderName;
    const labels = req.body.labels;

    var image_count = 0;

    const uploadedFiles = req.files.map(file => {
        let newPath = file.originalname.split('/')
        newPath = newPath.reverse()
        // pop the old folder name
        newPath.pop();
        newPath.push(directoryName);
        newPath = newPath.reverse().join('/');

        front = newPath.split('/').reverse()[0];
        if(front.substring(0,2) != "._"){
            image_count++;
        }

        return {'originalname': newPath, 'buffer': file.buffer};  
    })

    // --------- NOT ACTUALLY UPLOADING IMAGES ---------

    funct.localUploadImage(req.session.user.username, uploadedFiles, directoryName, req.body.description.trim(), labels).then(
      result => {
        if (!result) {
          req.session.error = "File upload Unsuccessful";
        } else {
          delete req.session.error;
        }
        return res.redirect('/');  
      }
    );
});

app.post('/uploadModel', upload.array('new_models'), (req, res) => {
  if (req.session.user == null) {
    res.redirect('signin');
  }

  const directoryName = req.body.folderName;

  const uploadedFiles = req.files.map(file => {
    let newPath = file.originalname.split('/');
    newPath = newPath.reverse();
    // pop the old folder name
    newPath.pop();
    newPath.push(directoryName);
    newPath = newPath.reverse().join('/');
    return {'originalname': newPath, 'buffer': file.buffer};
  });

  const htmlFileName = req.body.htmlName + ".html";
  const htmlFileFound = uploadedFiles.find(file => file.originalname === directoryName + "/" + htmlFileName);

  if (!htmlFileFound) {
    req.session.error = "HTML file specified is not in the directory uploaded";
    return res.redirect('/');
  }

  funct.localUploadModel(req.session.user.username, uploadedFiles, htmlFileName, directoryName,
    req.body.description.trim(), req.body.tag).then(
      result => {
        if (!result) {
          req.session.error = "File upload Unsuccessful";
        } else {
          delete req.session.error;
        }
        return res.redirect('/');  
      }
    );
});

//===============External Strategies====================

// Use the GoogleStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a token, tokenSecret, and Google profile), and
//   invoke a callback with a user object.
passport.use(new GoogleStrategy({
  clientID: keys.google.clientID,
  clientSecret: keys.google.clientSecret,
  callbackURL: "/auth/google/callback"
}, (accessToken, refreshToken, profile, done) => {
  funct.localAuth(profile.displayName, profile.id)
  .then(function (user) {
    if (user) {
      done(null, user);
    }
    if (!user) {
      funct.localReg(profile.displayName, profile.id).then(function(user) {
        if (user) {
          done(null, user);
        } else {
          done(null, user);
        }
      });
    }
  })
  .fail(function (err){
    console.log(err.body);
  });
}));


app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile']
}));

// when going to this url, another callback will be sent to 'google'
app.get('/auth/google/callback', passport.authenticate('google'), (req, res) => {
  if (!req.user) { return res.render('signup', {error: 'Username already exist'})}
  else {
    req.session.user = req.user;
    delete req.session.error;
    res.redirect('/');
  }
})


// facebook
passport.use(new FacebookStrategy({
  clientID: keys.facebook.clientID,
  clientSecret: keys.facebook.clientSecret,
  callbackURL: "https://www.vusgroup.com/auth/facebook/callback"
}, (accessToken, refreshToken, profile, cb) => {
  funct.localAuth(profile.displayName, profile.id)
  .then(function (user) {
    if (user) {
      cb(null, user);
    }
    if (!user) {
      funct.localReg(profile.displayName, profile.id).then(function(user) {
        if (user) {
          cb(null, user);
        } else {
          cb(null, user);
        }
      });
    }
  })
  .fail(function (err){
    console.log(err.body);
  });
}));

app.get('/auth/facebook', passport.authenticate('facebook', {
  scope: ['email']
}));

app.get('/auth/facebook/callback', passport.authenticate('facebook'), (req, res) => {
  if (!req.user) { return res.render('signup', {error: 'Username already exist'})}
  else {
    req.session.user = req.user;
    delete req.session.error;
    res.redirect('/');
  }
})


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
app.get('/loadRoom', (req, res) => {
  funct.localRemoveVRFilesInTemp().then(
    () => {
      console.log("Temp folders removed");
      funct.localGetVRFilesFromS3(req.session.env_list).then(
        () => {
          console.log("Temp folders loaded from S3");
          res.redirect('VRHome');
        }
      )
    }
  );
});


app.use('/VRHome', serveStatic('server/static/lobby', {'index': ['Lobby.html']}));
app.use('/room', serveStatic('server/static'));
app.use('/js', serveStatic('server/static/js'));

app.use('/envs',serveStatic('tempEnvs'));
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
  const previousID =  req.cookies['group_session_room'];
  funct.localLeaveGroup(previousID).then(
    value => {
      // generate a random hex roomname
      let randomInt = Math.floor((Math.random() * 10000000) + 1);
      let room_id = randomInt.toString(16);

      // TODO: Save room_id in database under logged in user's account
      // req.session.user.room = room_id;
      // console.log(req.session.user.room)
      // req.session.user.room = room_id
      const vus_username = req.cookies['vus_username'];
      funct.setUserRoom(vus_username,room_id);

      res.cookie('group_session_room', room_id.toString());
      req.session.group_session_room = room_id;

      // directory stuff
      const defaultRooms = ['zillow', 'theater'];
      res.cookie('group_room_types', defaultRooms);
      req.session.group_room_types = defaultRooms;

      // create a session id to be stored in cookie for user authentication
      var sessionID = SHA256(Math.random().toString())

      // store username and auth code in cookie
      res.cookie('vus_group_session_auth', sessionID.toString());

      if (req.session.user) {
        res.cookie('vus_username', req.session.user.username);
      }

      // store the room in cookie... remove this later
      res.cookie('group_session_room', room_id.toString());
      req.session.group_session_room = room_id;

      funct.localCreateGroup(room_id.toString(), defaultRooms).then(
        result => {
          delete req.session.error;
          res.redirect('/');
        }
      ).catch(err => {
        console.log(err);
      });

    });
  });

app.get('/getUserRoom',(req,res) => {
    // we'll only get the cookies that vus sets, which is good. no problem here.
    const vus_group_session_auth = req.cookies['vus_group_session_auth'];
    const vus_username = req.cookies['vus_username'];
    funct.getUserRoom(vus_username, vus_group_session_auth)
    .then(function (room) {
      if (room) {
        console.log("ROOM IS: " + room);
        res.send(room);
      }
    })
    .fail(function (err){
      console.log(err.body);
    });
});

app.post('/joinRoom', function(req, res){
    var roomInfo = req.body;
    if(!roomInfo.room_id){
        res.render('/', {});
    } else {
      let newRoomID = roomInfo.room_id;
      const previousID =  req.cookies['group_session_room'];
      funct.localJoinGroup(newRoomID).then(
        result => {
          if (!result) {
            const error = "group ID does not exist";
            req.session.error = error;
            res.redirect('/');
          } else {
            funct.localLeaveGroup(previousID).then(
              value => {
                // TODO: Save room_id in database under logged in user's account
                // req.session.user.room = room_id;
                // console.log(req.session.user.room)
                // req.session.user.room = room_id
                const vus_username = req.cookies['vus_username'];
                funct.setUserRoom(vus_username,newRoomID);

                res.cookie('group_session_room', newRoomID.toString());
                req.session.group_session_room = newRoomID;

                var directories = [];
                result.forEach(groupUser => {
                  directories.push(groupUser.username);
                });

                res.cookie('group_room_types', directories);
                req.session.group_room_types = directories;

                // create a session id to be stored in cookie for user authentication
                var sessionID = SHA256(Math.random().toString())

                // store username and auth code in cookie
                res.cookie('vus_group_session_auth', sessionID.toString());

                if (req.session.user) {
                  res.cookie('vus_username', req.session.user.username);
                }

                // store the room in cookie... remove this later
                res.cookie('group_session_room', newRoomID.toString());
                req.session.group_session_room = newRoomID;

                delete req.session.error;
                res.redirect('/');
              }
            )
          }
        }
      ).catch(err => {
        console.log(err);
      })

    }
});


app.post('/addMoreRooms', (req, res) => {
  // update group cookie
  let room_types = req.cookies['group_room_types'];
  room_types.push(req.body.newRoom);
  res.cookie('group_room_types', room_types);

  // update group in DB
  const groupID = req.cookies['group_session_room'];
  funct.localUpdateGroupEnvs(groupID, room_types).then(
    () => {
      res.redirect('lobby');
    }
  );
});

app.post('/deleteRooms', (req, res) => {
  // update group cookie
  const room_types = req.cookies['group_room_types'];

  // remove the type
  const updatedRoomTypes = room_types.filter(type => type !== req.body.deletedOwner);

  res.cookie('group_room_types', updatedRoomTypes);

  // update group in DB
  const groupID = req.cookies['group_session_room'];
  funct.localUpdateGroupEnvs(groupID, updatedRoomTypes).then(
    () => {
      res.redirect('lobby');
    }
  );

});

//=====================================

// Start Express http server

var webServer = http.createServer(app);
// var webServer = https.createServer({
//   key: fs.readFileSync(__dirname + '/server.key'),
//   cert: fs.readFileSync(__dirname + '/server.cert')
// }, app);

// Start Socket.io so it attaches itself to Express server
var socketServer = socketIo.listen(webServer, {"log level":1});

//var socketServer = socketIo.listen(5000);

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
