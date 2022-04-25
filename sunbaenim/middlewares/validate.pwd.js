const { body, validationResult } = require("express-validator");

//에러코드 상수화
const status_code = {
  //클라이언트에서 요청을 잘못된 형식으로 입력 했을 때
  invalid_input: 400,
}

module.exports = [
  //비밀번호 변경 시 유저가 입력한 새 비밀번호의 유효성 검사
  body("new_pwd")
    .notEmpty()
    .withMessage("Please fill out pwd")
    .isLength({ min: 5 })
    .withMessage("Input password more than 5 words")
    .trim()
    .escape(),


  //비밀번호 변경 시 비밀번호 일치 여부 확인
  body("new_pwd_check")
  .custom((value, { req }) => {
    if (value !== req.body.new_pwd) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),


  (req, res, next) => {
    const errors = validationResult(req);
    //모든 유효성 검사 통과 시 next() 실행
    if(errors.isEmpty()) return next();

    if(!errors.isEmpty() && errors.errors[0].param === 'new_pwd') {
      return res.status(status_code.invalid_input).json({message: errors.array()[0].msg});
    }
    if(!errors.isEmpty() && errors.errors[0].param === 'new_pwd_check'){
      return res.status(status_code.invalid_input).json({message: errors.array()[0].msg})
    }
  }
];
