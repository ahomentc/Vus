var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'); //config file contains all tokens and other private info

var fs = require('fs');
var AWS = require('aws-sdk');

const AWSAccessKeyId = 'AKIAIDFOHMBZUAZSXELQ';
const AWSSecretKey = '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';

AWS.config.update({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey
});

var s3 = new AWS.S3();
const bucketName = "vusbutterworth";
var isBucketValid = false; 

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
      isBucketValid = true;
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
    else {
      isBucketValid = true;
    }
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
            "environments": []
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

  var params = {
    Bucket: bucketName,
    Body: fs.ReadStream(localFilePath),
    Key: username + "/" + fileName
  }

  s3.upload(params, function (err, data) {
    // handle error
    if (err) {
      console.log("Error", err);
    }
  
    // successful upload to s3
    if (data) {
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
          })

      });
    }
  });
}


/**
 * Storage Design:
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
 * currently make environment name unique for each user (cannot have 2 iphone.txt under a single
 *  user's name, but can have iphone.txt for 2 different users)
 * 
 * AWS s3 buckets =>
 *  each user will have a folder under a s3 bucket,
 *  each item in the s3 bucket will be the actual file with name
 *    consistent with the environment name stored in the database
 */