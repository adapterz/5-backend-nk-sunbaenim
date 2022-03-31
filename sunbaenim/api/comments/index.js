//Routes for comments

const express = require("express");
const router = express.Router();
const ctrl = require("./comments.ctrl");

//내 댓글 조회 : 내 댓글임을 조금 더 명시하기 위해 url에 유저 아이디로 설정
router.get("/:user_id", ctrl.get_my_comments);

//댓글 생성
router.post("/comments/:article_id", ctrl.create_comment);

//대댓글 생성
router.post("/comments/:article_id", ctrl.reply_comment);

//댓글 수정
router.patch("/comments/:comment_id", ctrl.edit_comment);

//댓글 삭제
router.delete("/comments/:comment_id", ctrl.delete_comment);

//게시글 댓글 목록 조회
router.get("/comments/:article_id", ctrl.get_comment_list);

//댓글 좋아요 생성
router.post("/comments/:comment_id", ctrl.create_comment_like);

//댓글 좋아요 삭제
router.post("/comments/:comment_id", ctrl.delete_comment_like);

module.exports = router;
