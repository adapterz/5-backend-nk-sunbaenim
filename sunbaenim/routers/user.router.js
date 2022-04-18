//Routes for users
const express = require("express");
const router = express.Router();
//Controllers
const ctrl = require("../controllers/users.ctrl");
//Middlewares
const account_validation = require("../middlewares/validate.account.middleware");
const login_validation = require("../middlewares/login.middleware");
const upload = require("../middlewares/multer.middleware");

//이미 로그인 되어있는 유저인지 확인하는 미들웨어
const logged_in = (req, res, next) => {
  if(req.session.user_id){
    console.log("User already logged in!")
    return res.redirect("/");
  }
  next();
}

//회원가입
router.post("/signup", account_validation, ctrl.create_account);

//내 닉네임 등록
router.post("/:user_id/nickname", ctrl.create_nickname);

//내 프로필 이미지 등록
router.post("/:user_id/image", upload.single('avatar'), ctrl.create_profile_image);

//내 관심분야 등록
router.post("/:user_id/fields", ctrl.create_field);

//회원탈퇴
router.delete("/signout", ctrl.delete_account);

//로그인
// router.get("/login", ctrl.login_page);
router.post("/login", logged_in, login_validation, ctrl.login);

//로그아웃
router.get("/logout", (req, res, next) => {
  req.session.destroy((err) => {
    next(err);
  });
  res.send("Completed Log out");
});

//비밀번호 찾기
router.post("/pwd_search", ctrl.find_pwd);

//내 닉네임 변경
router.patch("/:user_id/nickname", ctrl.edit_nickname);

//내 프로필 이미지 변경
router.patch("/:user_id/image", ctrl.edit_image);

//내 비밀번호 변경
router.patch("/:user_id/pwd", ctrl.edit_pwd);

module.exports = router;
