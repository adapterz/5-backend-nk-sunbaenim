//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const Bookmark = {
  create: async function(article_id, user_id){
    try{
      sql.execute("INSERT INTO bookmarks (article_id, user_id) VALUES (?,?)", [article_id, user_id]);
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: INSERT INTO bookmarks (article_id, user_id) VALUES (${article_id}, ${user_id}), error: ${error}`
      );
    }
  },

  //북마크 정보가 히스토리를 남겨야할 만큼 중요한 정보라고 판단하지 않아 patch보다는 delete하도록 구현함
  delete: async function(bookmark_id, user_id){
    try{
      sql.execute("DELETE FROM bookmarks WHERE id = ? AND user_id = ?", [bookmark_id, user_id]);
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: DELETE FROM bookmarks WHERE id = ${bookmark_id} AND user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //북마크 아이디로 북마크 정보 찾기
  find_by_id: async function(bookmark_id){
    try{
      const [row] = await sql.execute("SELECT * FROM bookmarks WHERE id = ?", [
        bookmark_id,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: SELECT * FROM bookmarks WHERE id = ${bookmark_id}, error: ${error}`
      );
    }
  },

  //유저 식별 id로 게시물들의 id 찾아오기
  find_articles_by_user_id: async function(user_id){
    try{
      const [row] = await sql.execute("SELECT article_id FROM bookmarks WHERE user_id = ?", [
        user_id,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: SELECT article_id FROM bookmarks WHERE user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //유저가 기존에 북마크한 게시물인지 유저 아이디와 게시물 아이디로 찾기
  find_history: async function(user_id, article_id){
    try{
      const [row] = await sql.execute("SELECT id FROM bookmarks WHERE user_id = ? AND article_id = ?", [
        user_id, article_id,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: SELECT id FROM bookmarks WHERE user_id = ${user_id} AND article_id = ${article_id}, error: ${error}`
      );
    }
  },

  //유저가 북마크한 모든 게시물의 정보 가져오기
  get_bookmarks: async function (user_id) {
    try{
      const [row] = await sql.query(
        "SELECT * FROM bookmarks JOIN articles ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ?",
        [user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: SELECT * FROM bookmarks JOIN articles ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //요청한 페이지 사이즈에 따라 유저 발행 게시물 목록 조회
  get_page: async function (user_id, offset, size, key) {
    try{
      const text = "%" + key + "%";
    const [row] = await sql.query(
      "SELECT * FROM articles JOIN bookmarks ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ? AND (title LIKE ? OR content LIKE ?) ORDER BY bookmarks.id DESC LIMIT ?, ?",
      [user_id, text, text, offset, size]
    );
    return row;
    } catch(error){
      logger.error(
        `file: bookmark.model.js, location: SELECT * FROM articles JOIN bookmarks ON bookmarks.article_id = articles.id WHERE bookmarks.user_id = ${user_id} AND (title LIKE ${text} OR content LIKE ${text}) ORDER BY bookmarks.id DESC LIMIT ${offset}, ${size}, error: ${error}`
      );
    }
  },

};

module.exports = Bookmark;