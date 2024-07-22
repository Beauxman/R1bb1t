CREATE DATABASE r1bb1t;

CREATE TABLE users (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(50),
    handle varchar(50) UNIQUE,
    email varchar(50) NOT NULL UNIQUE,
    password varchar(255) NOT NULL,
    description varchar(255),
	birthday DATE,
    photo varchar(255),
	created DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
	poster int NOT NULL,
	content varchar(255),
	created DATETIME DEFAULT CURRENT_TIMESTAMP,
	likes int,
	comments int,
	reposts int
);