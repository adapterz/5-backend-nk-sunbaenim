const { body, validationResult } = require("express-validator");

const status_code = {
  invalid_input: 400,
}

module.exports = [
  body("email")
    .notEmpty()
    .withMessage("Please fill out email")
    .isEmail()
    .withMessage("Input as an email format")
    .bail(),

  body("pwd")
    .notEmpty()
    .withMessage("Please fill out pwd")
    .isLength({ min: 5 })
    .withMessage("Input password more than 5 words"),


  body("pwd_check")
  .custom((value, { req }) => {
    if (value !== req.body.pwd) {
      throw new Error("Password confirmation does not match password");
    }
    return true;
  }),


  (req, res, next) => {
    const errors = validationResult(req);

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
