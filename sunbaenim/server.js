const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const users = require("./api/users/index");
const articles = require("./api/articles/index");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", users);
app.use("/articles", articles);

app.listen(8080, function () {
  console.log("listening on 8080");
});

module.exports = app;
