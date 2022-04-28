const express = require("express");
const bodyParser = require("body-parser");
//Since version 1.5.0, the cookie-parser middleware no longer needs to be used for this module to work.
const session = require('express-session');
//조회수 파악 목적을 위해 cookie-parser 모듈 설치 - 왜 세션이 아닌 쿠키로 조회수 처리를? session에 조회수 정보를 처리하기엔 서버가 부담이 되므로
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csp = require('helmet-csp');
const app = express();

//Routers
const users = require("./routers/user.router");
const articles = require("./routers/article.router");
const bookmarks = require("./routers/bookmark.router");
const comments = require("./routers/comment.router");
const notifications = require("./routers/notification.router");

app.use(cookieParser());
app.use(session({
  secret: 'sunbaenimhost',
  resave: false,
  saveUninitialized: true,
  //쿠키에 들어가는 세션 ID 값의 옵션
  cookie: {
    //FIXME: 어차피 브라우저를 끄고 다시 접속했을 때, 아직 쿠키 만료 기간이 남았음에도 새로운 쿠키를 생성하기 때문에, maxAge 딱히 의미 없을 것으로 생각..
    //FIXME: 세션 저장 store를 따로 만들어야 할까? 메모리에 저장하는 것은 너무 큰 부담
    maxAge : 3600 * 1000
  }
}))

app.use(helmet());
//Content Security Policy middleware
app.use(
  csp({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self"],
      scriptSrc: ["'self'"],
    },
    reportOnly: false,
  })
);

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
