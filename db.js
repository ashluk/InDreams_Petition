const spicedPg = require("spiced-pg");
//const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");
const db = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/petition"
);

module.exports.getSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};

//USERS TABLE
module.exports.addUserInput = (user_first, user_last, email, password_hash) => {
    const q = `INSERT INTO users (user_first, user_last, email, password_hash)
            values($1, $2, $3, $4)
            RETURNING id
            
    `;
    const params = [user_first, user_last, email, password_hash];

    return db.query(q, params);
};

module.exports.getSigners = () => {
    const q = `SELECT users.user_first, users.user_last, user_profiles.age, user_profiles.city, user_profiles.url
   FROM users
   LEFT JOIN user_profiles ON  users.id = user_profiles.user_id`;
    // we are joining on users.id x user_profiles.user_id because user ID is what holds them together
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

module.exports.getUsers = () => {
    const q = `SELECT user_profiles.age, user_profiles.city, user_profiles.url, users.user_first, users.user_last, users.email
     FROM users
     INNER JOIN signatures ON users.id = signatures.user_id
     LEFT JOIN user_profiles ON users.id = user_profiles.user_id`;
    return db.query(q);
};
//we are joining signtures.user_id because it holds the reference point to the id in user_id
//first, last required - joinin users and signatures only those that have signed
//selecting from users, joining signatures where users id is equal to user_id
//secomd join left join

module.exports.signersByCity = (city) => {
    const q = `SELECT user_profiles.age, user_profiles.city, user_profiles.url, users.user_first, users.user_last, users.email
    FROM users
    INNER JOIN signatures ON users.id = signatures.user_id
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE LOWER(city) = LOWER($1)`;
    const params = [city];
    return db.query(q, params);
};

//EDITS

//GET from user profiles to pre populate /EDIT
module.exports.getUserProfile = () => {
    const q = `SELECT users.user_first, users.user_last, user_profiles.age, user_profiles.city, user_profiles.url
   FROM users
   LEFT JOIN user_profiles ON  users.id = user_profiles.user_id`;
    //WHERE (id) = $1
    //const params = [id];
    return db.query(q);
};

module.exports.editUserPass = (id) => {
    const q = `SELECT user_profiles.age, user_profiles.city, user_profiles.url, users.user_first, users.user_last, users.email
    FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE (id) = $1`;
    const params = [id];
    return db.query(q, params);
};
module.exports.editUserNoPass = (id) => {
    const q = `SELECT user_profiles.age, user_profiles.city, user_profiles.url, users.user_first, users.user_last, users.email
    FROM users
    LEFT JOIN user_profiles ON users.id = user_profiles.user_id
    WHERE (id) = $1`;
    const params = [id];
    return db.query(q, params);
};
