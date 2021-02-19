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

module.exports.addSignature = (first, last, signature) => {
    const q = `INSERT INTO signatures (first, last, signature)
            values($1, $2, $3)
            RETURNING id
            
    `;
    const params = [first, last, signature];

    return db.query(q, params);
};

module.exports.getCount = () => {
    const q = `SELECT COUNT(*) FROM signatures`;
    return db.query(q);
};

module.exports.getSigners = () => {
    const q = `SELECT first, last  FROM signatures`;
    return db.query(q);
};

//const params = [first, last, signature];

//  the $1,$2...are replacing this --- values (${city}, ${country}, ${population})
