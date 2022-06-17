//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const Comment = {
  //댓글 생성
  create: async function (
    //댓글이 달린 게시물의 식별 id
    article_id,
    //댓글을 단 유저의 식별 id
    user_id,
    //댓글의 본문
    content,
    //댓글의 관계를 알 수 있는 식별자. 대댓글일 경우 자식의 의미로 1 표기, 부모일 경우 0
    class_id,
    //대댓글일 경우, 순서 식별하기 위함
    orders,
    //어떤 부모 댓글에 달린 대댓글인지 식별하기 위해, 대댓글일 경우 부모 댓글의 식별 id를 입력
    group_id
  ) {
    try {
      //알림 db에 들어갈 리액션의 종류 == 여기서는 댓글
      const reaction = "comment";
      //댓글 db에 댓글을 단 유저 정보와 게시물의 정보 생성
      //댓글, 대댓글 총 개수 초기화 total_likes = 0, total_replies = 0
      await sql.execute(
        "INSERT INTO comments (article_id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies) VALUES (?,?,?,NOW(),?,?,?,0,0)",
        [
          article_id,
          user_id,
          content,
          class_id,
          orders,
          group_id
        ]
      );

      //게시판의 total comments 개수에 1 추가
      await sql.execute("UPDATE articles SET total_comments = total_comments + 1 WHERE id = ?", [
        article_id,
      ]);

      //아래 코드는 댓글 혹은 대댓글이 생성되었을 시, 적용된 게시물 또는 부모 댓글 작성자에게 알림을 주기 위함
      //댓글, 대댓글 상관 없이 게시물 작성자에겐 알람이 가야함.
      //creator === 게시물 작성자의 식별 id
      const [creator] = await sql.execute(
        "SELECT user_id FROM articles WHERE id = ?",
        [article_id]
      );
      logger.info(
        `file: comment.model.js, location: SELECT user_id FROM articles WHERE id = ${article_id}, msg: 댓글이 달린 게시물의 작성자 id ${creator[0].user_id}`
      );
      //알림 db에 댓글 생성 정보 업데이트
      //여기서 쿼리문에 인자로 들어가는 user_id는 댓글을 작성한 유저이며,
      //쿼리문 안 user_id와 쿼리문 인자인 creator[0].user_id는 댓글이 달린 게시물의 작성자를 의미.
      await sql.execute(
        "INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at, is_checked) VALUES (?,?,?,?,NOW(),'N')",
        [creator[0].user_id, article_id, reaction, user_id]
      );
      logger.info(
        `file: comment.model.js, location: INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at, is_checked) VALUES (${creator[0].user_id},${article_id},${reaction},${user_id},NOW(),'N'), msg: 알림 db에 댓글 생성 정보 업데이트`
      );

      //생성된 댓글이 부모 댓글이면 게시물 작성자에게만 알람이 가면 되지만,
      //대댓글인 경우 부모 댓글 작성자에게도 알람이 가야함.
      if (group_id !== null) {
        //parent === 부모 댓글의 id와 작성자 id
        const [parent] = await sql.execute(
          "SELECT id, user_id FROM comments WHERE id = ?",
          [group_id]
        );
        logger.info(
          `file: comment.model.js, location: SELECT * FROM comments WHERE id = ${group_id}, msg: 부모 댓글의 id ${parent[0].id}, 부모 댓글의 작성자 id ${parent[0].user_id}`
        );
        //여기서 쿼리문 인자로 들어가는 user_id는 대댓글을 작성한 유저의 정보이며,
        //쿼리문 안 user_id와 쿼리문 인자인 parent[0].user_id는 대댓글이 달린 부모 댓글의 작성자를 의미.
        await sql.execute(
          "INSERT INTO notifications (user_id, comment_id, reaction, reaction_id, create_at, is_checked) VALUES (?,?,?,?,NOW(),'N')",
          [parent[0].user_id, parent[0].id, reaction, user_id]
        );
        logger.info(
          `file: comment.model.js, location: INSERT INTO notifications (user_id, comment_id, reaction, reaction_id, create_at, is_checked) VALUES (${parent[0].user_id},${parent[0].id},${reaction},${user_id},NOW(),'N'), msg: 알림 db에 댓글 생성 정보 업데이트`
        );
      } else if(group_id === null) {
        logger.info(
          `file: comment.model.js, location: else if(group_id === null), msg: 부모 댓글 없음`
        );
      }
    } catch (error) {
      logger.error(
        `file: comments.model.js, location: Comment.create(), error: ${error}`
      );
    }
  },

  //댓글 수정
  edit: async function (comment_id, content) {
    try {
      sql.execute(
        "UPDATE comments SET content = ?, edit_at = NOW() WHERE id = ?",
        [content, comment_id]
      );
    } catch (error) {
      logger.error(
        `file: comment.model.js, location: UPDATE comments SET content = ${content}, edit_at = NOW() WHERE id = ${comment_id}, error: ${error}`
      );
    }
  },

  //댓글 삭제
  delete: async function (user_id, comment_id) {
    try {
      //게시글 삭제 시, 작성한 유저와 콘텐츠 정보는 그대로 두되 생성일자 null, 삭제일자 생성
      await sql.execute(
        "UPDATE comments SET delete_at = NOW() WHERE id = ?",
        [comment_id]
      );

      const [article_id] = await sql.execute(
        "SELECT article_id FROM comments WHERE id = ? AND user_id = ?",
        [comment_id, user_id]
      );
      console.log(article_id[0].article_id);
      //게시판의 total comments 개수에 1 추가
      await sql.execute("UPDATE articles SET total_comments = total_comments - 1 WHERE id = ?", [
        article_id[0].article_id,
      ]);
      
    } catch (error) {
      logger.error(
        `file: comment.model.js, location: UPDATE comments SET delete_at = NOW() WHERE id = ${comment_id}, error: ${error}`
      );
    }
  },

  //댓글 식별 id로 댓글 정보 조회
  find_by_id: async function (comment_id) {
    try{
      const [row] = await sql.execute("SELECT * FROM comments WHERE id = ?", [
        comment_id,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT * FROM comments WHERE id = ${comment_id}, error: ${error}`
      );
    }
  },

  //게시글 식별 id로 댓글 정보 조회
  find_by_article_id: async function (article_id) {
    try{
      const [row] = await sql.execute(
        "SELECT * FROM comments WHERE article_id = ?",
        [article_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT * FROM comments WHERE article_id = ${article_id}, error: ${error}`
      );
    }
  },

  //댓글을 작성한 유저 id로 댓글 정보 조회
  find_by_user_id: async function (user_id) {
    try{
      const [row] = await sql.execute(
        "SELECT * FROM comments WHERE user_id = ?",
        [user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT * FROM comments WHERE user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //댓글 초기 화면 목록 조회
  get_comments_init: async function (article_id, limit) {
    try{
      const [row] = await sql.query(
        "SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ? AND delete_at IS NULL ORDER BY id desc LIMIT ?",
        [article_id, limit]
      );
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ${article_id} ORDER BY id desc LIMIT ${limit}, error: ${error}`
      );
    }
  },

  //댓글 다음 목록 조회
  get_comments: async function (article_id, cursor, limit) {
    try{
      const [row] = await sql.query(
        "SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ? and id < ? AND delete_at IS NULL ORDER BY id desc LIMIT ?",
        [article_id, cursor, limit]
      );
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ${article_id} and id < ${cursor} AND delete_at IS NULL ORDER BY id desc LIMIT ${limit}, error: ${error}`
      );
    }
  },

  //좋아요 첫 생성
  create_like: async function (is_liked, comment_id, user_id) {
    try{
      sql.execute(
        "INSERT INTO likes (comment_id, user_id, is_liked, create_at) VALUES (?,?,?,NOW())",
        [comment_id, user_id, is_liked]
      );
    } catch(error){
      logger.error(
        `file: comment.model.js, location: INSERT INTO likes (comment_id, user_id, is_liked, create_at) VALUES (${comment_id}, ${user_id}, ${is_liked}, NOW()), error: ${error}`
      );
    }
  },

  //좋아요 수정
  edit_like: async function (is_liked, comment_id, user_id) {
    try{
      sql.execute(
        "UPDATE likes SET is_liked = ?, create_at = NOW() WHERE comment_id = ? and user_id = ?",
        [is_liked, comment_id, user_id]
      );
    } catch(error){
      logger.error(
        `file: comment.model.js, location: UPDATE likes SET is_liked = ${is_liked}, create_at = NOW() WHERE comment_id = ${comment_id} and user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //좋아요 등록 히스토리 확인
  find_like_by_id: async function (comment_id, user_id) {
    try{
      const [row] = await sql.query(
        "SELECT * FROM likes WHERE comment_id = ? and user_id = ?",
        [comment_id, user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: comment.model.js, location: SELECT * FROM likes WHERE comment_id = ${comment_id} and user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //댓글의 총 좋아요 개수 업데이트
  update_total_likes: async function (is_liked, comment_id) {
    try{
      const origin_data = await sql.query(
        "SELECT total_likes FROM comments WHERE id = ?",
        [comment_id]
      );
      logger.info(
        `file: comment.model.js, location: SELECT total_likes FROM comments WHERE id = ${comment_id}, msg: 원래 댓글 ${comment_id} 의 총 좋아요 개수 ${origin_data[0][0].total_likes}`
      );

      let update_likes;
      if (is_liked === 1) {
        update_likes = parseInt(origin_data[0][0].total_likes) + 1;
      } else if (is_liked === 0) {
        //만약 좋아요가 -1이 될 경우 최소 숫자인 0으로 처리
        update_likes = Math.max(0, parseInt(origin_data[0][0].total_likes) - 1);
      }
      logger.info(
        `file: comment.model.js, location: update_total_likes(), msg: 업데이트 된 좋아요 숫자 ${update_likes}`
      );

      logger.info(
        `file: comment.model.js, location: UPDATE comments SET total_likes = ${update_likes} WHERE id = ${comment_id}, msg: 총 좋아요 개수 업데이트 완료`
      );
      await sql.execute("UPDATE comments SET total_likes = ? WHERE id = ?", [
        update_likes,
        comment_id,
      ]);
    } catch(error){
      logger.error(
        `file: comment.model.js, location: update_total_likes(${is_liked}, ${comment_id}), error: ${error}`
      );
    }
  },

  //댓글의 총 대댓글 개수 업데이트
  update_total_replies: async function (group_id) {
    try{
      sql.execute(
        "UPDATE comments SET total_replies = total_replies + 1 WHERE id = ?",
        [group_id]
      );
    } catch(error){
      logger.error(
        `file: comment.model.js, location: UPDATE comments SET total_replies = total_replies + 1 WHERE id = ${group_id}, error: ${error}`
      );
    }
  },
};

module.exports = Comment;
