const Article = require("../models/article.model");

//상태코드 상수화
const status_code = {
  //요청 성공하고 반환해야 할 콘텐츠 있을 때
  success: 200,
  //요청 성공하고 결과로 새로운 리소스가 생성되었을 때
  created: 201,
  //요청 성공하였으나, 반환해야 할 콘텐츠가 없을 때
  update_success: 204,
  //클라이언트에서 요청을 잘못된 형식으로 했을 때
  invalid_input: 400,
  //아이디나 비밀번호를 잘못 입력했을 때
  unauthorized: 401,
  //찾고자 하는 기사가 db에 없을 때
  not_found_article: 404,
  //찾고자 하는 유저가 db에 없을 때
  not_found_user: 404,
  //이미 존재하는 데이터가 db에 있을 때
  already_existed_data: 409,
  //서버가 요청을 이해하고 요청 문법도 올바르나 요청된 지시를 따를 수 없는 상태
  unprocessable_entity: 422,
  server_error: 500,
};

//게시글 생성
//POST '/'
const create_article = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { title, content, category_id, is_published } = req.body;
    //게시글 생성 시 조회수, 좋아요수, 댓글수, 초기화
    const views = 0;
    const total_likes = 0;
    const total_comments = 0;
    //게시글 생성 날짜
    const edit_at = null;
    const delete_at = null;

    //Save article in the database
    await Article.create(
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
    );
    console.log("Article Create Success!");

    const result = await Article.find_by_user_id(user_id);
    //게시글 관련 콘텐츠가 모두 db 안에 생성되면, 201 코드와 함께 article id 반환
    return res.status(status_code.created).json(result[0].id);
  } catch (err) {
    next(err);
  }
};

//게시글 내 파일 첨부
//POST /files
const create_files = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    //게시글에 업로드된 파일들을 db에 저장
    await Promise.all(
      req.files.map((v) => Article.create_files(user_id, v.filename))
    );
    //업로드가 성공적으로 반영되었으며, 반환해야 할 콘텐츠가 없으므로 상태코드 204
    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
};

//게시글 수정
//PATCH /:article_id
const edit_article = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { title, content, category_id } = req.body;

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    const find_article = await Article.find_by_id(article_id);
    if (find_article.length === 0)
      return res
        .status(status_code.not_found_article)
        .send("Not found article");

    //Edit article in the database
    await Article.edit(article_id, title, content, category_id);
    console.log("Article Update Success!");
    //요청(게시물 수정)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
};

//게시글 삭제
//DELETE /:article_id
const delete_article = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    await Article.delete(article_id);
    console.log("Article Deleted!");
    //요청(게시물 삭제)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
};

//게시글 상세 조회
//GET /:article_id
const get_article = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    //조회하고자 하는 게시물이 db 상에 존재하는지 확인
    const find_article = await Article.find_by_id(article_id);

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    if (find_article.length === 0)
      return res
        .status(status_code.not_found_article)
        .send("Not found article");

    //만약 조회하고자 하는 게시물이 이미 삭제된 게시물이라 존재하지 않는 경우 404 리턴
    if (find_article[0].delete_at !== null)
      return res
        .status(status_code.not_found_article)
        .send("Not found article");

    //만약 게시물이 있다면, 상태코드 200과 함께 찾은 게시물 정보 리턴
    console.log("Found article : " + find_article[0].id);
    return res.status(status_code.success).json(find_article[0]);
  } catch (err) {
    next(err);
  }
};

//내 게시글 목록 조회
//GET /:user_id/:is_published/:page/:page_size
const get_my_articles = async (req, res, next) => {
  try {
    const { user_id, is_published } = req.params;
    const { page, page_size } = req.query;
  } catch (err) {
    next(err);
  }
};

//내 임시 저장글 목록 조회
//GET /:user_id/:is_published/:page/:page_size
const get_my_unpublished_articles = function (req, res) {
  //유저가 접속된 상태에서 발행된 글을 is_published를 통해 filter하도록 구현
  const is_published = parseInt(res.params.is_published, 10);

  res.json(articles.filter((article) => article.is_published === 0));
};

//게시글 목록 조회
//GET /:category_id/:page/:page_size
const get_articles = function (req, res) {
  res.status(200).end();
};

//검색시 게시글 조회
//GET /:category_id/:page/:page_size/:keyword
const query_articles = function (req, res) {
  res.status(200).end();
};

//게시글 좋아요 생성
//POST /:article_id
const create_like = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const search_like = article_likes.fillter(
    (like) => like.article_id === article_id
  );

  if (search_like[0]["is_liked"] === 0) return (search_like[0]["is_liked"] = 1);

  res.status(201).end("Success : article like changed");
};

//게시글 좋아요 삭제
//POST /:article_id
const delete_like = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const search_like = article_likes.fillter(
    (like) => like.article_id === article_id
  );

  if (search_like[0]["is_liked"] === 1) return (search_like[0]["is_liked"] = 0);

  res.status(201).end("Success : article like changed");
};

module.exports = {
  create_article,
  create_files,
  edit_article,
  delete_article,
  get_my_articles,
  get_my_unpublished_articles,
  get_article,
  get_articles,
  query_articles,
  create_like,
  delete_like,
};
