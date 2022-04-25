const { body, validationResult } = require("express-validator");

//에러코드 상수화
const status_code = {
  //클라이언트에서 요청을 잘못된 형식으로 입력 했을 때
  invalid_input: 400,
}

module.exports = [
  //댓글 본문의 유효성 검사
  body("content")
    .notEmpty()
    .withMessage("Please fill out content")
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) return next();

    if(!errors.isEmpty() && errors.errors[0].param === 'content'){
      return res.status(status_code.invalid_input).json({message: errors.array()[0].msg})
    }
  }
];