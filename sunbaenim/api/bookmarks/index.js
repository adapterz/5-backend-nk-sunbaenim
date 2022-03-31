//Routes for bookmarks

const express = require("express");
const router = express.Router();
const ctrl = require("./bookmarks.ctrl");

//북마크 목록 조회
//FIXME: 하나의 URL로 주제별, 좋아요 순, 게시글 생성순, 조회수 순, 댓글 순으로 구분할 수 있을까? 확인 필요.
//URL info : category_id(게시판 카테고리, 모든 카테고리일 경우 null),
//last_id(이전 응답의 마지막 article_id, 첫 요청시 null),
//size(페이지 사이즈)
router.get("?category_id=null&last_id=null&size=10", function (req, res) {
  res.status(200).end();
});

//북마크 목록 조회(검색 시)
//URL info : keyword(검색 키워드)
router.get("?q=&category_id=null&last_id=null&size=10", function (req, res) {
  res.status(200).end();
});

//북마크 상세 조회
router.get("/:bookmark_id", function (req, res) {
  const bookmark_id = parseInt(req.params.bookmark, 10);
  res.json(
    bookmarks.filter((bookmark) => bookmark.bookmark_id === bookmark_id)
  );
});

//북마크 생성
router.post("/", function (req, res) {
  const article_id = req.body.article_id;

  bookmarks.push(
    articles.filter((article) => article.article_id === article_id)
  );

  res.status(201).send("Success : Create bookmark");
});

//저장된 북마크 삭제
router.delete("/:bookmark_id", function (req, res) {
  const bookmark_id = parseInt(req.params.bookmark_id, 10);

  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  bookmarks = bookmarks.filter(
    (bookmark) => bookmark.bookmark_id !== bookmark_id
  );
  res.status(204).send("Success : signout");
});

module.exports = router;
