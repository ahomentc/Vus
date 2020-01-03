var bcrypt = require('bcryptjs'),
    Q = require('q')

var fs = require('fs');
var AWS = require('aws-sdk');

const keys = require('../../privateKeys/keys');
const rimraf = require("rimraf");

const AWSAccessKeyId = keys.aws.AWSAccessKeyId;
const AWSSecretKey = keys.aws.AWSSecretKey;
const bucketName = "vusbucket";
const VREnvironmentsDir = "tempEnvs";

AWS.config.update({
  accessKeyId: AWSAccessKeyId,
  secretAccessKey: AWSSecretKey,
  region: 'us-west-1',
  s3BucketEndpoint: true,
  endpoint:"http://vusbucket.s3-us-west-1.amazonaws.com/"
});

var s3 = new AWS.S3();

/**
 * This method will check if the vus bucket already exist
 *  if not, it will call `createVusBucket()` to create
 *  the corresponding bucket.
 */
var checkIfVusBucketExist = () => {

  var params = {
    Bucket: bucketName
  };

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


  s3.createBucket(params, function(err, data) {
    if (err) throw err;
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
      deferred.resolve(false); // username exists
    } else {
      const hash = bcrypt.hashSync(password, 8);
      var registerUserQuery = {...prepareStatements.registerUserQuery};
      
      registerUserQuery['values'] = [username, hash]
      pool.query(registerUserQuery, (err, res) => {
        const createdUser = {
          "username": username,
          "password": hash
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
      deferred.resolve(false);
    } else {
      const foundUser = result.rows[0];
      const hash = foundUser.password;
      if (bcrypt.compareSync(password, hash)) {
        deferred.resolve(foundUser);
      } else {
        deferred.resolve(false);
      }
    }
  });

  return deferred.promise;
}

async function uploadToAWS (deferred, username, uploaded_files) {
  console.log("Upload to aws");
  var count = 0;
  let result = [];
  for (let file of uploaded_files) {
    const params = {
      Bucket: bucketName,
      Body: file.buffer,
      Key: username + "/" + file.originalname,
      ACL: 'public-read'
    }

    result.push(s3.upload(params, function (err, data) {
      // handle error
      ++count;
      if (err) {
        console.log(err);
        deferred.resolve(false);
        return deferred.promise;
      }
      console.log("File " + count + " upload success");
    }));
  }

  await Promise.all(result);
}

exports.localUploadImage = async function(username, uploaded_files, folderName, description, labels){
    var deferred = Q.defer();
    console.log("uploaded_files length = " + uploaded_files.length);
    await uploadToAWS(deferred, username, uploaded_files);

    var findImagesWithUserAndEnvName = {...prepareStatements.findImagesWithUserAndEnvName};
    findImagesWithUserAndEnvName['values'] = [username, folderName];

    var insertNewImageEnvQuery = {...prepareStatements.insertNewImageEnvQuery};
    insertNewImageEnvQuery['values'] = [folderName, new Date().toDateString(), description, username, uploaded_files.length, labels]
    pool.query(insertNewImageEnvQuery, (err, result) => {
      if (err) throw err;
    });

    // now create an entree in the house table with the images



    // pool.query(findImagesWithUserAndEnvName, (err, result) => {
    //   if (result.rows.length == 0) {
    //     var insertNewImageEnvQuery = {...prepareStatements.insertNewImageEnvQuery};
    //     insertNewImageEnvQuery['values'] = [foldername, new Date().toDateString(), description, username]
    //     pool.query(insertNewImageEnvQuery, (err, result) => {
    //       if (err) throw err;
    //     });
    //   } else {
    //     var updateImageEnvQuery = {...prepareStatements.updateImageEnvQuery};
    //     updateImageEnvQuery['values'] = [foldername, new Date().toDateString(), description, username]
    //     pool.query(updateImageEnvQuery, (err, result) => {
    //       if (err) throw err;
    //     });
    //   }
    // });

  deferred.resolve(true);
  return deferred.promise;
}

exports.localUploadModel = async function(username, uploaded_files, envHtmlName, folderName, envDescription, envTag) {

  var deferred = Q.defer();

  console.log("uploaded_files length = " + uploaded_files.length);
  await uploadToAWS(deferred, username, uploaded_files);

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
    deferred.resolve(true);
  })

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
  if (userNames.length == 0) {
    deferred.resolve([]);
  } else {
    var findEnvsForUserQuery = {...prepareStatements.findEnvsForUserQuery};

    findEnvsForUserQuery['values'] = [[userNames]];
  
    pool.query(findEnvsForUserQuery, (err, result) => {
      if (err) throw err;
      const envs = result.rows;
      deferred.resolve(envs);
    });
  }

  return deferred.promise;
}

// This is just for experiment purposes, don't actually use
exports.getAllEnvs = function(){
  var deferred = Q.defer();
  var findAllImageEnvs = {...prepareStatements.findAllImageEnvs};
  pool.query(findAllImageEnvs, (err, result) => {
    if (err) throw err;
    const envs = result.rows;
    deferred.resolve(envs);
  });

  return deferred.promise;
}

exports.getUsersImageEnvs = async function(){

}

exports.getNumImages = async function(username, env_name){
  var deferred = Q.defer();
  var findImagesWithUserAndEnvName = {...prepareStatements.findImagesWithUserAndEnvName};
  findImagesWithUserAndEnvName['values'] = [username, env_name];
  pool.query(findImagesWithUserAndEnvName, (err, result) => {
    if (result.rows.length == 0) {
        deferred.resolve(0);
    } else {
        deferred.resolve(result.rows[0].numimages/2);
    }
  });
  return deferred.promise;
}

exports.getLabels = async function(username, env_name){
  var deferred = Q.defer();
  var findImagesWithUserAndEnvName = {...prepareStatements.findImagesWithUserAndEnvName};
  findImagesWithUserAndEnvName['values'] = [username, env_name];
  pool.query(findImagesWithUserAndEnvName, (err, result) => {
    if (result.rows.length == 0) {
        deferred.resolve(0);
    } else {
        deferred.resolve(result.rows[0].labels);
    }
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

  fetchVRFiles(environmentList).then(() => {
    deferred.resolve(true);
  });

  return deferred.promise;

}

async function fetchVRFiles(environmentList) {
  let result = [];
  for (let env of environmentList) {
    const prefix = env.username + "/" + env.envname + "/";
    result.push(recursiveGetVREnvsFromS3(prefix));
  }

  console.log("Finishes Fetch VR files");
  return await Promise.all(result);
}

async function getS3Object(files, getFileParam){
  return new Promise((resolve,reject) => {
    const getFileParam = {
      Bucket: bucketName,
      Key: files.Key
    }

    s3.getObject(getFileParam, function(err, data) {
      if (err) {
        console.log(err);
        throw err;
      } else if (data) {
        const file = fs.createWriteStream(`./${VREnvironmentsDir}/${files.Key}`);
        file.write(data.Body, () => {
          file.end();
          resolve(1);
        });
      }
    });
  });
}

async function process(contents, prefixes) {
  let result = [];
  for (const files of contents) {
    const getFileParam = {
      Bucket: bucketName,
      Key: files.Key
    }

    // get the file content and write to temporary folder in the disk
    result.push(getS3Object(files, getFileParam));
    console.log(1);
  }

  await Promise.all(result);

  console.log("Finish process content");
  await loadMultiple(prefixes);

  console.log("Load mUltiple also finishes, exit process");
}

async function readS3Directory(folderPrefix) {
  const params = {
    Bucket: bucketName,
    Delimiter: '/',
    Prefix: folderPrefix
  }

  // make temporary directory
  fs.mkdir(`./${VREnvironmentsDir}/${folderPrefix}`, {recursive: true}, (err) => {
    if (err) throw err;
  });

  return new Promise((resolve,reject) => {

    s3.listObjectsV2(params, async function(err, data) {
      if(err){
        console.log(err);
        throw err;
      }
  
      process(data.Contents, data.CommonPrefixes).then(
        res => {
          console.log(res);
          resolve(1);
        }
      );

    });
  });
}

async function loadMultiple(folders) {
  const result = []
  for (let folder of folders) {
    result.push(recursiveGetVREnvsFromS3(folder.Prefix));
  }
  return await Promise.all(result);
}


/**
 * This method will recursively load folders from S3
 * 
 * @param folderPrefix directory path in S3 bucket
 */
const recursiveGetVREnvsFromS3 = async (folderPrefix) => {
  return new Promise(async(resolve,reject) => {
    await readS3Directory(folderPrefix).then(res => {
      resolve(1);
    });
  });
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


// ------ Mailbox ------

exports.localSetMessage = function(code, username, house_name){
 var deferred = Q.defer();

  var findMailboxQuery = {...prepareStatements.findMailboxQuery};
  findMailboxQuery['values'] = [code];
  pool.query(findMailboxQuery, (err, result) => {
    if (!result || result.rows.length == 0) {
      // insert here. Modify below.
      var insertMailboxMessageQuery = {...prepareStatements.insertMailboxMessageQuery};
      insertMailboxMessageQuery['values'] = [code, username, house_name, null, null];
      pool.query(insertMailboxMessageQuery, (err, result) => {
        if (err) throw err;
      });
    } else {
      // update here. Modify below
      var updateMailboxMessageQuery = {...prepareStatements.updateMailboxMessageQuery};
      updateMailboxMessageQuery['values'] = [code, username, house_name, null, null];
      pool.query(updateMailboxMessageQuery, (err, result) => {
        if (err) throw err;
      });
    }
  });

  deferred.resolve(true);
  return deferred.promise;
}

exports.localGetMessageHouseName = function(code){
  var deferred = Q.defer();
  var findMailboxQuery = {...prepareStatements.findMailboxQuery};
  findMailboxQuery['values'] = [code];
  pool.query(findMailboxQuery, (err, result) => {
    if (!result || result.rows.length == 0) {
        deferred.resolve(0);
    } else {
        deferred.resolve(result.rows[0].house_name);
    }
  });
  return deferred.promise;
}

exports.localGetMessageUsername = function(code){
  var deferred = Q.defer();
  var findMailboxQuery = {...prepareStatements.findMailboxQuery};
  findMailboxQuery['values'] = [code];
  pool.query(findMailboxQuery, (err, result) => {
    if (!result || result.rows.length == 0) {
        deferred.resolve(0);
    } else {
        deferred.resolve(result.rows[0].username);
    }
  });
  return deferred.promise;
}

exports.localDeleteMessage = function(code){
  var deferred = Q.defer();
  var deleteMessageQuery = {...prepareStatements.deleteMessageQuery};
  deleteMessageQuery['values'] = [code];
  pool.query(deleteMessageQuery, (err, result) => {
    if (err) throw err;
    deferred.resolve(true);
  })
}

// ---- End Mailbox ----
















