//Routes for users
const express = require("express");
const router = express.Router();
//Controllers
const ctrl = require("../controllers/users.ctrl");
//Middlewares
const account_validation = require("../middlewares/validate.account.middleware");
const pwd_validation = require("../middlewares/validate.pwd");
const login_validation = require("../middlewares/login.middleware");
const login_check = require("../middlewares/logincheck.middleware");
const logger = require("../config/winston");

//회원가입
router.post(
  "/signup",
  login_check.if_logged_in,
  account_validation,
  ctrl.create_account
);

//내 닉네임 등록 및 변경
router.post(
  "/:user_id/nickname",
  login_check.if_logged_in,
  ctrl.create_nickname
);

//내 관심분야 등록
router.post("/:user_id/fields", login_check.if_logged_in, ctrl.create_field);

//로그인
router.post("/login", login_check.if_logged_in, login_validation, ctrl.login);

//로그아웃
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
  });
  logger.info(
    `file: users.router.js, location: req.session.destroy(), msg: User Log out`
  );
  return res.status(200).send({ message: "Completed Log out"});
});

//비밀번호 찾기
router.delete("/pwd_search", ctrl.find_pwd);

//내 비밀번호 변경
router.patch("/pwd", pwd_validation, ctrl.edit_pwd);

//회원탈퇴
router.delete("/signout", ctrl.delete_account);

module.exports = router;
