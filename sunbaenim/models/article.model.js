//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const Article = {
  //게시글 생성
  create: async function (user_id, title, content, category_id, is_published) {
    try {
      //게시글 생성 시 조회수, 좋아요수, 댓글수, 초기화
      const views = 0;
      const total_likes = 0;
      const total_comments = 0;
      await sql.execute(
        "INSERT INTO articles (user_id, title, content, views, total_likes, category, is_published, total_comments, create_at, edit_at, delete_at) VALUES (?,?,?,?,?,?,?,?,NOW(),null,null)",
        [
          user_id,
          title,
          content,
          views,
          total_likes,
          category_id,
          is_published,
          total_comments,
        ]
      );
    } catch (error) {
      logger.error(
        `file: article.model.js, location: INSERT INTO articles (user_id, title, content, views, total_likes, category, is_published, total_comments, create_at, edit_at, delete_at) VALUES (${user_id}, ${title}, ${content}, ${views}, ${total_likes}, ${category_id}, ${is_published}, ${total_comments}, NOW(),null,null), error: ${error}`
      );
    }
  },

  //게시글 수정
  edit: async function (article_id, title, content, category_id) {
    try {
      sql.execute(
        "UPDATE articles SET title = ?, content = ?, category = ?, edit_at = NOW() WHERE id = ?",
        [title, content, category_id, article_id]
      );
    } catch (error) {
      logger.error(
        `file: article.model.js, location: UPDATE articles SET title = ${title}, content = ${content}, category = ${category_id}, create_at = NOW(), edit_at = NOW() WHERE id = ${article_id}, error: ${error}`
      );
    }
  },

  //게시글 삭제
  delete: async function (article_id) {
    try {
      sql.execute(
        "UPDATE articles SET is_published = 0, create_at = null, delete_at = NOW() WHERE id = ?",
        [article_id]
      );
    } catch (error) {
      logger.error(
        `file: article.model.js, location: UPDATE articles SET is_published = 0, create_at = null, delete_at = NOW() WHERE id = ${article_id}, error: ${error}`
      );
    }
  },

  //게시글 식별 id로 게시글 정보 조회
  find_by_id: async function (article_id) {
    try {
      const [row] = await sql.execute("SELECT * FROM articles WHERE id = ?", [
        article_id,
      ]);
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT * FROM articles WHERE id = ${article_id}, error: ${error}`
      );
    }
  },

  //게시글 제목으로 게시글 id 조회
  find_by_title: async function (title) {
    try{
      const [row] = await sql.execute(
        "SELECT id FROM articles WHERE title = ?",
        [title]
      );
      return row;
    } catch(error) {
      logger.error(
        `file: article.model.js, location: SELECT article_id FROM articles WHERE title = ${title}, error: ${error}`
      );
    }
  },

  //게시글을 작성한 유저 id로 게시글 정보 조회
  find_by_user_id: async function (user_id) {
    try {
      const [row] = await sql.execute(
        "SELECT * FROM articles WHERE user_id = ?",
        [user_id]
      );
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT * FROM articles WHERE user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //특정 유저가 발행한 게시물 전체 데이터 조회
  find_articles: async function (is_published, user_id) {
    try {
      const [row] = await sql.query(
        "SELECT * FROM articles WHERE is_published = ? and user_id = ?",
        [is_published, user_id]
      );
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT * FROM articles WHERE is_published = ${is_published} and user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //요청한 페이지 사이즈에 따라 유저 발행 게시물 목록 조회
  get_my_articles: async function (is_published, user_id, offset, size) {
    try {
      const [row] = await sql.query(
        "SELECT id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = ? and user_id = ? ORDER BY id DESC LIMIT ?, ?",
        [is_published, user_id, offset, size]
      );
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = ${is_published} and user_id = ${user_id} ORDER BY id DESC LIMIT ${offset}, ${size}, error: ${error}`
      );
    }
  },

  //게시판 초기 화면 목록 조회 + 검색 조회
  get_articles_init: async function (limit, key) {
    try {
      const text = "%" + key + "%";
      const [row] = await sql.query(
        "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 AND (title LIKE ? OR content LIKE ?) ORDER BY id DESC LIMIT ?",
        [text, text, limit]
      );
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 AND (title LIKE ${text} OR content LIKE ${text}) ORDER BY id DESC LIMIT ${limit}, error: ${error}`
      );
    }
  },

  //게시판 다음 목록 조회
  get_articles: async function (cursor, limit) {
    try {
      const [row] = await sql.query(
        "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 AND id < ? ORDER BY id DESC LIMIT ?",
        [cursor, limit]
      );
      return row;
    } catch (error) {
      logger.error(
        `file: article.model.js, location: SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 AND AND id < ${cursor}) ORDER BY id DESC LIMIT ${limit}, error: ${error}`
      );
    }
  },

  //좋아요 첫 생성
  create_like: async function (is_liked, article_id, user_id) {
    try {
      //알림 db에 들어갈 리액션의 종류 == 여기서는 좋아요
      const reaction = "like";
      //좋아요 db에 좋아요를 한 유저와 게시물의 정보 생성
      await sql.execute(
        "INSERT INTO likes (article_id, user_id, is_liked, create_at) VALUES (?,?,?,NOW())",
        [article_id, user_id, is_liked]
      );

      //아래 코드는 좋아요가 생성되었을 시, 좋아요가 적용된 게시물의 작성자에게 알림을 주기 위함
      //좋아요가 눌러진 게시물의 작성자 정보를 가져옴 == creator
      const [creator] = await sql.execute(
        "SELECT user_id FROM articles WHERE id = ?",
        [article_id]
      );
      logger.info(
        `file: article.model.js, location: SELECT user_id FROM articles WHERE id = ${article_id}, msg: 좋아요가 적용된 게시물의 작성자 id ${creator[0].user_id}`
      );

      //알림 db에 좋아요 생성 정보 업데이트
      //여기서 쿼리문의 인자로 들어가는 user_id는 좋아요를 누른 유저의 정보이며, 쿼리문 안에 user_id와 인자인 creator는 좋아요가 눌러진 게시물의 작성자를 의미.
      //FIXME: 주석으로 설명을 보완하였으나 변수가 다소 뒤죽박죽. 수정 필요.
      await sql.execute(
        "INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at, is_checked) VALUES (?,?,?,?,NOW(),'N')",
        [creator[0].user_id, article_id, reaction, user_id]
      );
      logger.info(
        `file: article.model.js, location: INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at, is_checked) VALUES (${creator[0].user_id}, ${article_id}, ${reaction}, ${user_id}, NOW(), 'N'), msg: 게시물의 작성자 ${creator[0].user_id}에게 ${user_id}가 좋아요를 눌렀음을 알림`
      );
    } catch (error) {
      logger.error(
        `file: article.model.js, location: create_like(${is_liked}, ${article_id}, ${user_id}), error: ${error}`
      );
    }
  },

  //좋아요 수정
  edit_like: async function (is_liked, article_id, user_id) {
    try{
      sql.execute(
        "UPDATE likes SET is_liked = ?, create_at = NOW() WHERE article_id = ? and user_id = ?",
        [is_liked, article_id, user_id]
      );
    } catch(error){
      logger.error(
        `file: article.model.js, location: UPDATE likes SET is_liked = ${is_liked}, create_at = NOW() WHERE article_id = ${article_id} and user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //좋아요 등록 히스토리 확인
  find_like_by_id: async function (article_id, user_id) {
    try{
      const [row] = await sql.query(
        "SELECT * FROM likes WHERE article_id = ? AND user_id = ?",
        [article_id, user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: article.model.js, location: SELECT * FROM likes WHERE article_id = ${article_id} and user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //게시물의 총 좋아요 개수 업데이트
  update_total_likes: async function (is_liked, article_id) {
    try{
      const origin_data = await sql.query(
        "SELECT total_likes FROM articles WHERE id = ?",
        [article_id]
      );
      logger.info(
        `file: article.model.js, location: SELECT total_likes FROM articles WHERE id = ${article_id}, msg: 원래 좋아요 총 개수 ${origin_data[0][0].total_likes}`
      );
  
      let update_likes;
      if (is_liked === 1) {
        update_likes = parseInt(origin_data[0][0].total_likes) + 1;
      } else if (is_liked === 0) {
        //만약 좋아요가 -1이 될 경우 최소 숫자인 0으로 처리
        update_likes = Math.max(0, parseInt(origin_data[0][0].total_likes) - 1);
      }
  
      logger.info(
        `file: article.model.js, location: update_total_likes(), msg: 유저 반응 이후 최종 좋아요 총 개수 ${update_likes}`
      );
  
      await sql.execute("UPDATE articles SET total_likes = ? WHERE id = ?", [
        update_likes,
        article_id,
      ]);
    } catch(error){
      logger.error(
        `file: article.model.js, location: update_total_likes(${is_liked}, ${article_id}), error: ${error}`
      );
    }
  },

  //게시물의 조회수 업데이트
  update_views: async function (article_id) {
    try {
      sql.execute("UPDATE articles SET views = views + 1 WHERE id = ?", [
        article_id,
      ]);
    } catch (error) {
      logger.error(
        `file: article.model.js, location: UPDATE articles SET views = views + 1 WHERE id = ${article_id}, error: ${error}`
      );
    }
  },
};

module.exports = Article;
