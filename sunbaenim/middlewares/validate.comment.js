const { body, validationResult } = require("express-validator");
const logger = require("../config/winston");
const status = require("../middlewares/error.handling/http.status.codes");

module.exports = [
  //댓글 본문의 유효성 검사
  body("content")
    .notEmpty()
    .withMessage("Please fill out content")
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) {
      logger.info(`file: validate.comment.js, location: errors.isEmpty(), msg: Comment validation success`);
      return next();
    }

    if(!errors.isEmpty() && errors.errors[0].param === 'content'){
      logger.error(`file: validate.comment.js, location: body(content), error: ${errors.array()[0].msg}`);
      return res.status(status.BAD_REQUEST).json({message: errors.array()[0].msg})
    }
  }
];