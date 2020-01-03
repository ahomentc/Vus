DROP DATABASE IF EXISTS vusdb;
CREATE DATABASE vusdb;

-- connects to vusdb
\c 'vusdb';

REVOKE ALL PRIVILEGES ON ALL TABLES IN SCHEMA public FROM vusmanager;
REVOKE ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public FROM vusmanager;

DROP OWNED BY vusmanager;
DROP USER IF EXISTS vusmanager;
CREATE USER vusmanager WITH PASSWORD 'vusisawesome123';

-- 1. basic tables for Vus

CREATE TABLE VUSUSER (
    ID SERIAL PRIMARY KEY NOT NULL,
    USERNAME TEXT NOT NULL,
    PASSWORD TEXT NOT NULL,
    AVATAR TEXT
    -- ROOM VARCHAR(10)
);

-- For now, we just upload the images for the user. We'll do the image splitting in the server.
-- For now, we'll upload the pics ourselves anyways but later must fix all this.
CREATE TABLE VUSENV (
    ID SERIAL PRIMARY KEY NOT NULL,
    ENVNAME TEXT NOT NULL,
    UPLOADTIME DATE NOT NULL,
    DESCRIPTION TEXT NOT NULL,
    USERNAME TEXT NOT NULL,
    NUMIMAGES VARCHAR(10),
    COORDINATES TEXT
);


-- New ------------------

CREATE TABLE HEADSETMAILBOX (
    ID SERIAL PRIMARY KEY NOT NULL,
    CODE TEXT NOT NULL,
    USERNAME TEXT NOT NULL,
    HOUSE_NAME TEXT NOT NULL,
    MESSAGE_SLOT_ONE TEXT,
    MESSAGE_SLOT_TWO TEXT
);

-- CREATE TABLE HOUSESLIST(
--     ID SERIAL PRIMARY KEY NOT NULL,
--     NAME TEXT NOT NULL,
--     -- NOT SURE IF THIS IS SYNTAX FOR FOREIGNKEY
--     USER INTEGER REFERENCES VUSUSER(id),
--     HOUSE INTEGER REFERENCES VUSENV(id)
--     -- ^^^^^ prob not correct syntax above
-- );

-- End New --------------

-- ID
-- USERNAME
-- HOUSE_NAME
-- UPLOADTIME DATE NOT NULL,
--     DESCRIPTION TEXT NOT NULL,
-- 
-- 1. We'll look up by username and house name

-- CREATE TABLE VUSENVIRONMENT (
--     ID SERIAL PRIMARY KEY NOT NULL,
--     ENVNAME TEXT NOT NULL,
--     HTMLNAME TEXT NOT NULL,
--     UPLOADTIME DATE NOT NULL,
--     DESCRIPTION TEXT NOT NULL,
--     USERNAME TEXT NOT NULL,
--     TAG TEXT NOT NULL
-- );


-- CREATE TABLE VUSGROUP (
--     GROUPID VARCHAR(10) PRIMARY KEY NOT NULL,
--     USERCOUNT INT NOT NULL
-- );


-- 2. look up tables for user-environment and group-environment

-- stores all environments (owned by which user) that a group is in currently
-- CREATE TABLE GROUPUSER (
--     ID SERIAL PRIMARY KEY NOT NULL,    
--     GROUPID VARCHAR(10) NOT NULL,
--     USERNAME TEXT NOT NULL
-- );


-- grant privilage to Vus manager

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vusmanager;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to vusmanager;
