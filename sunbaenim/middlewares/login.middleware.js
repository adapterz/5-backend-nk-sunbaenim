const { body, validationResult } = require("express-validator");
const logger = require("../config/winston");
const status = require("../middlewares/error.handling/http.status.codes");

module.exports = [
  body("email")
  //유저가 로그인 하기 위해 입력한 email 주소의 유효성 검사
    .notEmpty()
    .withMessage("Please fill out email")
    .isEmail()
    .withMessage("Input as an email format")
    .trim()
    .escape()
    .bail(),

  //유저가 로그인 하기 위해 입력한 비밀번호의 유효성 검사
  body("pwd")
    .notEmpty()
    .withMessage("Please fill out pwd")
    .isLength({ min: 5 })
    .withMessage("Input password more than 5 words")
    .trim(),


  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) {
      logger.info(`file: login.middleware.js, location: errors.isEmpty(), msg: Login validation success`);
      return next();
    }

    if(!errors.isEmpty() && errors.errors[0].param === 'email') {
      logger.error(`file: login.middleware.js, location: body(email), error: ${errors.array()[0].msg}`);
      return res.status(status.BAD_REQUEST).send({message: errors.array()[0].msg});
    }
    if(!errors.isEmpty() && errors.errors[0].param === 'pwd'){
      logger.error(`file: login.middleware.js, location: body(pwd), error: ${errors.array()[0].msg}`);
      return res.status(status.BAD_REQUEST).send({message: errors.array()[0].msg});
    }
  }
];