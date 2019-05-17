var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'); //config file contains all tokens and other private info

var fs = require('fs');
var AWS = require('aws-sdk');
var path = require('path');

const keys = require('../privateKeys/keys');

const AWSAccessKeyId = keys.aws.AWSAccessKeyId;
const AWSSecretKey = keys.aws.AWSSecretKey;

AWS.config.update({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey
});

var s3 = new AWS.S3();
const bucketName = "vusbutterworth";
const VREnvironmentsDir = "tempEnvs";

/**
 * This method will check if the vus bucket already exist
 *  if not, it will call `createVusBucket()` to create
 *  the corresponding bucket.
 */
var checkIfVusBucketExist = () => {

  var params = {
    Bucket: bucketName
  };
  console.log("checking if bucket exists");
  s3.headBucket(params, function(err, data) {
    if (err) {
      if (err.statusCode >= 400 && err.statusCode < 500) {
        // does not exist this bucket
        createVusBucket();
        return;
      }
      throw new Error(`S3 error: ` + err.stack);
    } else {
      // already has the bucket
      return;
    }
  });
}

/**
 * This method will create the s3 bucket used for Vus
 */
var createVusBucket = () => {
  var params = {
    Bucket: bucketName,
    CreateBucketConfiguration: {
      LocationConstraint: "us-west-2"
    }
  };

  console.log("Create Vus bucket");

  s3.createBucket(params, function(err, data) {
    if (err) console.log(err, err.stack);
  });
};

// this will call every time when npm restarts
checkIfVusBucketExist();


// MongoDB connection information
var mongodbUrl = 'mongodb://' + config.mongodbHost + ':27017/users';
var MongoClient = require('mongodb').MongoClient

//used in local-signup strategy
exports.localReg = function (username, password) {

  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
    var collection = db.collection('localUsers');

    //check if username is already assigned in our database
    collection.findOne({'username' : username})
      .then(function (result) {
        if (null != result) {
          console.log("USERNAME ALREADY EXISTS:", result.username);
          deferred.resolve(false); // username exists
        }
        else  {
          var hash = bcrypt.hashSync(password, 8);
          var user = {
            "username": username,
            "password": hash,
            "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG",
            "environments": [],
            "room": ""
          }

          console.log("CREATING USER:", username);

          collection.insert(user)
            .then(function () {
              db.close();
              deferred.resolve(user);
            });
        }
      });
  });

  return deferred.promise;
};

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
    var collection = db.collection('localUsers');

    collection.findOne({'username' : username})
      .then(function (result) {
        if (null == result) {
          console.log("USERNAME NOT FOUND:", username);

          deferred.resolve(false);
        }
        else {
          var hash = result.password;

          console.log("FOUND USER: " + result.username);

          if (bcrypt.compareSync(password, hash)) {
            deferred.resolve(result);
          } else {
            console.log("AUTHENTICATION FAILED");
            deferred.resolve(false);
          }
        }

        db.close();
      });
  });

  return deferred.promise;
}

exports.localUploadModel = function(username, fileName, envDescription, envTag, localFilePath) {

  var deferred = Q.defer();

  var params = {
    Bucket: bucketName,
    Body: fs.ReadStream(localFilePath),
    Key: username + "/" + fileName
  }

  s3.upload(params, function (err, data) {
    // handle error
    if (err) {
      console.log("Error", err);
      deferred.resolve(false);
    } else if (data) {
      console.log("Uploaded in:", data.Location);
      // store file metadata info into local storage
      MongoClient.connect(mongodbUrl, function(err, db) {
        var environmentCollection = db.collection("localEnvironments");
        environmentCollection.findOne({'username' : username, "fileName": fileName})
          .then(function(result) {
            var newEnvironment = {
              "fileName": fileName,
              "uploadTime": new Date().toDateString(),
              "description": envDescription,
              "username": username,
              "tag": envTag
            };
            if (result == null) {
              environmentCollection.insert(
                newEnvironment
              ).then(function() {
                db.close();
              });
            } else {
              environmentCollection.updateOne({'username' : username, "fileName": fileName}
                , { $set: {
                  "uploadTime": new Date().toDateString(),
                  "description": envDescription,
                  "tag": envTag
                } }, function(err, result) {
                  db.close();
              });
            }
            deferred.resolve(true);
          })

      });
    }
  });
  return deferred.promise;
}

exports.localRemoveModel = function(username, fileName) {

  var deferred = Q.defer();

  var params = {
    Bucket: bucketName,
    Key: username + "/" + fileName
  }

  s3.deleteObject(params, function(err, data) {
    if (err) {
      console.log(err);
      deferred.resolve(false);
    } else if (data) {
      console.log(data);
      MongoClient.connect(mongodbUrl, function(err, db) {
        var environmentCollection = db.collection("localEnvironments");
        environmentCollection.deleteOne({'username': username, "fileName":fileName})
          .then(function(res) {
            if (err) throw err;
            console.log(`${fileName} for user ${username} is deleted`);
            deferred.resolve(true);
            db.close();
          });
      });
    }
  })

  return deferred.promise;
}

exports.findEnvs = function(directoryNames) {
  var deferred = Q.defer();

  console.log("In find Envs for directoryNames: " + directoryNames);
  MongoClient.connect(mongodbUrl, function(err, db) {
    var environmentCollection = db.collection("localEnvironments");
    const ORQuery = [];
    directoryNames.forEach(
      directory => {
        ORQuery.push({'tag':directory});
      }
    )

    environmentCollection.find({
      "$or": ORQuery
    }).toArray(function(err, res){
      db.close();
      deferred.resolve(res);
    });
  })

  return deferred.promise;
}

/**
 * This method will load VR environment gltf files from S3 buckets
 *  and load them into a temporary folder. These environments will
 *  be dynamically generated in the VR lobby when the user enters
 *  the 3D environments.
 * 
 * username => string
 * fileNames => [file1, file2, file3] (.gltf files to display in the VR space)
 */
exports.localGetVRFilesFromS3 = function(environmentList) {
  var deferred = Q.defer();

  environmentList.forEach(
    env => {
      var params = {
        Bucket: bucketName,
        Key: env.username + "/" + env.fileName
      }
      const file = fs.createWriteStream(`./${VREnvironmentsDir}/${env.fileName}`);
      s3.getObject(params, function(err, data) {
        if (err) {
          console.log(err);
        } else if (data) {
          console.log(data);
          file.write(data.Body, () => {
            file.end();
          });
        }
      });
    }
  );

  deferred.resolve(true);
  return deferred.promise;
}

/**
 * This method will remove all the existing VR environments in our temporary VR
 *  environment folders. This method will tend to be called if the users specify
 *  the new environments that they want to visit other than the default ones.
 */
exports.localRemoveVRFilesInTemp = function() {
  var deferred = Q.defer();
  const directory = `./${VREnvironmentsDir}`;
  fs.readdir(directory, (err, files) => {
    if (err) throw err;
    for (const file of files) {
      fs.unlink(path.join(directory, file), err => {
        if (err) throw err;
      })
    }
    deferred.resolve(true);
  });

  return deferred.promise;
}

/**
 * Find all the VR environments uploaded by the user
 */
exports.localGetModels = function(username) {
  var deferred = Q.defer();
  MongoClient.connect(mongodbUrl, function(err, db) {
    var environmentCollection = db.collection("localEnvironments");
    environmentCollection.find({'username': username}).toArray(function(err, res) {
      deferred.resolve(res);
      db.close();
    })
  });

  return deferred.promise;
}

// ========================================================================
// Methods for storing the information about each group:

exports.localCheckGroupExist = function(groupID) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function(err, db) {
    const groupCollection = db.collection("localGroups");
    groupCollection.findOne({'id' : groupID}).then(
      res => {
        if (err) throw err;
        if (!res) {
          deferred.resolve(false);
        } else {
          deferred.resolve(true);
        }
        db.close();
      }
    );
  });

  return deferred.promise;
}

exports.localCreateGroup = function(groupID, defaultDirectories) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function(err, db) {
    const groupCollection = db.collection("localGroups");
    groupCollection.findOne({'id' : groupID}).then(
      res => {
        if (err) throw err;
        if (!res) {

          const group = {
            directories: defaultDirectories,
            id: groupID,
            userCount: 1
          }

          console.log("CREATING GROUP:", group);

          groupCollection.insert(group)
            .then(function() {
              db.close();
              console.log("Resolved in insert")
              deferred.resolve(group);
            })
        } else {
          console.log("Resolved here")
          deferred.resolve(false);
          db.close();
        }
      }
    );
  });

  return deferred.promise;
}

exports.localJoinGroup = function(groupID) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function(err, db) {
    const groupCollection = db.collection("localGroups");
    groupCollection.findOne({'id' : groupID}).then(
      res => {
        if (err) throw err;
        if (!res) {
          deferred.resolve(false);
          db.close();
        } else {
          groupCollection.findOneAndUpdate({'id': groupID}, {
            $set: {
              "directories": res.directories,
              "id": groupID,
              "userCount": res.userCount + 1
            }
          }, function(err, result) {
            console.log("Update result");
            console.log(result); 
            deferred.resolve(result.value);
            db.close();
          });
        }
      }
    )
  });

  return deferred.promise;
}

exports.localLeaveGroup = function(groupID) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function(err, db) {
    const groupCollection = db.collection("localGroups");
    groupCollection.findOne({'id' : groupID}).then(
      res => {
        if (err) throw err;
        if (!res) {
          deferred.resolve(true);
          db.close();
        } else {
          if (res.userCount > 1) {
            groupCollection.updateOne({'id': groupID}, {
              $set: {
                "directories": res.directories,
                "id": groupID,
                "userCount": res.userCount - 1
              }
            }, function(err, result) {
  
              deferred.resolve(true);
              db.close();
            });
          } else {
            groupCollection.deleteOne({'id' : groupID}).then(res => {
              if (err) throw err;
              console.log(`groupID ${groupID} is deleted`);
              deferred.resolve(true);
              db.close();
            })
          }

        }
      }
    )
  });

  return deferred.promise;
}

exports.localUpdateGroupEnvs = function(groupID, newEnvironments) {
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function(err, db) {
    const groupCollection = db.collection("localGroups");
    groupCollection.findOne({'id' : groupID}).then(
      res => {
        if (err) throw err;
        if (!res) {
          deferred.resolve(false);
          db.close();
        } else {
          groupCollection.updateOne({'id': groupID}, {
            $set: {
              "directories": newEnvironments,
              "id": groupID,
              "userCount": res.userCount
            }
          }, function(err, result) {

            deferred.resolve(true);
            db.close();
          })
        }
      }
    )
  });

  return deferred.promise;
}


/**
 * Interface Design:
 * 
 * user =>
 *  username: string
 *  password: string (hashed using bcrypt)
 *  avator: image
 *  enviornments: string[] (name of the environment that the user owns)
 * 
 * environment =>
 *  name: string
 *  uploadTime: Date
 *  description: string
 *  uploaderName: string
 *  tag: string
 * 
 * group =>
 *  directories: string[], // list of tags which will be used to find all environments in that tag
 *  id: string,
 *  userCount: number // number of user in this group (if reaches 0, delete this group in the DB)
 * 
 * ------------------------------------------------------------------------------------------------
 * 
 * Storage Design:
 * 
 * currently make environment name unique for each user (cannot have 2 iphone.txt under a single
 *  user's name, but can have iphone.txt for 2 different users)
 * 
 * AWS s3 buckets =>
 *  each user will have a folder under a s3 bucket,
 *  each item in the s3 bucket will be the actual file with name
 *    consistent with the environment name stored in the database
 */

// set the room for the user on the database
exports.setUserRoom = function(username,room_id){
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
      var collection = db.collection('localUsers');

      // find user
      collection.findOne({'username': username}).then(function(result) {
          if (null != result) {
            // update the room entree in the user model
            collection.updateOne({"_id":result._id}, {$set: {"room":room_id}})
          }
          else{
            deferred.resolve(false);
          }
      });
      
  });
}

// get the room that the user has
exports.getUserRoom = function(username,vus_group_session_auth){
  var deferred = Q.defer();

  MongoClient.connect(mongodbUrl, function (err, db) {
      var collection = db.collection('localUsers');

      // find user
      collection.findOne({'username': username}).then(function(result) {
          deferred.resolve(result.room);
      }); 
  });
  return deferred.promise;
};

