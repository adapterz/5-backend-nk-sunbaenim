//db 연결
const sql = require("../config/mysql");

const Bookmark = {
  create: async function(article_id, user_id){
    sql.execute("INSERT INTO bookmarks (article_id, user_id) VALUES (?,?)", [article_id, user_id]);
  },

  //북마크 정보가 히스토리를 남겨야할 만큼 중요한 정보라고 판단하지 않아 patch보다는 delete하도록 구현함
  delete: async function(bookmark_id){
    sql.execute("DELETE FROM bookmarks WHERE id = ?", [bookmark_id]);
  },

  find_by_id: async function(bookmark_id){
    const [row] = await sql.execute("SELECT * FROM bookmarks WHERE id = ?", [
      bookmark_id,
    ]);
    return row;
  }

};

module.exports = Bookmark;