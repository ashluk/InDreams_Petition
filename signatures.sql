-- comments look like this in SQL

--this file will create a table for us. 

--first we need to delete old table if it exists
DROP TABLE IF EXISTS signatures;
--DROP TABLE IF EXISTS users;


--then we create a new table like so ...
/*CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
 first_name VARCHAR(255) NOT NULL CHECK (first_name <> ''),
    last_name VARCHAR(255) NOT NULL CHECK (last_name <> ''),
    email VARCHAR(255) NOT NULL CHECK(email <> ''),
    password_hash VARCHAR NOT NULL CHECK (password_hash <> ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);*/

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
   --user_id INTEGER NOT NULL UNIQUE REFERENCES users(id),
first VARCHAR(255) NOT NULL CHECK (first <> ''),
    last VARCHAR(255) NOT NULL CHECK (last <> ''),
    signature TEXT NOT NULL CHECK (signature <> ''), --the check is checking if signature is == to an empty string
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

);

--INSERT INTO users(id, first_name, last_name)
--VALUES(1,ash,luk);
