const express = require("express");
const router = express.Router();
//Controller
const ctrl = require("../controllers/bookmarks.ctrl");
//Middleware
//로그인 되어있는 유저인지 확인하는 미들웨어
//FIXME: 클라이언트 API 테스트로 로그인 미들웨어 임시 주석 처리
const login_check = require("../middlewares/logincheck.middleware");


//북마크 목록 조회
//req.query로 요청을 받아 구분할 예정 (url 예시 : /bookmarks?page&size)
router.get("/", login_check.if_not_logged_in, ctrl.get_bookmarks);

//북마크 상세 조회
router.get("/:bookmark_id", login_check.if_not_logged_in, ctrl.get_bookmark);

//북마크 생성
router.post("/", login_check.if_not_logged_in, ctrl.bookmark_create);

//저장된 북마크 삭제
router.delete("/:bookmark_id", login_check.if_not_logged_in, ctrl.delete_bookmark);

module.exports = router;
