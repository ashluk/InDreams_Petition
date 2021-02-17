const express = require("express");
const app = express();
const db = require("./db");

console.log("db", db);

app.use(express.static("public"));

app.get("/petition", (req, res) => {
    res.render("/petition", {});
});

app.listen(8080, () => console.log("Petition up and running...."));

/*db.addCity("York", "UK", 500000)
    .then(({ rows }) => {
        console.log("rows", rows);
    })
    .catch((err) => console.log(err));*/

/*db.getAllCities()
    //.then((result) => { -- the next line is destructuring out just rows from results
.then (({rows})) => {
        console.log("result", result);
    })
    .catch((err) => console.log(err));*/
