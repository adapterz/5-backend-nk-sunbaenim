//Models 상수화
const Models = require("../models/models");
const status = require("../middlewares/error.handling/http.status.codes");
const logger = require("../config/winston");

//북마크 목록 및 검색 목록 조회
//GET url 예시 : /bookmarks?page&size&key
const get_bookmarks = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    //page, size는 양수이자 최소 1이 되어야 하기 때문에 Math.max 사용
    //page는 페이지 숫자를 의미 (1 페이지, 2 페이지 등)
    let page = Math.max(1, parseInt(req.query.page));
    //size는 한 페이지 당 보여줄 게시물의 개수를 의미
    let size = Math.max(1, parseInt(req.query.size));
    const { key } = req.query;
    //만약 정수 외의 값을 받은 경우 기본값을 설정
    page = !isNaN(page) ? page : 1;
    size = !isNaN(size) ? size : 5;

    //db 내에서 skip할 게시물의 개수를 파악
    let offset = (page - 1) * size;
    //유저가 북마크한 전체 데이터 파악
    const total_bookmarks = await Models.Bookmark.get_bookmarks(user_id);
    //요청한 페이지 사이즈에 따라 유저 발행 게시물 목록 조회
    const result = await Models.Bookmark.get_page(user_id, offset, size, key);

    //마지막 페이지의 인덱스 번호를 파악하기 위함
    const pages = Math.ceil(total_bookmarks.length / size);

    logger.info(
      `file: bookmarks.ctrl.js, location: get_bookmarks(), msg: Bookmarks found`
    );
    return res.status(status.OK).send({
      data: result,
      paging: {
        total: total_bookmarks.length,
        page: page,
        pages: pages,
        key
      },
    });
  } catch (error) {
    logger.error(
      `file: bookmsark.ctrl.js, location: get_bookmarks(), error: ${error}`
    );
    next(error);
  }
};

//북마크 상세 조회 (게시물 조회와 동일)
//GET /:bookmark_id
const get_bookmark = async (req, res, next) => {
  try {
    const { bookmark_id } = req.params;
    //북마크 식별 id를 통해 북마크 전체 데이터 찾기
    const find_bookmark = await Models.Bookmark.find_by_id(bookmark_id);
    //북마크 정보 중 게시글 식별 id 찾기
    const article_id = find_bookmark[0].article_id;

    //북마크 정보에서 찾은 게시글 식별 id를 통해 게시글 db에서 게시글 정보 찾기
    //FIXME: 여기서 게시물 정보를 리턴하는게 아니라 게시물 상세 조회 url로 리다이렉트 해주는게 맞지 않을까?
    const article_data = await Models.Article.find_by_id(article_id);
    logger.info(
      `file: bookmarks.ctrl.js, location: get_bookmark(), msg: Bookmark found`
    );
    //200 성공, 리턴값으로 article 정보 보여주기
    return res.status(status.OK).send({
      data: article_data,
    });
  } catch (error) {
    logger.error(
      `file: bookmarks.ctrl.js, location: get_bookmark(), error: ${error}`
    );
    next(error);
  }
};

//북마크 생성
//POST /
const bookmark_create = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { article_id } = req.body;

    //기존에 북마크 생성했던 게시물인지 확인
    const check_history = await Models.Bookmark.find_history(
      user_id,
      article_id
    );
    //만약 처음 생성하는 북마크라면
    if (check_history.length === 0) {
      //북마크 생성 진행
      await Models.Bookmark.create(article_id, user_id);
      logger.info(
        `file: bookmarks.ctrl.js, location: Models.Bookmark.create(${article_id}, ${user_id}), msg: Bookmark created`
      );
      return res.status(status.CREATED).send({ message: "Bookmark created!" });
    }
    //만약 이미 북마크된 게시물인데 유저가 북마크 버튼을 누른거라면, 삭제의 의미.
    await Models.Bookmark.delete(user_id, article_id);
    logger.info(
      `file: bookmarks.ctrl.js, location: Models.Bookmark.delete(${user_id}, ${article_id}), msg: Bookmark deleted`
    );
    return res.status(status.CREATED).end();
  } catch (error) {
    logger.error(
      `file: bookmarks.ctrl.js, location: bookmark_create(), error: ${error}`
    );
    next(error);
  }
};

//북마크 삭제
//DELETE /:bookmark_id
const delete_bookmark = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { bookmark_id } = req.params;
    //북마크 정보가 히스토리를 남겨야할 만큼 중요한 정보라고 판단하지 않아 아예 데이터를 삭제하도록 구현함
    await Models.Bookmark.delete(bookmark_id, user_id);
    logger.info(
      `file: bookmarks.ctrl.js, location: Models.Bookmark.delete(${bookmark_id}, ${user_id}), msg: Bookmark deleted`
    );
    //삭제 완료 후 반환할 콘텐츠 없으므로 204 상태코드
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: bookmarks.ctrl.js, location: delete_bookmark(), error: ${error}`
    );
    next(error);
  }
};

module.exports = {
  get_bookmarks,
  get_bookmark,
  bookmark_create,
  delete_bookmark,
};
