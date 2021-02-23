const spicedPg = require("spiced-pg");
//const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

//we are going to want to export our functions
module.exports.getSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

//USERS TABLE
//this will eventually change to USERS add the registration info(first, last, email, password)
module.exports.addUserInput = (user_first, user_last, email, password_hash) => {
    const q = `INSERT INTO users (user_first, user_last, email, password_hash)
            values($1, $2, $3, $4)
            RETURNING id
            
    `;
    const params = [user_first, user_last, email, password_hash];

    return db.query(q, params);
};

//this will also move to the USERS
module.exports.getSigners = () => {
    const q = `SELECT user_first, user_last  FROM users`;
    //changed the above line to users from signatures
    return db.query(q);
};

//SIGNATURE TABLE

//this is selecting which number you are on the signatures table
module.exports.getCount = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};
//this captures the signature and userId
module.exports.addSignature = (signature, user_id) => {
    const q = `INSERT INTO signatures (signature, user_id)
            values($1, $2)
            RETURNING id
            
    `;
    const params = [signature, user_id];
    return db.query(q, params);
};
//this gives us the dataURL which in turn we use to make the signature image
module.exports.signatureId = (sigId) => {
    const q = `SELECT * FROM signatures WHERE id = $1`;
    return db.query(q, [sigId]);
};
//this will select the email and password to compare
//alter select in login to find user info by email in log
module.exports.passwordCompare = (email) => {
    const q = `SELECT password_hash, id FROM users WHERE email = $1 `;
    const params = [email];
    return db.query(q, params);
};
//USER_PROFILES

//this will INSERT new user info from the profile page into the user_profiles
module.exports.addUser = (age, city, url, user_id) => {
    const q = `INSERT INTO user_profiles (age,city,url,user_id) 
                values($1,$2,$3,$4)
                RETURNING user_id`;
    const params = [age, city, url, user_id];
    return db.query(q, params);
};

//these tables will need to be JOINED with the users info tables.
module.exports.getUsers = () => {
    const q = `SELECT user_profile.age, user_profile.city, user_profile.url, users.user_first, users.user_last, users.email
     FROM user_profiles
     INNER JOIN users ON users.user_first = user_profiles.user_first
     INNER JOIN users ON users.user_last = user_profiles.user_last
     INNER JOIN users ON users.email = user_profiles.email`;
    return db.query(q);
};

module.exports.signersByCity = (city) => {
    /*const q = `SELECT age, city, url, user FROM user_profiles
                WHERE LOWER(city) = LOWER($1)`;*/

    const q = `SELECT user_profile.age, user_profile.city, user_profile.url, users.user_first, users.user_last, users.email
     FROM user_profiles
     INNER JOIN users ON users.user_first = user_profiles.user_first
     INNER JOIN users ON users.user_last = user_profiles.user_last
     INNER JOIN users ON users.email = user_profiles.email
     WHERE LOWER(city) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};
