const express = require("express");
const bodyParser = require("body-parser");
//Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
const session = require('express-session');

const app = express();

app.use(session({
  secret: 'sunbaenimhost',
  resave: false,
  saveUninitialized: true,
  //test를 위해 쿠키 maxAge는 1시간으로 디폴트 설정
  cookie: {maxAge : 3600 * 1000} //1 hour
}))

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
