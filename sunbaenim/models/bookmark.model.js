//db 연결
const sql = require("../config/mysql");

const Bookmark = {
  create: async function(article_id, user_id){
    sql.execute("INSERT INTO bookmarks (article_id, user_id) VALUES (?,?)", [article_id, user_id]);
  },

  //북마크 정보가 히스토리를 남겨야할 만큼 중요한 정보라고 판단하지 않아 patch보다는 delete하도록 구현함
  delete: async function(user_id, article_id){
    sql.execute("DELETE FROM bookmarks WHERE user_id = ? and article_id = ?", [user_id, article_id]);
  },

  //북마크 아이디로 북마크 정보 찾기
  find_by_id: async function(bookmark_id){
    const [row] = await sql.execute("SELECT * FROM bookmarks WHERE id = ?", [
      bookmark_id,
    ]);
    return row;
  },

  //유저 식별 id로 게시물들의 id 찾아오기
  find_articles_by_user_id: async function(user_id){
    const [row] = await sql.execute("SELECT article_id FROM bookmarks WHERE user_id = ?", [
      user_id,
    ]);
    return row;
  },

  //유저가 기존에 북마크한 게시물인지 유저 아이디와 게시물 아이디로 찾기
  find_history: async function(user_id, article_id){
    const [row] = await sql.execute("SELECT id FROM bookmarks WHERE user_id = ? and article_id = ?", [
      user_id, article_id,
    ]);
    return row;
  },

  //유저가 북마크한 모든 게시물의 정보 가져오기
  get_articles: async function (user_id) {
    const [row] = await sql.query(
      "SELECT * FROM bookmarks INNER JOIN articles ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ?",
      [user_id]
    );
    return row;
  },

  //요청한 페이지 사이즈에 따라 유저 발행 게시물 목록 조회
  get_page: async function (user_id, offset, size) {
    const [row] = await sql.query(
      "SELECT * FROM articles INNER JOIN bookmarks ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ? ORDER BY bookmarks.id DESC LIMIT ?, ?",
      [user_id, offset, size]
    );
    return row;
  },

  //검색어가 들어간 북마크된 게시물들 찾기
  search_bookmarked_articles: async function(key){
    const text = "%" + key + "%";
    console.log(text);
    const [row] = await sql.query("SELECT * FROM bookmarks INNER JOIN articles ON bookmarks.article_id = articles.id WHERE title LIKE ? OR content LIKE ? ORDER BY bookmarks.id DESC", [text, text])
    return row;
  },

};

module.exports = Bookmark;