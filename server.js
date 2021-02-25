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
app.use((req, res, next) => {
    console.log("req.url", req.url);
    console.log("req.session", req.session);
    next();
});

console.log("db", db);

app.use(express.static("./public"));

app.use(
    express.urlencoded({
        extended: false,
    })
);
//CSRF
const csurf = require("csurf");

app.use(csurf());
app.use(function (req, res, next) {
    res.locals.csrfToken = req.csrfToken();
    next();
});
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

                    res.redirect("/profile");
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
app.get("/login", (req, res) => {
    res.render("login", {});
});
app.post("/login", (req, res) => {
    //const { email, password } = req.body;

    const password = req.body.password_hash;
    const email = req.body.email;
    console.log("email, password", req.body);
    /*if (!req.session.userid) {
        console.log("!req.session.userid", req.session.userid);
        res.render("login", {
            err: "ERROR! -- you have no user id",
            
        });
    } else*/ if (
        email == ""
    ) {
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
                        //console.log("WHAT IS IN THE ROW.ID", rows[0].id); RETURNS MY USER_ID
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
    const { age, city, user_id } = req.body;
    console.log("age,city,url, user_id", req.body);
    let url = req.body.url;
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }
    db.addUser(age, city, url, req.session.userid)
        .then(({ rows }) => {
            console.log("adduser", rows);
            //req.session.userid = rows[0].id;
            res.redirect("/petition");
        })
        .catch((err) => {
            console.log("error in profile", err);
            res.render("profile", {
                err: true,
            });
        });
});
//EDIT ROUTE
app.get("/edit", (req, res) => {
    console.log("req.session", req.session);
    if (req.session.userid) {
        console.log("reqsess", req.session.userid);

        db.getUserProfile(req.session.userid)

            .then(({ rows }) => {
                console.log("theserows", rows);
                var currentUser = rows[0];
                res.render("edit", {
                    currentUser,
                });
            })
            .catch((err) => console.log("error in editpass", err));
    } else {
        res.redirect("/register");
    }
});

////WORKING ON POST EDIT ROUTE

app.post("/edit", (req, res) => {
    const {
        user_first,
        user_last,
        email,
        password_hash,
        age,
        city,
        id,
    } = req.body;
    let url = req.body.url;
    console.log("edit info", req.body.password_hash);
    console.log("oops these match", password_hash);
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
        url = "http://" + url;
    }
    console.log("what is my", url);
    if (req.body.password_hash) {
        hash(password_hash)
            .then((hashedPassword) => {
                db.editUserPass(
                    user_first,
                    user_last,
                    email,
                    password_hash,
                    req.session.userid
                )
                    .then(() => {})
                    .catch((err) => {
                        console.log("err in userPass", err);
                    });
                db.userUpsert(age, city, url, req.session.userid)
                    .then(() => {
                        // res.render("edit");
                        res.redirect("/signers");
                    })
                    .catch((err) => {
                        console.log("err in userUpsert", err);
                    });
            })
            .catch((err) => {
                console.log("err in hashedPass", err);
            });
    } else {
        db.editUserNoPass(user_first, user_last, email, req.session.userid)
            .then(() => {})
            .catch((err) => {
                console.log("err in userNoPass", err);
            });
        db.userUpsert(age, city, url, req.session.userid)
            .then(() => {
                //res.render("edit");
                res.redirect("/signers");
            })
            .catch((err) => {
                console.log("err in userUpsert2", err);
            });
    }
    //res.render("edit");
});

//THANK YOU ROUTE

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
    console.log("signers/city", req.params.city);
    db.signersByCity(req.params.city)
        .then(({ rows }) => {
            var fullNames = rows;
            res.render("city", {
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
        res.redirect("/register");
    }
});

app.post("/thanks", (req, res) => {
    console.log("looking for signature id", req.session);
    db.sigDelete(req.session.userid)
        .then(() => {
            req.session.signed = undefined;
            res.redirect("/petition");
        })
        .catch((err) => console.log("error in delete", err));
});

app.post("/logout", (req, res) => {
    delete req.session;
    delete req.session.signed;
    //req.session.id = undefined;
    res.redirect("register");
});

app.get("/", (req, res) => {
    res.redirect("/register");
});
/*app.get("/deleteaccount", (req, res) => {
    db.userDelete(req.session.userid)
        .then(() => {})
        .catch((err) => console.log("error in userDelete"));
    db.sigDelete(req.session.userid)
        .then(() => {})
        .catch((err) => console.log("error in sigDelete"));
    db.profileDelete(req.session.userid)
        .then(() => {
            res.redirect("/register");
        })
        .catch((err) => console.log("error in profileDelete"));
});*/

//this if statement makes sure that our server does not fully run when we run our tests
if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Petition up and running....")
    );
}
