const express = require("express");
const app = express();
const db = require("./db");
const hb = require("express-handlebars");
const { hash, compare } = require("./utils/bc.js");
const cookieSession = require("cookie-session");
/*const {
    LoggedInUser,
    requireNoSignature,
    requireSignature,
} = require("./middlewear");
exports.app = app;*/
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
    console.log("req session", req.session);
    db.addSignature(signature, req.session.userid)
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
    const { user_first, user_last, email, password_hash } = req.body;
    // console.log("requested body", req.body);
    hash(password_hash)
        .then((hashedPassword) => {
            db.addUserInput(user_first, user_last, email, hashedPassword)
                .then(({ rows }) => {
                    console.log("rows: ", rows);
                    req.session.userid = rows[0].id;

                    res.redirect("/petition");
                })
                .catch((err) => {
                    console.log("register error", err);
                    res.render("register", {
                        err: true,
                    });
                });
        })
        .catch((err) => {
            console.log("error in hash", err);
            res.render("register", {
                err: true,
            });
        });
});
////LOGIN ROUTE
//need help with the post route on here -- not sure about my if statements and there is an error 'invalid input syntax for type integer' on the email
app.get("/login", (req, res) => {
    res.render("login", {});
});
app.post("/login", (req, res) => {
    //const { email, password } = req.body;

    const password = req.body.password_hash;
    const email = req.body.email;
    console.log("email, password", req.body);
    if (!req.session.userid) {
        console.log("!req.session.userid", req.session.userid);
        res.render("login", {
            err: "ERROR! -- you have no user id",
        });
    } else if (email == "") {
        console.log("!email");

        res.render("login", {
            err: "ERROR! -- provide email",
        });
    } else if (password == "") {
        console.log("!password");
        res.render("login", {
            err: "ERROR! -- provide password",
        });
    }
    db.passwordCompare(email)
        .then(({ rows }) => {
            console.log("rows id", rows);
            console.log("password, rows", password, rows[0].password_hash);

            compare(password, rows[0].password_hash)
                .then((match) => {
                    if (match === true) {
                        req.session.userid = rows[0].id;
                        res.redirect("/petition");
                        console.log("matched id");
                    } else {
                        res.render("login", {
                            err: "password incorrect",
                        });
                    }
                })
                .catch((err) => {
                    console.log("error in compare", err);
                    res.render("login", {
                        err: "passwords do not match",
                    });
                });
        })
        .catch((err) => {
            console.log("error in login", err);
            res.render("login", {
                err: "error in passwordCompare catch",
            });
        });
});

///PROFILE PAGE
app.get("/profile", (req, res) => {
    res.render("profile", {});
});

//check that the url the user provided starts with either https:// or http://, if not, add that to whatever they provided!

app.post("/profile", (req, res) => {
    const { age, city, url, user_id } = req.body;
    console.log("age,city,url, user_id", req.body);
    db.addUser(age, city, url, req.session.userid)
        .then(({ rows }) => {
            console.log("adduser", rows);
            req.session.userid = rows[0].id;
            res.redirect("/signers");
        })
        .catch((err) => {
            console.log("error in profile", err);
            res.render("profile", {
                err: true,
            });
        });
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
app.get("/signers/:city", (req, res) => {
    console.log("signers/city", req.params);
    db.signersByCity(req.params)
        .then(({ rows }) => {
            var fullNames = rows;
            res.render("signersbycity", {
                fullNames,
            });
        })
        .catch((err) => console.log("erron in signersbyCity", err));
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

app.get("/", (req, res) => {
    res.redirect("/register");
});

//this if statement makes sure that our server does not fully run when we run our tests
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petition up and running....")
    );
}
