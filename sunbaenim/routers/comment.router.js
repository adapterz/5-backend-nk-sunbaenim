//Routes for comments
const express = require("express");
const router = express.Router();
//Controller
const ctrl = require("../controllers/comments.ctrl");
//Middleware
//댓글의 유효성을 판단하는 미들웨어 (댓글 본문의 최소 글자 수)
const comment_validation = require("../middlewares/validate.comment");
//로그인 되어있는 유저인지 확인하는 미들웨어
const if_not_logged_in = (req, res, next) => {
  if(!req.session.user_id){
    console.log("User is not logged in!");
    return res.redirect("/users/login");
  }
  next();
}


//댓글 생성
router.post("/:article_id", if_not_logged_in, comment_validation, ctrl.create_comment);

//댓글 수정
router.patch("/:comment_id", if_not_logged_in, comment_validation, ctrl.edit_comment);

//댓글 삭제
router.delete("/:comment_id", if_not_logged_in, ctrl.delete_comment);

//게시글 댓글 목록 조회
router.get("/:article_id", ctrl.get_comments);

//댓글 좋아요 생성 및 취소
router.post("/:comment_id/likes", if_not_logged_in, ctrl.create_comment_like);

module.exports = router;
