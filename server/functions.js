var bcrypt = require('bcryptjs'),
    Q = require('q'),
    config = require('./config.js'); //config file contains all tokens and other private info

var fs = require('fs');
var AWS = require('aws-sdk');

const keys = require('../privateKeys/keys');
const rimraf = require("rimraf");

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


// PostgresSQL connection

const { Pool } = require('pg');
const prepareStatements = require('../server/databaseQueries');

// connection pooling for PostgreSQL
const pool = new Pool({
  user: keys.psql.databaseID,
  password:  keys.psql.databasePassword,
  database: 'vusdb'
});

//used in local-signup strategy
exports.localReg = function (username, password) {

  var deferred = Q.defer();

  var findUserQuery = {...prepareStatements.findUserQuery};
  findUserQuery['values'] = [username]; 
  pool.query(findUserQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length > 0) {
      console.log("USERNAME ALREADY EXISTS:", result.username);
      deferred.resolve(false); // username exists
    } else {
      const hash = bcrypt.hashSync(password, 8);
      var registerUserQuery = {...prepareStatements.registerUserQuery};
      
      registerUserQuery['values'] = [username, hash, "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG", ""]
      pool.query(registerUserQuery, (err, res) => {
        const createdUser = {
          "username": username,
          "password": hash,
          "avatar": "http://placepuppy.it/images/homepage/Beagle_puppy_6_weeks.JPG",
          "room": ""
        }
        deferred.resolve(createdUser);
      });
    }
  });

  return deferred.promise;
};

//check if user exists
    //if user exists check if passwords match (use bcrypt.compareSync(password, hash); // true where 'hash' is password in DB)
      //if password matches take into website
  //if user doesn't exist or password doesn't match tell them it failed
exports.localAuth = function (username, password) {
  var deferred = Q.defer();

  var findUserQuery = {...prepareStatements.findUserQuery};
  findUserQuery['values'] = [username];
  pool.query(findUserQuery, (err, result) => {
    if (err) throw err;
    if (!result || result.rows.length == 0) {
      console.log("USERNAME NOT FOUND:", username);
      deferred.resolve(false);
    } else {
      const foundUser = result.rows[0];
      const hash = foundUser.password;
      if (bcrypt.compareSync(password, hash)) {
        deferred.resolve(foundUser);
      } else {
        console.log("AUTHENTICATION FAILED");
        deferred.resolve(false);
      }
    }
  });

  return deferred.promise;
}

exports.localUploadModel = function(username, uploaded_files, envHtmlName, folderName, envDescription, envTag) {

  var deferred = Q.defer();

  uploaded_files.forEach(file => {
    var params = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: username + "/" + file.originalname
    }

    s3.upload(params, function (err, data) {
      // handle error
      if (err) {
        console.log("Error", err);
        deferred.resolve(false);
        return deferred.promise;
      } else {
        console.log("Uploaded in:", data.Location);
      }
    });
  });

  var findEnvWithNamesQuery = {...prepareStatements.findEnvWithUserAndEnvName};
  findEnvWithNamesQuery['values'] = [username, folderName];
  pool.query(findEnvWithNamesQuery, (err, result) => {
    if (result.rows.length == 0) {
      var insertNewEnvQuery = {...prepareStatements.insertNewEnvQuery};
      insertNewEnvQuery['values'] = [folderName, envHtmlName, new Date().toDateString(), envDescription, username, envTag];
      pool.query(insertNewEnvQuery, (err, result) => {
        if (err) throw err;
      });
    } else {
      var updateEnvQuery = {...prepareStatements.updateEnvQuery};
      updateEnvQuery['values'] = [folderName, envHtmlName, new Date().toDateString(), envDescription, username, envTag];
      pool.query(updateEnvQuery, (err, result) => {
        if (err) throw err;
      });
    }
  });

  deferred.resolve(true);
  return deferred.promise;
}

exports.localRemoveModel = function(username, folderName) {

  var deferred = Q.defer();

  const folderPath = username + "/" + folderName + "/";
  recursiveDeleteVREnvsInS3(folderPath);

  var deleteEnvQuery = {...prepareStatements.deleteEnvQuery};
  deleteEnvQuery['values'] = [username, folderName];
  pool.query(deleteEnvQuery, (err, result) => {
    if (err) throw err;
    console.log(`${folderName} for user ${username} is deleted`);
    deferred.resolve(true);
  })

  deferred.resolve(true);
  return deferred.promise;
}

const recursiveDeleteVREnvsInS3 = function(folderPrefix) {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: folderPrefix
  }

  s3.listObjectsV2(params, function(err, data) {
    if(err) throw err;

    console.log(data);

    // delete all directories first
    data.CommonPrefixes.forEach(prefix => {
      recursiveDeleteVREnvsInS3(prefix.Prefix);
    });

    const deleteParam = {
      Bucket: bucketName,
      Delete: {Objects: []}
    }
    data.Contents.forEach(s3Object => {
      deleteParam.Delete.Objects.push({Key: s3Object.Key});
    });

    deleteParam.Delete.Objects.push({Key: folderPrefix});

    s3.deleteObjects(deleteParam, function(err, data) {
      if(err) throw err;
    });
  });
}

exports.findEnvs = function(userNames) {
  var deferred = Q.defer();

  var findEnvsForUserQuery = {...prepareStatements.findEnvsForUserQuery};

  findEnvsForUserQuery['values'] = [[userNames]];

  pool.query(findEnvsForUserQuery, (err, result) => {
    if (err) throw err;
    const envs = result.rows;
    deferred.resolve(envs);
  });

  return deferred.promise;
}

/**
 * This method will load VR environment folders from S3 buckets
 *  and load them into a temporary folder. These environments will
 *  be dynamically generated in the VR lobby when the user enters
 *  the 3D environments.
 * 
 * username => string
 * envName => [env folder 1, env folder 1, env folder 1]
 */
exports.localGetVRFilesFromS3 = function(environmentList) {
  var deferred = Q.defer();

  environmentList.forEach(env => {
    const prefix = env.username + "/" + env.envName + "/";
    recursiveGetVREnvsFromS3(prefix);
  });

  deferred.resolve(true);
  return deferred.promise;
}

/**
 * This method will recursively load folders from S3
 * 
 * @param folderPrefix directory path in S3 bucket
 */
const recursiveGetVREnvsFromS3 = (folderPrefix) => {
  console.log(`Folder prefix = '${folderPrefix}'`);
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: folderPrefix
  }

  // make temporary directory
  fs.mkdir(`./${VREnvironmentsDir}/${folderPrefix}`, {recursive: true}, (err) => {
    if (err) throw err;
  });

  s3.listObjectsV2(params, function(err, data) {
    if(err)throw err;

    // for files in the directory
    data.Contents.forEach(files => {
      var getFileParam = {
        Bucket: bucketName,
        Key: files.Key
      }

      const file = fs.createWriteStream(`./${VREnvironmentsDir}/${files.Key}`);

      // get the file content and write to temporary folder in the disk
      s3.getObject(getFileParam, function(err, data) {
        if (err) {
          console.log(err);
        } else if (data) {
          file.write(data.Body, () => {
            file.end();
          });
        }
      });
    });

    // for folders in the directory
    data.CommonPrefixes.forEach(prefix => {
      recursiveGetVREnvsFromS3(prefix.Prefix);
    });
  })

  return;
}

/**
 * This method will remove all the existing VR environments in our temporary VR
 *  environment folders. This method will be called if the users enters the VR
 *  environments (before loading new environment files from AWS s3).
 */
exports.localRemoveVRFilesInTemp = function() {
  var deferred = Q.defer();
  const directory = `./${VREnvironmentsDir}`;
  rimraf(directory, function () { 
    console.log("Finish resetting tempEnvironments");
    deferred.resolve(true);
  });


  return deferred.promise;
}

/**
 * Find all the VR environments uploaded by the user
 */
exports.localGetModels = function(username) {
  var deferred = Q.defer();

  var getEnvForUserQuery = {...prepareStatements.getEnvForUserQuery};
  getEnvForUserQuery['values'] = [username];

  pool.query(getEnvForUserQuery, (err, result) => {
    if (err) throw err;
    deferred.resolve(result.rows);
  });

  return deferred.promise;
}

// ========================================================================
// Methods for storing the information about each group:

exports.localCheckGroupExist = function(groupID) {
  var deferred = Q.defer();

  var findGroupQuery = {...prepareStatements.findGroupQuery};
  findGroupQuery['values'] = [groupID];
  pool.query(findGroupQuery, (err, result) => {
    if (err) throw err;
    if (!result) {
      deferred.resolve(false);
    } else {
      deferred.resolve(true);
    }
  });

  return deferred.promise;
}

exports.localCreateGroup = function(groupID, defaultUsers) {
  var deferred = Q.defer();
  var findGroupQuery = {...prepareStatements.findGroupQuery};
  findGroupQuery['values'] = [groupID];
  pool.query(findGroupQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length == 0) {
      var insertGroupQuery = {...prepareStatements.insertGroupQuery};
      insertGroupQuery['values'] = [groupID, 1];
      pool.query(insertGroupQuery, (err, result) => {
        if(err) throw err;

        var groupArr = [];
        defaultUsers.forEach(() => groupArr.push(groupID));

        var insertGroupUserQuery = {...prepareStatements.insertGroupUserQuery};
        insertGroupUserQuery['values'] = [[groupArr],[defaultUsers]];

        pool.query(insertGroupUserQuery, (err, res) => {
          if (err) throw err;
          deferred.resolve(true);
        });

      });
    } else {
      deferred.resolve(false);
    }
  });

  return deferred.promise;
}

exports.localJoinGroup = function(groupID) {
  var deferred = Q.defer();

  var findGroupQuery = {...prepareStatements.findGroupQuery};
  findGroupQuery['values'] = [groupID];
  pool.query(findGroupQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length == 0) {
      deferred.resolve(false);
    } else {
      const groupInfo = result.rows[0];
      var updateGroupQuery = {...prepareStatements.updateGroupQuery};
      updateGroupQuery['values'] = [groupInfo.usercount + 1, groupID];
      pool.query(updateGroupQuery, (err, res) => {
        if (err) throw err;

        var findGroupUserQuery = {...prepareStatements.findGroupUserQuery};
        findGroupUserQuery['values'] = [groupID];
        pool.query(findGroupUserQuery, (err, res) => {
          if (err) throw err;
          deferred.resolve(res.rows);
        });

      });
    }
  });

  return deferred.promise;
}

exports.localLeaveGroup = function(groupID) {
  var deferred = Q.defer();

  var findGroupQuery = {...prepareStatements.findGroupQuery};
  findGroupQuery['values'] = [groupID];
  pool.query(findGroupQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length == 0) {
      deferred.resolve(false);
    } else {
      const groupInfo = result.rows[0];
      if (groupInfo.usercount > 1) {
        var updateGroupQuery = {...prepareStatements.updateGroupQuery};
        updateGroupQuery['values'] = [groupInfo.usercount - 1, groupID];
        pool.query(updateGroupQuery, (err, res) => {
          if (err) throw err;
          deferred.resolve(true);
        });
      } else {
        var deleteGroupQuery = {...prepareStatements.deleteGroupQuery};
        deleteGroupQuery['values'] = [groupID];

        pool.query(deleteGroupQuery, (err, res) => {
          if (err) throw err;
          var deleteGroupUserQuery = {...prepareStatements.deleteGroupUserQuery};
          deleteGroupUserQuery['values'] = [groupID];

          pool.query(deleteGroupUserQuery, (err, res) => {
            if (err) throw err;
            deferred.resolve(true);
          });
        })
      }
    }
  });


  return deferred.promise;
}

exports.localUpdateGroupEnvs = function(groupID, newUserEnvironments) {
  var deferred = Q.defer();
  var deleteGroupUserQuery = {...prepareStatements.deleteGroupUserQuery};
  deleteGroupUserQuery['values'] = [groupID];
  pool.query(deleteGroupUserQuery, (err, res) => {
    if (err) throw err;
    deferred.resolve(true);
    var groupArr = [];
    newUserEnvironments.forEach(() => groupArr.push(groupID));

    var insertGroupUserQuery = {...prepareStatements.insertGroupUserQuery};
    insertGroupUserQuery['values'] = [[groupArr],[newUserEnvironments]];

    pool.query(insertGroupUserQuery, (err, res) => {
      if (err) throw err;
      deferred.resolve(true);
    })


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
 *  envName: string
 *  htmlName: string
 *  uploadTime: Date
 *  description: string
 *  username: string
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

  var findUserQuery = {...prepareStatements.findUserQuery};
  findUserQuery['values'] = [username]; 
  pool.query(findUserQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length == 0) {
      deferred.resolve(false); // username does not exists
    } else {
      var updateUserRoomQuery = {...prepareStatements.updateUserRoomQuery};
      updateUserRoomQuery['values'] = [room_id, username];
      pool.query(updateUserRoomQuery, (err, res) => {
        if (err) throw err;
        deferred.resolve(true);
      })
    }
  });

}

// get the room that the user has
exports.getUserRoom = function(username,vus_group_session_auth){
  var deferred = Q.defer();

  var findUserQuery = {...prepareStatements.findUserQuery};
  findUserQuery['values'] = [username]; 
  pool.query(findUserQuery, (err, result) => {
    if (err) throw err;
    if (result.rows.length == 0) {
      deferred.resolve(false); // username does not exists
    } else {
      const user = result.rows[0];
      deferred.resolve(user.room);
    }
  });
  return deferred.promise;
};

