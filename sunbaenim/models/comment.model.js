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
    sql.execute(
      "INSERT INTO comments (article_id, user_id, content, create_at, class_id, orders, group_id, total_likes, total_replies) VALUES (?,?,?,?,?,?,?,?,?)",
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
  delete: async function(comment_id){
    //게시글 삭제 시, 작성한 유저와 콘텐츠 정보는 그대로 두되 생성일자 null, 삭제일자 생성
    const create_at = null;
    const delete_at = new Date();
    sql.execute("UPDATE comments SET create_at = ?, delete_at = ? WHERE id = ?", [create_at, delete_at, comment_id]);
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
};

module.exports = Comment;
