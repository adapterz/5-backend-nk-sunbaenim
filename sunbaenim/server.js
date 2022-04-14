const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Routers
const users = require("./routers/user.router");
const articles = require("./routers/article.router");
const bookmarks = require("./routers/bookmark.router");
const comments = require("./routers/comment.router");
const notifications = require("./routers/notification.router");


app.use("/users", users);
app.use("/articles", articles);
app.use("/bookmarks", bookmarks);
app.use("/comments", comments);
app.use("/notifications", notifications);


app.listen(8080, function () {
  console.log("listening on 8080");
});

module.exports = app;
