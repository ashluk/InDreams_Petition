const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const { hash, compare } = require("./utils/bc.js");
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

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);

//PETITION ROUTE
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
    const { signature } = req.body;
    console.log("requested body", req.body);
    db.addSignature(signature, req.session.userId)
        .then(({ rows }) => {
            console.log("rows: ", rows);
            req.session.signed = rows[0].id;

            res.redirect("/thanks");
        })
        .catch((err) => {
            console.log("petition error", err);
            res.render("petition", {
                err: true,
            });
        });
});
//REGISTER ROUTE

app.get("/register", (req, res) => {
    res.render("register", {});
});

app.post("/register", (req, res) => {
    const { user_first, user_last, email, password } = req.body;
    console.log("requested body", req.body);
    // Hash password
    hash(password)
        .then((hashedPassword) => {
            db.addUserInput(user_first, user_last, email, hashedPassword)
                .then(({ rows }) => {
                    console.log("rows: ", rows);
                    req.session.userid = rows[0].id;

                    res.redirect("/thanks");
                })
                .catch((err) => console.log("register error", err));
            res.render("register", {
                err: true,
            });
        })
        .catch((err) => console.log("error in hash", err));
});

///////////////

app.get("/signers", (req, res) => {
    db.getSigners()
        .then(({ rows }) => {
            var fullNames = rows;
            console.log("fullnames", fullNames);
            res.render("signers", {
                fullNames,
            });
        })
        .catch((err) => console.log("error in signers page", err));
});

app.get("/thanks", (req, res) => {
    if (req.session.signed) {
        db.signatureId(req.session.signed)
            .then(({ rows }) => {
                console.log("rows: ", rows);
                var signatureImage = rows[0];
                //console.log("signatureImage", signatureImage);
                /*res.render("thanks", {
                    rows,
                });*/
                db.getCount().then(({ rows }) => {
                    var signerNumber = rows[0];
                    console.log("signerNumber", signerNumber);
                    res.render("thanks", {
                        signatureImage,
                        signerNumber,
                    });
                });
            })

            .catch((err) => console.log("error in thanks page", err));
    } else {
        res.redirect("/petition");
    }
});

app.get("/login", (req, res) => {
    res.render("login", {});
});

app.get("/profile", (req, res) => {
    res.render("profile", {});
});
app.listen(8080, () => console.log("Petition up and running...."));
