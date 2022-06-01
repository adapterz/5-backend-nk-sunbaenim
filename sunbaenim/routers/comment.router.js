//Routes for comments
const express = require("express");
const router = express.Router();
//Controller
const ctrl = require("../controllers/comments.ctrl");
//Middleware
//댓글의 유효성을 판단하는 미들웨어 (댓글 본문의 최소 글자 수)
const comment_validation = require("../middlewares/validate.comment");
//로그인 되어있는 유저인지 확인하는 미들웨어
// FIXME: 클라이언트 api 테스트를 위해 일단 무효화
const login_check = require("../middlewares/logincheck.middleware");

//댓글 생성
router.post("/", login_check.if_not_logged_in, comment_validation, ctrl.create_comment);

//댓글 수정
router.patch("/", login_check.if_not_logged_in, comment_validation, ctrl.edit_comment);

//댓글 삭제
//DELETE request는 바디값이 없다. 따라서 댓글 id는 바디가 아닌 url로 전달한다.
router.delete("/:comment_id", login_check.if_not_logged_in, ctrl.delete_comment);

//게시글 댓글 목록 조회
// URL : /comments?article_id&limit&cursor
router.get("/", ctrl.get_comments);

//댓글 좋아요 생성 및 취소
router.post("/likes", login_check.if_not_logged_in, ctrl.create_comment_like);

module.exports = router;
