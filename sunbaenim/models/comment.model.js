//db 연결
const sql = require("../config/mysql");

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
    group_id,
    //댓글의 총 좋아요 개수
    total_likes,
    //댓글에 달린 대댓글의 총 개수
    total_replies
  ) {
    //댓글 생성 일자
    const create_at = new Date();
    //알림 db에 들어갈 리액션의 종류 == 여기서는 댓글
    const reaction = "comment";
    //댓글 db에 댓글을 단 유저 정보와 게시물의 정보 생성
    await sql.execute(
      "INSERT INTO comments (article_id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies) VALUES (?,?,?,?,?,?,?,?,?)",
      [
        article_id,
        user_id,
        content,
        create_at,
        class_id,
        orders,
        group_id,
        total_likes,
        total_replies,
      ]
    );

    //아래 코드는 댓글 혹은 대댓글이 생성되었을 시, 적용된 게시물 또는 부모 댓글 작성자에게 알림을 주기 위함
    //댓글, 대댓글 상관 없이 일단 게시물 작성자에겐 알람이 가야함.
    //creator === 게시물 작성자의 식별 id
    const [creator] = await sql.execute(
      "SELECT user_id FROM articles WHERE id = ?",
      [article_id]
    );
    console.log("게시물 작성자의 id: " + creator[0].user_id);
    //알림 db에 댓글 생성 정보 업데이트
    //여기서 쿼리문의 인자로 들어가는 user_id는 댓글을 작성한 유저의 정보이며, 쿼리문 안에 user_id와 인자인 creator는 댓글이 달린 게시물의 작성자를 의미.
    await sql.execute(
      "INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at) VALUES (?,?,?,?,?)",
      [creator[0].user_id, article_id, reaction, user_id, create_at]
    );

    //생성된 댓글이 부모 댓글인 경우 게시물 작성자에게만 알람이 가면 되지만, 대댓글인 경우 부모 댓글 작성자에게도 알람이 가야함.
    if (group_id !== null) {
      //parent === 부모 댓글의 전체 데이터
      const [parent] = await sql.execute(
        "SELECT * FROM comments WHERE id = ?",
        [group_id]
      );
      console.log("부모 댓글 작성자 id: " + parent[0].user_id);
      console.log("부모 댓글 id: " + parent[0].id);
      //여기서 쿼리문의 인자로 들어가는 user_id는 대댓글을 작성한 유저의 정보이며, 쿼리문 안에 user_id와 인자인 parent는 대댓글이 달린 부모 댓글의 작성자를 의미.
      await sql.execute(
        "INSERT INTO notifications (user_id, comment_id, reaction, reaction_id, create_at) VALUES (?,?,?,?,?)",
        [parent[0].user_id, parent[0].id, reaction, user_id, create_at]
      );
    }
  },

  //댓글 수정
  edit: async function (comment_id, content) {
    //댓글의 수정 일자
    const edit_at = new Date();
    sql.execute("UPDATE comments SET content = ?, edit_at = ? WHERE id = ?", [
      content,
      edit_at,
      comment_id,
    ]);
  },

  //댓글 삭제
  delete: async function (comment_id) {
    //게시글 삭제 시, 작성한 유저와 콘텐츠 정보는 그대로 두되 생성일자 null, 삭제일자 생성
    const create_at = null;
    const delete_at = new Date();
    sql.execute(
      "UPDATE comments SET create_at = ?, delete_at = ? WHERE id = ?",
      [create_at, delete_at, comment_id]
    );
  },

  //댓글 식별 id로 댓글 정보 조회
  find_by_id: async function (comment_id) {
    const [row] = await sql.execute("SELECT * FROM comments WHERE id = ?", [
      comment_id,
    ]);
    return row;
  },

  //게시글 식별 id로 댓글 정보 조회
  find_by_article_id: async function (article_id) {
    const [row] = await sql.execute(
      "SELECT * FROM comments WHERE article_id = ?",
      [article_id]
    );
    return row;
  },

  //댓글을 작성한 유저 id로 댓글 정보 조회
  find_by_user_id: async function (user_id) {
    const [row] = await sql.execute(
      "SELECT * FROM comments WHERE user_id = ?",
      [user_id]
    );
    return row;
  },

  //댓글 초기 화면 목록 조회
  get_comments_init: async function (article_id, limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ? ORDER BY id desc LIMIT ?",
      [article_id, limit]
    );
    return row;
  },

  //댓글 다음 목록 조회
  get_comments: async function (article_id, cursor, limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, content, create_at, class, orders, group_id, total_likes, total_replies FROM comments WHERE article_id = ? and id < ? ORDER BY id desc LIMIT ?",
      [article_id, cursor, limit]
    );
    return row;
  },

  //좋아요 첫 생성
  create_like: async function (is_liked, comment_id, user_id) {
    const create_at = new Date();
    sql.execute(
      "INSERT INTO likes (comment_id, user_id, is_liked, create_at) VALUES (?,?,?,?)",
      [comment_id, user_id, is_liked, create_at]
    );
  },

  //좋아요 수정
  edit_like: async function (is_liked, comment_id, user_id) {
    //좋아요 수정 일자
    //FIXME: 좋아요 생성 일자가 필요한 데이터일까?
    const create_at = new Date();
    sql.execute(
      "UPDATE likes SET is_liked = ?, create_at = ? WHERE comment_id = ? and user_id = ?",
      [is_liked, create_at, comment_id, user_id]
    );
  },

  //좋아요 등록 히스토리 확인
  find_like_by_id: async function (comment_id, user_id) {
    const [row] = await sql.query(
      "SELECT * FROM likes WHERE comment_id = ? and user_id = ?",
      [comment_id, user_id]
    );
    return row;
  },

  //댓글의 총 좋아요 개수 업데이트
  update_total_likes: async function (is_liked, comment_id) {
    const origin_data = await sql.query(
      "SELECT total_likes FROM comments WHERE id = ?",
      [comment_id]
    );
    console.log(origin_data[0][0].total_likes);
    let update_likes;
    if (is_liked === 1) {
      update_likes = parseInt(origin_data[0][0].total_likes) + 1;
    } else if (is_liked === 0) {
      //만약 좋아요가 -1이 될 경우 최소 숫자인 0으로 처리
      update_likes = Math.max(0, parseInt(origin_data[0][0].total_likes) - 1);
    }
    console.log(update_likes);
    sql.execute("UPDATE comments SET total_likes = ? WHERE id = ?", [
      update_likes,
      comment_id,
    ]);
  },

  //댓글의 총 대댓글 개수 업데이트
  update_total_replies: async function (add_reply, group_id) {
    const origin_data = await sql.query(
      "SELECT total_replies FROM comments WHERE id = ?",
      [group_id]
    );
    console.log(origin_data[0][0].total_replies);
    let update_replies;
    if (add_reply === 1) {
      update_replies = parseInt(origin_data[0][0].total_replies) + 1;
    }
    console.log(update_replies);
    sql.execute("UPDATE comments SET total_replies = ? WHERE id = ?", [
      update_replies,
      group_id,
    ]);
  },
};

module.exports = Comment;
