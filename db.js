const spicedPg = require("spiced-pg");

//for the demo we will talk to the cities database
//we will want a new database for the petition
//we do this by --- createdb nameofdatabase
const db = spicedPg("postgres:postgres:postgres@localhost:5432/petition");

//we are going to want to export our functions
module.exports.getSignatures = () => {
    const q = `SELECT * FROM signatures`;
    return db.query(q);
};
//USERS TABLE
//this will eventually change to USERS add the registration info(first, last, email, password)
module.exports.addSignature = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
            values($1, $2, $3)
            RETURNING id
            
    `;
    const params = [first, last, signature];

    return db.query(q, params);
};
//this will also move to the USERS
module.exports.getSigners = () => {
    const q = `SELECT first, last  FROM signatures`;
    return db.query(q);
};

//SIGNATURE TABLE
//this is selecting which number you are on the signatures table
module.exports.getCount = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};
//this gives us the dataURL which in turn we use to make the signature image
module.exports.signatureId = (sigId) => {
    const q = `SELECT signature FROM signatures WHERE id = $1`;

    //const q = `SELECT * FROM signatures WHERE id = $1`;
    return db.query(q, [sigId]);
};

//  the $1,$2...are replacing this --- values (${city}, ${country}, ${population})
