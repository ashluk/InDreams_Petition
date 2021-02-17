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

/*module.exports.addCity = (city, country, population) => {
    const q = `INSERT INTO mydatabase (city, country, population)
            values($1, $2, $3)
            RETURNING id
    `;
    return db.query(q, params);
};
const params = [city, country, population];*/

//  the $1,$2...are replacing this --- values (${city}, ${country}, ${population})
