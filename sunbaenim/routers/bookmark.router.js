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
//req.query로 요청을 받아 구분할 예정 (url 예시 : /bookmarks?page&size)
router.get("/", if_not_logged_in, ctrl.get_bookmarks);

//북마크 목록 조회(검색 시)
router.get("/search/:category_id", if_not_logged_in, ctrl.query_bookmarks);

//북마크 상세 조회
router.get("/:bookmark_id",if_not_logged_in, ctrl.get_bookmark);

//북마크 생성 또는 삭제 (버튼 식으로 온오프 하도록 합침)
router.post("/",if_not_logged_in, ctrl.bookmark_on_off);

// //저장된 북마크 삭제
// router.delete("/:bookmark_id", if_not_logged_in, ctrl.delete_bookmark);

module.exports = router;
