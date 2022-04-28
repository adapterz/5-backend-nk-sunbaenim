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

  //특정 유저가 발행한 게시물 전체 데이터 조회
  find_articles: async function (is_published, user_id) {
    const [row] = await sql.query(
      "SELECT * FROM articles WHERE is_published = ? and user_id = ?",
      [is_published, user_id]
    );
    return row;
  },

  //게시판 초기 화면 목록 조회
  get_articles_init: async function (limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 ORDER BY id DESC LIMIT ?",
      [limit]
    );
    return row;
  },

  //게시판 다음 목록 조회
  get_articles: async function (cursor, limit) {
    const [row] = await sql.query(
      "SELECT id, user_id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = 1 and id < ? ORDER BY id DESC LIMIT ?",
      [cursor, limit]
    );
    return row;
  },

  //요청한 페이지 사이즈에 따라 유저 발행 게시물 목록 조회
  get_my_articles: async function (is_published, user_id, offset, size) {
    const [row] = await sql.query(
      "SELECT id, title, total_likes, category, total_comments, create_at FROM articles WHERE is_published = ? and user_id = ? ORDER BY id DESC LIMIT ?, ?",
      [is_published, user_id, offset, size]
    );
    return row;
  },

  //좋아요 첫 생성
  create_like: async function(
    is_liked,
    article_id,
    user_id
  ){
    const create_at = new Date();
    //알림 db에 들어갈 리액션의 종류 == 여기서는 좋아요
    const reaction = "like";
    //좋아요 db에 좋아요를 한 유저와 게시물의 정보 생성
    await sql.execute(
      "INSERT INTO likes (article_id, user_id, is_liked, create_at) VALUES (?,?,?,?)", [
        article_id, user_id, is_liked, create_at
      ]
    );

    //아래 코드는 좋아요가 생성되었을 시, 좋아요가 적용된 게시물의 작성자에게 알림을 주기 위함
    //좋아요가 눌러진 게시물의 작성자 정보를 가져옴 == creator
    const [creator] = await sql.execute("SELECT user_id FROM articles WHERE id = ?", [
      article_id,
    ]);
    console.log("게시물 작성자의 id: " + creator);

    //알림 db에 좋아요 생성 정보 업데이트
    //여기서 쿼리문의 인자로 들어가는 user_id는 좋아요를 누른 유저의 정보이며, 쿼리문 안에 user_id와 인자인 creator는 좋아요가 눌러진 게시물의 작성자를 의미.
    //FIXME: 주석으로 설명을 보완하였으나 변수가 다소 뒤죽박죽. 수정 필요.
    await sql.execute("INSERT INTO notifications (user_id, article_id, reaction, reaction_id, create_at) VALUES (?,?,?,?,?)", [
      creator, article_id, reaction, user_id, create_at
    ])
  },

  //좋아요 수정
  edit_like: async function (is_liked, article_id, user_id) {
    //좋아요 수정 일자
    //FIXME: 좋아요 생성 일자가 필요한 데이터일까?
    const create_at = new Date();
    sql.execute(
      "UPDATE likes SET is_liked = ?, create_at = ? WHERE article_id = ? and user_id = ?",
      [is_liked, create_at, article_id, user_id]
    );
  },

  //좋아요 등록 히스토리 확인
  find_like_by_id: async function(article_id, user_id){
    const [row] = await sql.query(
      "SELECT * FROM likes WHERE article_id = ? and user_id = ?",
      [article_id, user_id]
    );
    return row;
  },

  //게시물의 총 좋아요 개수 업데이트
  update_total_likes: async function(is_liked, article_id){
    const origin_data = await sql.query("SELECT total_likes FROM articles WHERE id = ?", [article_id]);
    console.log("원래 좋아요 총 개수 : " + origin_data[0][0].total_likes);
    let update_likes;
    if(is_liked === 1){
      update_likes = parseInt(origin_data[0][0].total_likes) + 1;
    } else if(is_liked === 0){
      //만약 좋아요가 -1이 될 경우 최소 숫자인 0으로 처리
      update_likes = Math.max(0, parseInt(origin_data[0][0].total_likes) - 1);
    }
    console.log("1을 더한 좋아요 총 개수 : " + update_likes);
    sql.execute("UPDATE articles SET total_likes = ? WHERE id = ?", [update_likes, article_id]);
  },

  //게시물의 조회수 업데이트
  update_views: async function(article_id){
    const origin_data = await sql.query("SELECT views FROM articles WHERE id = ?", [article_id]);
    console.log("원래 조회수 총 개수 : " + origin_data[0][0].views);
    const update_views = origin_data[0][0].views + 1;
    console.log("1 더한 조회수 총 개수 : " + update_views);
    sql.execute("UPDATE articles SET views = ? WHERE id = ?", [update_views, article_id])
  },

  //검색어가 들어간 게시물들 찾기
  search_articles: async function(key){
    const text = "%" + key + "%";
    console.log(text);
    const [row] = await sql.query("SELECT * FROM articles WHERE is_published = 1 and title LIKE ? OR content LIKE ? ORDER BY id DESC", [text, text])
    return row;
  },
};

module.exports = Article;
