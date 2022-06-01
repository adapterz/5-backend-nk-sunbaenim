const { body, validationResult } = require("express-validator");
const logger = require("../config/winston");
const status = require("../middlewares/error.handling/http.status.codes");

module.exports = [
  body("title")
  //게시글 제목의 유효성 검사
    .notEmpty()
    .withMessage("Please fill out title of article")
    .isLength({ max: 90 })
    .withMessage("Title cannot over 90 words")
    .escape()
    .bail(),

  //게시글 본문의 유효성 검사
  body("content")
    .notEmpty()
    .withMessage("Please fill out content")
    .isLength({ min: 1 })
    .withMessage("Input content more than 1 words")
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) {
      logger.info(`file: validate.article.js, location: errors.isEmpty(), msg: Article validation success`);
      return next();
    }

    if(!errors.isEmpty() && errors.errors[0].param === 'title') {
      logger.error(`file: validate.article.js, location: body(title), error: ${errors.array()[0].msg}`);
      return res.status(status.BAD_REQUEST).json({message: errors.array()[0].msg});
    }
    if(!errors.isEmpty() && errors.errors[0].param === 'content'){
      logger.error(`file: validate.article.js, location: body(content), error: ${errors.array()[0].msg}`);
      return res.status(status.BAD_REQUEST).json({message: errors.array()[0].msg})
    }
  }
];
