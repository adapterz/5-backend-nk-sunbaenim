const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
require("dotenv").config();
const session = require("express-session");
//조회수 파악 목적을 위해 cookie-parser 모듈 설치 - 왜 세션이 아닌 쿠키로 조회수 처리를? session에 조회수 정보를 처리하기엔 서버가 부담이 되므로
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const csp = require("helmet-csp");
const logger = require("./config/winston");
const morgan = require("morgan");
const morgan_json = require("morgan-json");
const format = morgan_json(
  ":method :url :status :res[content-length] :response-time"
);
const cors = require("cors");
//const whitelist = ["http://localhost:3000"];
const corsOptions = {
  /* origin: (origin, callback) => {
    if(whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error("not allowed"))
    }
  },*/
  origin: ["http://localhost:3000"],
  //다른 도메인 간 쿠키 주고받을 수 있게 서버에서 설정
  credentials: true,
};
app.use(cors(corsOptions));

//Routers
const users = require("./routers/user.router");
const articles = require("./routers/article.router");
const bookmarks = require("./routers/bookmark.router");
const comments = require("./routers/comment.router");
const notifications = require("./routers/notification.router");
const files = require("./routers/file.router");

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use(
  session({
    secret: process.env.secret,
    //false로 보통 많이 해둔다. 매번 변경사항이 없는 세션을 다시 저장해야하는 것에 대한 부담을 줄이고, 동시에 두 가지 일을 처리할 때 세션끼리 충돌하는 것을 방지하기 위함이다.
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
    }
  })
);

app.use(morgan(format, { stream: logger.stream }));
app.use(helmet());
//Content Security Policy middleware
app.use(
  csp({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      // styleSrc: ["'self"],
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
app.use("/files", files);

//app.set("port", process.env.PORT || 8080)
/*app.listen(app.get("port"), () => {
  console.log(`Express server listening on port ${app.get('port')}`);
})*/

//Production mode와 development mode를 구별하여 서버 생성
if(process.env.NODE_ENV === "production") {
  const KEY_URL = process.env.KEY_URL;
  const options = {
    key: fs.readFileSync(`${KEY_URL}/privkey.pem`),
    cert: fs.readFileSync(`${KEY_URL}/cert.pem`),
    ca: fs.readFileSync(`${KEY_URL}/chain.pem`),
  };
    https.createServer(options, app).listen(443, () => {
    console.log(`Listening at port 443`);
    });
  } else {
    http.createServer(app).listen(8080, () => {
    /*let reqOrigin = req.headers.origin;
    if(whitelist.indexOf(reqOrigin) > -1) {
        headers['access-control-allow-origin'] = reqOrigin;
    }*/
    console.log(`Listening at port 8080`);
  });
}
