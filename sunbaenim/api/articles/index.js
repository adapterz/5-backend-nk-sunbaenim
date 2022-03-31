//Routes for articles

const express = require("express");
const router = express.Router();
const ctrl = require("./articles.ctrl");

//내 게시판 조회
router.get("/:user_id", ctrl.get_my_articles);

//내 임시 저장글 게시판 조회
//발행된 글과 구분하기 위해 is_published 파라미터 도입
router.get("/:user_id?is_published=0", ctrl.get_my_unpublished_articles);

// 내 임시 저장글 상세 조회 : 게시글 상세 조회 시 접속 유저를 구분할 필요 없다고 판단. 게시글 상세 조회 api는 동일하도록 수정

//게시글 생성
router.post("/", ctrl.create_article);

//게시글 임시저장 : 발행을 안했다 뿐이지, 게시글 생성과 동일한 리소스 사용. 따라서 삭제

//게시글 수정
router.patch("/:article_id", ctrl.edit_article);

//게시글 삭제
router.delete("/:article_id", ctrl.delete_article);

//게시글 상세 조회
router.get("/:article_id", ctrl.get_article);

//게시판 목록 조회
//FIXME: 아래 URL로 주제별, 좋아요 순, 게시글 생성순, 조회수 순, 댓글 순으로 구분할 수 있을까? 확인 필요.
//URL info : category_id(게시판 카테고리, 모든 카테고리일 경우 null),
//last_id(이전 응답의 마지막 article_id, 첫 요청시 null),
//size(페이지 사이즈)
router.get("?category_id=null&last_id=null&size=10", ctrl.get_articles);

//게시판 목록 조회(검색 시)
//URL info : keyword(검색 키워드)
router.get("?q=&category_id=null&last_id=null&size=10", ctrl.query_articles);

//게시글 좋아요 생성 및 삭제
router.post("/:article_id", ctrl.create_like);
router.post("/:article_id", ctrl.delete_like);

module.exports = router;
