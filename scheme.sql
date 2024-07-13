CREATE DATABASE r1bb1t;

CREATE TABLE users (
    id int PRIMARY KEY NOT NULL AUTO_INCREMENT,
    name varchar(50),
    handle varchar(50),
    email varchar(50) NOT NULL UNIQUE,
    password varchar(50) NOT NULL,
    description varchar(255),
    photo varchar(255)
);