const express = require("express");
const router = express.Router();
//Controller
const ctrl = require("../controllers/bookmarks.ctrl");
//Middleware

//로그인 되어있는 유저인지 확인하는 미들웨어
const if_not_logged_in = (req, res, next) => {
  if(!req.session.user_id){
    console.log("User is not logged in!");
    return res.redirect("/users/login");
  }
  next();
}

//북마크 목록 조회
//FIXME: 하나의 URL로 주제별, 좋아요 순, 게시글 생성순, 조회수 순, 댓글 순으로 구분할 수 있을까? 확인 필요.
//URL info : category_id(게시판 카테고리, 모든 카테고리일 경우 null),
//last_id(이전 응답의 마지막 article_id, 첫 요청시 null),
//size(페이지 사이즈)
router.get("/:category_id/:last_id/:size", if_not_logged_in, ctrl.get_bookmarks);

//북마크 목록 조회(검색 시)
//URL info : keyword(검색 키워드)
router.get("/:q/:category_id/:last_id/:size", if_not_logged_in, ctrl.query_bookmarks);

//북마크 상세 조회
router.get("/:bookmark_id",if_not_logged_in, ctrl.get_bookmark);

//북마크 생성
router.post("/",if_not_logged_in, ctrl.create_bookmark);

//저장된 북마크 삭제
router.delete("/:bookmark_id", if_not_logged_in, ctrl.delete_bookmark);

module.exports = router;
