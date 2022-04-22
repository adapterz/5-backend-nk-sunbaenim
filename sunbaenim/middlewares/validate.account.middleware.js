const { body, validationResult } = require("express-validator");

//에러코드 상수화
const status_code = {
  invalid_input: 400,
}

module.exports = [
  body("email")
  //회원가입 시 유저가 입력한 email 주소의 유효성 검사
    .notEmpty()
    .withMessage("Please fill out email")
    .isEmail()
    .withMessage("Input as an email format")
    .trim()
    .escape()
    .bail(),

  //회원가입 시 유저가 입력한 비밀번호의 유효성 검사
  body("pwd")
    .notEmpty()
    .withMessage("Please fill out pwd")
    .isLength({ min: 5 })
    .trim()
    .escape()
    .withMessage("Input password more than 5 words"),


  //회원가입 시 비밀번호 일치 여부 확인
  body("pwd_check")
  .custom((value, { req }) => {
    if (value !== req.body.pwd) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),


  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) return next();

    if(!errors.isEmpty() && errors.errors[0].param === 'email') {
      return res.status(status_code.invalid_input).json({message: errors.array()});
    }
    if(!errors.isEmpty() && errors.errors[0].param === 'pwd'){
      return res.status(status_code.invalid_input).json({message: errors.array()})
    }
    if(errors.errors[0].param === 'pwd_check'){
      return res.status(status_code.invalid_input).json({message: errors.array()})
    }
  }
];
