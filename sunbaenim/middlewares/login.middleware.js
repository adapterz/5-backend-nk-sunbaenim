const { body, validationResult } = require("express-validator");

//에러코드 상수화
const status_code = {
  //클라이언트에서 요청을 잘못된 형식으로 입력 했을 때
  invalid_input: 400,
}

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
    if(errors.isEmpty()) return next();

    if(!errors.isEmpty() && errors.errors[0].param === 'email') {
      return res.status(status_code.invalid_input).json({message: errors.array()[0].msg});
    }
    if(!errors.isEmpty() && errors.errors[0].param === 'pwd'){
      return res.status(status_code.invalid_input).json({message: errors.array()[0].msg});
    }
  }
];