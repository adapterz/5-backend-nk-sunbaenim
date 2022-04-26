//db 연결
const sql = require("../config/mysql");

const Article = {
  //게시글 생성
  create: async function (
    user_id,
    title,
    content,
    views,
    total_likes,
    category_id,
    is_published,
    total_comments,
    edit_at,
    delete_at
  ) {
    //게시글 생성 일자
    const create_at = new Date().toISOString().slice(0, 10).replace("T", " ");
    sql.execute(
      "INSERT INTO articles (user_id, title, content, views, total_likes, category, is_published, total_comments, create_at, edit_at, delete_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [
        user_id,
        title,
        content,
        views,
        total_likes,
        category_id,
        is_published,
        total_comments,
        create_at,
        edit_at,
        delete_at,
      ]
    );
  },

  //게시글의 파일 추가
  create_files: async function (user_id, file_name) {
    //게시글의 파일 생성 일자
    const create_at = new Date();
    sql.execute(
      "INSERT INTO files (user_id, file_name, create_at) VALUES (?,?,?)",
      [user_id, file_name, create_at]
    );
  },


  //게시글 수정
  edit: async function (article_id, title, content, category_id) {
    //게시글의 수정 일자
    const create_at = new Date();
    const edit_at = new Date();
    sql.execute(
      "UPDATE articles SET title = ?, content = ?, category = ?, create_at = ?, edit_at = ? WHERE id = ?",
      [title, content, category_id, create_at, edit_at, article_id]
    );
  },

  //게시글 삭제
  delete: async function (article_id) {
    const is_published = 0;
    const create_at = null;
    const delete_at = new Date();
    sql.execute(
      "UPDATE articles SET is_published = ?, create_at = ?, delete_at = ? WHERE id = ?",
      [is_published, create_at, delete_at, article_id]
    );
  },

  //게시글 식별 id로 게시글 정보 조회
  find_by_id: async function (article_id) {
    const [row] = await sql.execute("SELECT * FROM articles WHERE id = ?", [
      article_id,
    ]);
    return row;
  },

  //게시글을 작성한 유저 id로 게시글 정보 조회
  find_by_user_id: async function (user_id) {
    const [row] = await sql.execute(
      "SELECT * FROM articles WHERE user_id = ?",
      [user_id]
    );
    return row;
  },


  //게시판 초기 화면 목록 조회
  get_articles_init: async function(limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 ORDER BY id desc LIMIT ?", [limit]
    );
    return row;
  },

  //게시판 다음 목록 조회
  get_articles: async function(cursor, limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 and id < ? ORDER BY id desc LIMIT ?", [cursor, limit]
    );
    return row;
  },

  //특정 유저가 발행한 게시물 목록 조회
  get_my_articles: async function(is_published, user_id, offset, limit) {
    const [row] = await sql.query(
      "SELECT id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = ? and user_id = ? ORDER BY id desc LIMIT ?, ?", [is_published, user_id, offset, limit]
    );
    return row;
  },
};

module.exports = Article;
