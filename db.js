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
module.exports.getUserProfile = (userid) => {
    const q = `SELECT users.user_first, users.user_last, user_profiles.age, user_profiles.city, user_profiles.url, users.id, users.password_hash, users.email
   FROM users
   LEFT JOIN user_profiles ON  users.id = user_profiles.user_id
    WHERE user_id = $1`;
    const params = [userid];
    return db.query(q, params);
};

//UPDATE query -- password == four columns
//no pass === three

//does require.body.pass exist if soo call the one with password
/*module.exports.editUserPass = (
    userfirst,
    userlast,
    useremail,
    userpass,
    userid
) => {
    const q = `
    UPDATE users 
    SET 
    user_first = $1,
    user_last = $2,
    email = $3,
    password_hash = $4
    WHERE id = $5`;
    const params = [userfirst, userlast, useremail, userpass, userid];
    return db.query(q, params);
};*/

module.exports.editUserPass = (
    userfirst,
    userlast,
    useremail,
    userpass,
    userid
) => {
    const q = `UPDATE users SET user_first = $1, user_last = $2, email = $3, password_hash = $4 WHERE id = $5`;
    const params = [userfirst, userlast, useremail, userpass, userid];
    return db.query(q, params);
};

module.exports.editUserNoPass = (userfirst, userlast, useremail, userid) => {
    const q = `
    UPDATE users
    SET user_first = $1, user_last = $2, email = $3 WHERE id = $4`;
    const params = [userfirst, userlast, useremail, userid];
    return db.query(q, params);
};

module.exports.userUpsert = (userage, usercity, userurl, userid) => {
    const q = `INSERT INTO user_profiles (age, city, url, user_id)
    VALUES  ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age = $1, city = $2, url = $3`;
    const params = [userage, usercity, userurl, userid];
    return db.query(q, params);
};
///DELETE ROUTES
module.exports.sigDelete = (userid) => {
    const q = `
    DELETE FROM signatures WHERE user_id = $1`;
    const params = [userid];
    return db.query(q, params);
};
module.exports.profileDelete = (userid) => {
    const q = `DELETE FROM user_profiles WHERE user_id = $1`;
    const params = [userid];
    return db.query(q, params);
};
module.exports.userDelete = (userid) => {
    const q = `DELETE FROM users WHERE id = $1`;
    const params = [userid];
    return db.query(q, params);
};
