const express = require("express");
const bodyParser = require("body-parser");

const app = express();

const users = require("./api/users/index");
const articles = require("./api/articles/index");
const bookmarks = require("./api/bookmarks/index");
const comments = require("./api/comments/index");
const notifications = require("./api/notifications/index");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/users", users);
app.use("/articles", articles);
app.use("/bookmarks", bookmarks);
app.use("/comments", comments);
app.use("/notifications", notifications);


app.listen(8080, function () {
  console.log("listening on 8080");
});

module.exports = app;
