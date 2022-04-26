const Bookmark = require("../models/bookmark.model");
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

//북마크 목록 조회
//GET /:category_id/:last_id/:size
const get_bookmarks = async(req, res, next) => {

};

//북마크 목록 조회 (검색시)
//GET /:q/:category_id/:last_id/:size
const query_bookmarks = async(req, res, next) => {

};

//북마크 상세 조회 (게시물 조회와 동일)
//GET /:bookmark_id
const get_bookmark = async(req, res, next) => {
  try{
    const { bookmark_id } = req.params;
    //북마크 식별 id를 통해 북마크 정보 찾기
    const find_bookmark = await Bookmark.find_by_id(bookmark_id);

    //북마크 정보 중 게시글 식별 id 찾기
    const article_id = find_bookmark[0].article_id;

    //북마크 정보에서 찾은 게시글 식별 id를 통해 게시글 db에서 게시글 정보 찾기
    const article_data = await Article.find_by_id(article_id);
    
    //200 성공, 리턴값으로 article 정보 보여주기
    return res.status(status_code.success).json(article_data);
  } catch(err) {
    next(err);
  }
};

//북마크 생성
//POST /
const create_bookmark = async(req, res, next) => {
  try{
    const { user_id } = req.session;
    const { article_id } = req.body;
    await Bookmark.create(article_id, user_id);
    return res.status(status_code.created).send({message: "Bookmark created!"})
  } catch (err){
    next(err)
  }
};

//북마크 삭제
//DELETE /:bookmark_id
const delete_bookmark = async(req, res, next) => {
  try {
    const { bookmark_id } = req.params;
    //북마크 정보가 히스토리를 남겨야할 만큼 중요한 정보라고 판단하지 않아 patch보다는 delete하도록 구현함
    await Bookmark.delete(bookmark_id);
    //삭제 완료 후 반환할 콘텐츠 없으므로 204 상태코드
    return res.status(status_code.update_success).end();
  } catch(err){
    next(err)
  }
};

module.exports = {
  get_bookmarks,
  query_bookmarks,
  get_bookmark,
  create_bookmark,
  delete_bookmark
}