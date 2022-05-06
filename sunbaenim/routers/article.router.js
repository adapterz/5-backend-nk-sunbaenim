//Routes for articles
const express = require("express");
const router = express.Router();
//Controllers
const ctrl = require("../controllers/articles.ctrl");
//Middlewares
//게시글의 유효성을 판단하는 미들웨어 (제목 및 본문의 최소 글자 수)
const article_validation = require("../middlewares/validate.article");
const upload = require("../middlewares/multer.middleware");

//로그인 되어있는 유저인지 확인하는 미들웨어
const if_not_logged_in = (req, res, next) => {
  if(!req.session.user_id){
    console.log("User is not logged in!");
    return res.redirect("/users/login");
  }
  next();
}

//게시글 생성
router.post("/", if_not_logged_in, article_validation, ctrl.create_article);

//게시글 내 파일 생성
router.post("/files", if_not_logged_in, upload.array('article_files'), ctrl.create_files);

//게시글 수정
router.patch("/:article_id", if_not_logged_in, article_validation, ctrl.edit_article);

//게시글 삭제
router.delete("/:article_id", if_not_logged_in, ctrl.delete_article);

//게시글 상세 조회
router.get("/:article_id", ctrl.get_article);

//내가 발행한 글 또는 임시 저장한 글의 목록 조회 (같은 컨트롤러로 적용 가능할 것으로 판단하여 합침)
//req.query로 요청을 받아 구분할 예정 (url 예시 : /articles/:is_published?page&size)
router.get("/my/:is_published", if_not_logged_in, ctrl.get_my_articles);

//게시판 목록 조회
//req.query로 요청을 받아 구분할 예정 (url 예시 : /articles?limit&cursor)
router.get("/", ctrl.get_articles);

//게시글 검색
//req.query로 요청을 받아 구분할 예정 (url 예시 : /search/:category_id?key&limit&cursor)
router.get("/search/:category_id", ctrl.query_articles);

//게시글 좋아요 생성 및 삭제
router.post("/:article_id/likes", if_not_logged_in, ctrl.like_on_off);

module.exports = router;
