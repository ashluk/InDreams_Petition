-- comments look like this in SQL

--this file will create a table for us. 

--first we need to delete old table if it exists
DROP TABLE IF EXISTS signatures;

--then we create a new table like so ...

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    first VARCHAR(255) NOT NULL,
    last VARCHAR(255) NOT NULL,
    signature TEXT NOT NULL CHECK (signature != '') --the check is checking if signature is == to an empty string
);


);