const status = require("../middlewares/error.handling/http.status.codes");
//Loggers
const logger = require("../config/winston");

//로그인 되어있는 유저인지 확인하는 미들웨어
const if_not_logged_in = (req, res, next) => {
  if (!req.session.user_id) {
    logger.info(
      `file: logincheck.middleware.js, location: if_not_logged_in, msg: User is not logged in`
    );
    return res.status(status.BAD_REQUEST).send({
      message: "user is not logged in"
    });
  }
  next();
};

//이미 로그인 되어있는 유저인지 확인하는 미들웨어
const if_logged_in = (req, res, next) => {
  if (req.session.user_id) {
    logger.info(
      `file: logincheck.middleware.js, location: if_logged_in, msg: User is already logged in`
    );
    //서버에서는 페이지를 연결해주는 역할을 하지 않음.
    //400번대 코드로 보내주는 것으로 변경
    return res.status(status.BAD_REQUEST).send({
      message: "user already logged in"
    });
  }
  next();
};

module.exports = {
  if_logged_in,
  if_not_logged_in,
};
