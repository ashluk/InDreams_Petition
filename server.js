const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
//const { hash } = require("bc.js");
const cookieSession = require("cookie-session");

app.engine("handlebars", hb());
app.set("view engine", "handlebars");

app.use(
    cookieSession({
        secret: `I'm always hungry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
    })
);

console.log("db", db);
//app.use(express.static(__dirname + "/static"));

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

//app.use(express.static(__dirname + "./public"));

app.get("/petition", (req, res) => {
    if (req.session.signed) {
        res.redirect("/thanks");
    } else {
        res.render("petition", {});
    }
    /* if (user_first === !undefined && user_last === !undefined) {
        res.redirect("/thanks");
    }*/
});

app.post("/petition", (req, res) => {
    const { user_first, user_last, signature } = req.body;
    console.log("requested body", req.body);
    db.addSignature(user_first, user_last, signature)
        .then(({ rows }) => {
            console.log("rows: ", rows);
            req.session.signed = true;
            res.redirect("thanks");
        })
        .catch((err) => console.log("petition error", err));
});

app.get("/signers", (req, res) => {
    res.render("signers", {});
});

/*app.get("/thanks", (req, res) => {
    // const { user_first, user_last, signature } = req.body;

    if (req.session.signed) {
        db.getCount().then(({ rows }) => {
        res.render("thanks", {
            
            layout: main, rows
             }
        });
    }
});*/

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        db.getCount()
            .then(({ rows }) => {
                console.log("rows: ", rows);
                res.render("thanks", {
                    id: rows,
                });
            })
            .catch((err) => console.log("error in thanks page", err));
    } else {
        res.redirect("/petition");
    }
});
app.get("/register", (req, res) => {
    res.render("register", {});
});
app.get("/login", (req, res) => {
    res.render("login", {});
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
