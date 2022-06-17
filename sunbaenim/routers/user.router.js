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
const status = require("../middlewares/error.handling/http.status.codes");
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
  "/nickname",
  login_check.if_not_logged_in,
  ctrl.create_nickname
);

//내 관심분야 등록
router.post("/:user_id/fields", login_check.if_logged_in, ctrl.create_field);

//로그인
router.get("/", login_check.if_not_logged_in, (req, res, next) => {
  return res.status(status.OK).send(req.session.user_id);
});
router.post("/login", login_check.if_logged_in, login_validation, ctrl.login);

//로그아웃
router.post("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
  });
  logger.info(
    `file: users.router.js, location: req.session.destroy(), msg: User Log out`
  );
  return res.status(status.OK).send({ message: "Completed Log out"});
});

//비밀번호 찾기
router.patch("/pwd_search", ctrl.find_pwd);

//내 비밀번호 변경
router.patch("/pwd", login_check.if_not_logged_in, pwd_validation, ctrl.edit_pwd);

//회원탈퇴
router.delete("/signout", ctrl.delete_account);

//인가 확인
router.get("/auth", (req, res, next) => {
  if (!req.session.user_id) {
    logger.info(
      `file: user.router.js, location: /auth, msg: User is not logged in`
    );
    return res.status(status.BAD_REQUEST).send({
      message: "user is not logged in"
    });
  }
  
  if (req.session.user_id) {
    logger.info(
      `file: user.router.js, location: /auth, msg: User is already logged in`
    );
    //서버에서는 페이지를 연결해주는 역할을 하지 않음.
    //400번대 코드로 보내주는 것으로 변경
    return res.status(status.OK).send({
      user_id: req.session.user_id
    });
  }
})

module.exports = router;
