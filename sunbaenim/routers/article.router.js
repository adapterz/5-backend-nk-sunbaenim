//Routes for articles
const express = require("express");
const router = express.Router();
//Controllers
const ctrl = require("../controllers/articles.ctrl");
//Middlewares
const article_validation = require("../middlewares/validate.article");
const login_check = require("../middlewares/logincheck.middleware");

//게시글 생성
router.post("/", login_check.if_not_logged_in, article_validation, ctrl.create_article);

//게시글 수정
router.patch("/", login_check.if_not_logged_in, article_validation, ctrl.edit_article);

//게시글 삭제
//DELETE request는 바디값이 없다. 따라서 삭제할 게시물 id는 바디가 아닌 url로 전달한다.
router.delete("/:article_id", login_check.if_not_logged_in, ctrl.delete_article);

//게시글 상세 조회
router.get("/:article_id", ctrl.get_article);

//내가 발행한 글 또는 임시 저장한 글의 목록 조회 (같은 컨트롤러로 적용 가능할 것으로 판단하여 합침)
//req.query로 요청을 받아 구분할 예정 (url 예시 : /articles/:is_published?page&size)
router.get("/my/:is_published", login_check.if_not_logged_in, ctrl.get_my_articles);

//게시판 목록 조회 & 검색 조회
//req.query로 요청을 받아 구분할 예정 (url 예시 : /articles?limit&cursor&key)
router.get("/", ctrl.get_articles);

//게시글 좋아요 생성 및 삭제
router.post("/likes", login_check.if_not_logged_in, ctrl.like_on_off);
//게시글 좋아요 여부 확인
router.get("/likes/:article_id", login_check.if_not_logged_in, ctrl.like_check);

module.exports = router;
