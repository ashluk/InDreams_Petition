const { TestScheduler } = require("jest");
const supertest = require("supertest");
const { app } = require("./server");
console.log("app in server0", app);

test("GET/welcome sends 200 status code as a response", () => {
    return supertest(app)
        .get("/welcome")
        .then((res) => {
            expect(res.statusCode).toBe(200);
        });
    //supertest runs a fake version of our server
});

// npm.test in server to run test
//if we want ONLY one test to run write test.only
test.only("POST/welcome happens we get redirect to / on submit", () => {
    return supertest(app)
        .post("/welcome")
        .then((res) => {
            expect(res.statusCode).toBe(302);
            expect(res.headers.location).toBe("/home");
        });
});

test.only("GET/welcome sends 200 status code as a ");
