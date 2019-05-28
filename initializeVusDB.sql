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
    AVATAR TEXT NOT NULL,
    ROOM VARCHAR(10)
);

CREATE TABLE VUSENVIRONMENT (
    ID SERIAL PRIMARY KEY NOT NULL,
    ENVNAME TEXT NOT NULL,
    HTMLNAME TEXT NOT NULL,
    UPLOADTIME DATE NOT NULL,
    DESCRIPTION TEXT NOT NULL,
    USERNAME TEXT NOT NULL,
    TAG TEXT NOT NULL
);

CREATE TABLE VUSGROUP (
    GROUPID VARCHAR(10) PRIMARY KEY NOT NULL,
    USERCOUNT INT NOT NULL
);


-- 2. look up tables for user-environment and group-environment

-- stores all environments (owned by which user) that a group is in currently
CREATE TABLE GROUPUSER (
    ID SERIAL PRIMARY KEY NOT NULL,    
    GROUPID VARCHAR(10) NOT NULL,
    USERNAME TEXT NOT NULL
);


-- grant privilage to Vus manager

GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO vusmanager;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public to vusmanager;
