//Routes for users
const express = require("express");
const router = express.Router();
const ctrl = require("./users.ctrl");

//회원가입
router.post("/signup", ctrl.signup);

//내 닉네임 등록
router.post("/:user_id/nickname", ctrl.get_nickname);

//TODO: 프로필 이미지 API
//내 프로필 이미지 등록
router.post("/:user_id/image", ctrl.get_image);

//내 관심분야 등록
router.post("/:user_id/fields", ctrl.get_field);

//회원탈퇴
router.delete("/signout", ctrl.signout);

//FIXME: 로그인, 로그아웃 API
//TODO: 로그인, 로그아웃을 구현하기 위해 알아야 하는 개념 (session, async, await, mysql)
//로그인
router.post("/login", ctrl.login);

//로그아웃
router.post("/logout", ctrl.logout);

//비밀번호 찾기
router.post("/pwd_search", ctrl.get_pwd);

//내 닉네임 변경
router.patch("/:user_id/nickname", ctrl.edit_nickname);

//내 프로필 이미지 변경
router.patch("/:user_id/image", ctrl.edit_image);

//내 비밀번호 변경
router.patch("/:user_id/pwd", ctrl.edit_pwd);

module.exports = router;
