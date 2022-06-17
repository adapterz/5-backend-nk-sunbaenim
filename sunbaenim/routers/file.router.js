const express = require("express");
const router = express.Router();
const path = require("path");

//Controllers
const ctrl = require("../controllers/files.ctrl");
//Middlewares
//multer 모듈 연결
const upload = require("../middlewares/multer.middleware");
//로그인 되어있는 유저인지 확인하는 미들웨어
const login_check = require("../middlewares/logincheck.middleware");


//게시글 내 파일 생성
router.post("/:article_id", login_check.if_not_logged_in, upload.array('article_files'), ctrl.create_files);

//내 프로필 이미지 등록
//이미지 등록과 변경 시, 동일한 알고리즘이므로 같은 api 사용
router.post("/user/:user_id", login_check.if_logged_in, upload.single('avatar'), ctrl.create_profile_image);

//내 프로필 이미지 받기
router.get("/user", login_check.if_not_logged_in, ctrl.get_profile_image);

//특정 유저 프로필 이미지 받기
router.get("/user/:user_id", ctrl.get_writer_profile_image);

module.exports = router;