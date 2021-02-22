-- comments look like this in SQL

--this file will create a table for us. 

--first we need to delete old table if it exists
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS users;


--then we create a new table like so ...
CREATE TABLE users (
    id SERIAL PRIMARY KEY, 
 user_first VARCHAR(255) NOT NULL CHECK (user_first <> ''),
    user_last VARCHAR(255) NOT NULL CHECK (user_last <> ''),
    email VARCHAR(255) NOT NULL CHECK(email <> ''),
    password_hash VARCHAR NOT NULL CHECK (password_hash <> ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE signatures (
    id         SERIAL PRIMARY KEY,
    -- Add the foreign key user_id
    -- Foreign keys let us link tables together, in this case it let's us
    -- identify which signature belongs to which user from the users table.
    -- This link can be leverage in JOIN queries (covered in Part 4).
    user_id    INTEGER NOT NULL UNIQUE REFERENCES users (id),
    signature  TEXT    NOT NULL CHECK (signature <> ''),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


