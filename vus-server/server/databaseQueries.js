// This file stores all the PSQL prepare statements. 



const findImagesWithUserAndEnvName = {
    name: 'find-image-env-with-names',
    text: 'select * from vusenv where username = $1 and envname = $2;'
}

const insertNewImageEnvQuery = {
    name: 'insert-image-env',
    text: 'insert into vusenv (envname, uploadtime, description, username, numimages) values($1, $2, $3, $4, $5);',
}

const updateImageEnvQuery = {
    name: 'update-image-env',
    text: 'update vusenv set uploadtime = $2, description = $3 where envname = $1 and username = $4;',
}




const findUserQuery = {
    name: 'find-user',
    text: 'select * from vususer where username = $1'
}

const registerUserQuery = {
    name: 'register-user',
    text: 'insert into vususer (username, password) values($1, $2)',
}

const findGroupQuery = {
    name: 'find-group',
    text: 'select * from vusgroup where groupid = $1'
}

const findEnvsForUserQuery = {
    name: 'find-user-env',
    text: 'select * from vusenvironment where username = ANY($1::text[]);'
}


const findEnvWithUserAndEnvName = {
    name: 'find-env-with-names',
    text: 'select * from vusenvironment where username = $1 and envname = $2;'
}

const insertNewEnvQuery = {
    name: 'insert-env',
    text: 'insert into vusenvironment (envname, htmlname, uploadtime, description, username, tag) values($1, $2, $3, $4, $5, $6);',
}

const updateEnvQuery = {
    name: 'update-env',
    text: 'update vusenvironment set htmlname = $2, uploadtime = $3, description = $4, tag = $6 where envname = $1 and username = $5;',
}

const deleteEnvQuery = {
    name: 'delete-env',
    text: 'delete from vusenvironment where username = $1 and envname = $2;'
}

const getEnvForUserQuery = {
    name: 'find-env',
    text: 'select * from vusenvironment where username = $1;'
}

const insertGroupQuery = {
    name: 'insert-group',
    text: 'insert into vusgroup (groupid, usercount) values ($1, $2)'
}

const updateGroupQuery = {
    name: 'update-group',
    text: 'update vusgroup set usercount = $1 where groupid = $2;',
}

const deleteGroupQuery = {
    name: 'delete-group',
    text: 'delete from vusgroup where groupid = $1;',
}

const findGroupUserQuery = {
    name: 'find-group-user',
    text: 'select * from groupuser where groupid = $1;'
}

const deleteGroupUserQuery = {
    name: 'delete-group-user',
    text: 'delete from groupuser where groupid = $1;',
}

const insertGroupUserQuery = {
    name: 'insert-group-user',
    text: 'insert into groupuser (groupid, username)  SELECT * FROM UNNEST ($1::text[], $2::text[]);'
}

const updateUserRoomQuery = {
    name: 'update-user-room',
    text: 'update vususer set room = $1 where username = $2;'
}


// exports
module.exports = {
    findUserQuery: findUserQuery,
    registerUserQuery: registerUserQuery,
    findGroupQuery: findGroupQuery,
    findEnvsForUserQuery: findEnvsForUserQuery,
    findEnvWithUserAndEnvName: findEnvWithUserAndEnvName,
    insertNewEnvQuery: insertNewEnvQuery,
    updateEnvQuery: updateEnvQuery,
    deleteEnvQuery: deleteEnvQuery,
    getEnvForUserQuery: getEnvForUserQuery,
    insertGroupQuery: insertGroupQuery,
    updateGroupQuery: updateGroupQuery,
    deleteGroupUserQuery: deleteGroupUserQuery,
    insertGroupUserQuery: insertGroupUserQuery,
    deleteGroupQuery: deleteGroupQuery,
    updateUserRoomQuery: updateUserRoomQuery,
    findGroupUserQuery: findGroupUserQuery,
    findImagesWithUserAndEnvName: findImagesWithUserAndEnvName,
    insertNewImageEnvQuery: insertNewImageEnvQuery,
    updateImageEnvQuery: updateImageEnvQuery
}