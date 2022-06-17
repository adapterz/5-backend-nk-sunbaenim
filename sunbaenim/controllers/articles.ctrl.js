//Models 상수화
const Models = require("../models/models");
const status = require("../middlewares/error.handling/http.status.codes");
const logger = require("../config/winston");

//게시글 생성
//POST '/'
const create_article = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { title, content, category_id, is_published } = req.body;

    //  유효성 검사가 안되는 데이터들에 대한 유효성 체크
    if (!category_id || !is_published) {
      logger.error(
        `file: articles.ctrl.js, location: create_article(), msg: Invalid data.`
      );
      return res.send({
        message: "Invalid data.",
      });
    }
    //Save article in the database
    await Models.Article.create(
      user_id,
      title,
      content,
      category_id,
      is_published
    );
    logger.info(
      `file: articles.ctrl.js, location: Models.Article.create(), msg: Article Created`
    );

    const article_id = await Models.Article.find_by_title(title);
    return res.status(status.CREATED).send({ article_id: article_id });
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: create_article(), error: ${error}`
    );
    next(error);
  }
};

//게시글 수정
//PATCH /
const edit_article = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { article_id, title, content, category_id } = req.body;

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    const find_article = await Models.Article.find_by_id(article_id);
    if (find_article.length === 0) {
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.find_by_id(${article_id}), msg: Not found article`
      );
      return res.status(status.NOT_FOUND).send("Not found article");
    }
    //수정하고자 하는 게시물의 작성자가 맞는지 권한 확인
    if (find_article[0].user_id !== user_id) {
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.find_by_id(${article_id}), msg: Unauthorized data.`
      );
      return res
        .status(status.UNAUTHORIZED)
        .send({ message: "Unauthorized user" });
    }

    //Edit article in the database
    await Models.Article.edit(article_id, title, content, category_id);
    logger.info(
      `file: articles.ctrl.js, location: Models.Article.edit(${article_id}, ${title}, ${content}, ${category_id}), msg: Article edited`
    );
    //요청(게시물 수정)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: edit_article(), error: ${error}`
    );
    next(error);
  }
};

//게시글 삭제
//DELETE /
const delete_article = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { article_id } = req.params;

    //로그인한 유저가 게시물 작성자가 맞는지 권한 확인
    const find_article = await Models.Article.find_by_id(article_id);
    if (find_article[0].user_id !== user_id) {
      return res.status(status.UNAUTHORIZED).send("Not allowed user");
    }

    await Models.Article.delete(article_id);
    logger.info(
      `file: articles.ctrl.js, location: Models.Article.delete(${article_id}), msg: Article deleted`
    );
    //요청(게시물 삭제)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: delete_article(), error: ${error}`
    );
    next(error);
  }
};

//게시글 상세 조회
//GET /:article_id
const get_article = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    //조회하고자 하는 게시물이 db 상에 존재하는지 확인
    const find_article = await Models.Article.find_by_id(article_id);

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    if (find_article.length === 0) {
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.find_by_id(${article_id}), msg: Not found article(아예 DB상에 존재하지 않음)`
      );
      return res
        .status(status.NOT_FOUND)
        .send({ message: "Not found article" });
    }

    //만약 조회하고자 하는 게시물이 이미 삭제된 게시물이라 존재하지 않는 경우 404 리턴
    if (find_article[0].delete_at !== null) {
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.find_by_id(${article_id}), msg: Not found article(삭제 처리된 데이터)`
      );
      return res
        .status(status.NOT_FOUND)
        .send({ message: "Not found article" });
    }

    //상세 조회 시 게시물 조회수 +1 증가
    //쿠키 안에 클라이언트 IP와 사용자가 방문한 게시물 ID를 같이 저장해서 중복으로 조회수가 증가되는 것 방지
    if (req.cookies[article_id] == undefined) {
      //key와 value는 조회하는 게시글의 id로 설정
      //FIXME: 게시글 id 노출이 보안상의 이슈? 누군가가 악의적인 의도로 쿠키를 사용해 조회수를 조작하려 한다면?
      res.cookie(article_id, article_id, {
        //쿠키의 유효시간 10분
        maxAge: 12000,
      });
      await Models.Article.update_views(article_id);
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.update_views(${article_id}), msg: Add 1 view`
      );
    }

    //게시물 작성한 유저의 닉네임 정보 찾기
    const writer = await Models.User.find_by_id(find_article[0].user_id);
    //만약 게시물이 있다면, 상태코드 200과 함께 찾은 게시물 정보 리턴
    logger.info(
      `file: articles.ctrl.js, location: Models.Article.find_by_id(${article_id}), msg: Article found`
    );
    return res.status(status.OK).send({
      writer: writer[0].nickname,
      article: find_article[0],
    });
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: get_article(), error: ${error}`
    );
    next(error);
  }
};

//내가 발행한 글 또는 임시 저장한 글의 목록 조회 (같은 컨트롤러로 적용 가능할 것으로 판단하여 합침)
//offset pagination으로 구현, 이유 : 유저 게시글 생성 시 데이터 변화가 많이 없을 것으로 판단. 실시간으로 유저가 여러명이 들어와서 게시판을 업데이트 하는 것이 아니고, 유저 개인의 공간이기 때문에 offset으로 구현.
//GET url 예시 : /articles/1?page=1&size=5
const get_my_articles = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { is_published } = req.params;
    //page, size는 양수이자 최소 1이 되어야 하기 때문에 Math.max 사용
    //page는 페이지 숫자를 의미 (1 페이지, 2 페이지 등)
    let page = Math.max(1, parseInt(req.query.page));
    //size는 한 페이지 당 보여줄 게시물의 개수를 의미
    let size = Math.max(1, parseInt(req.query.size));
    //만약 정수 외의 값을 받은 경우 기본값을 설정
    page = !isNaN(page) ? page : 1;
    size = !isNaN(size) ? size : 5;

    //db 내에서 skip할 게시물의 개수를 파악
    let offset = (page - 1) * size;
    //게시물의 전체 데이터 파악
    const total_articles = await Models.Article.find_articles(
      is_published,
      user_id
    );
    //유저가 요청한 페이지에 넣을 게시물 데이터 추출
    const result = await Models.Article.get_my_articles(
      is_published,
      user_id,
      offset,
      size
    );

    //마지막 페이지의 인덱스 번호를 파악하기 위함
    const pages = Math.ceil(total_articles.length / size);

    logger.info(
      `file: articles.ctrl.js, location: Models.Article.get_my_articles(${is_published}, ${user_id}, ${offset}, ${size}), msg: My article list is found`
    );
    return res.status(status.OK).send({
      data: result,
      paging: {
        total: total_articles.length,
        page: page,
        pages: pages,
      },
    });
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: get_my_articles(), error: ${error}`
    );
    next(error);
  }
};

//게시글 목록 조회 + 목록 검색 조회
//infinite pagination으로 구현
//GET url 예시 : /articles?limit&cursor&key
const get_articles = async (req, res, next) => {
  try {
    // 검색어
    const { key } = req.query;
    //불러올 게시물의 첫번째 인덱스, 첫화면의 경우 0(false)으로 설정
    const cursor = parseInt(req.query.cursor);
    //게시물의 인덱스로부터 몇 개의 게시물을 가져올 것인가를 결정
    const limit = parseInt(req.query.limit);

    //요청시 받아올 게시물들을 담는 변수
    let articles;
    //첫번째 인덱스 번호 존재 유무에 따른 목록 화면 조회 방식이 다르다.
    if (cursor) {
      //만약 cursor가 0이 아니라면 cursor 값을 WHERE 절의 id에 삽입, 이유: cursor는 조회해야 할 콘텐츠의 첫 순서를 의미하기 때문
      articles = await Models.Article.get_articles(cursor, limit + 1);
    } else {
      //만약 cursor가 0이라면 article db의 가장 마지막 id로부터 데이터 받아오기
      //여기서 검색어는 cursor가 0일때, 즉 목록 초기 화면일 때만 기능한다. UI/UX 상으로 스크롤 하면서 검색 불가하기 때문.
      articles = await Models.Article.get_articles_init(limit + 1, key);
    }

    //limit+1과 게시물 데이터들을 담아놓은 변수의 길이가 같다면, 다음에 조회할 데이터가 더 있다는 의미
    const more_articles = articles.length === limit + 1;
    //limit+1번째 데이터의 id값을 파악하기 위한 변수
    let next_cursor = null;
    if (more_articles) {
      //limit+1번째에 게시물이 있다면, next_cursor에 해당 게시물 id값 넣기
      next_cursor = articles[limit].id;
      //limit+1번째 데이터는 요청 데이터가 아니기 때문에 끝에서 제외
      articles.pop();
    }

    return res.status(status.OK).send({
      data: articles,
      paging: {
        more_articles,
        next_cursor,
      },
    });
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: get_articles(), error: ${error}`
    );
    next(error);
  }
};

//게시글 좋아요 생성 또는 좋아요 취소
//POST /likes
const like_on_off = async (req, res, next) => {
  try {
    //로그인한 유저 정보 가져오기
    const { user_id } = req.session;
    //좋아요를 반영할 게시물의 식별 id 가져오기
    const { article_id } = req.body;
    //좋아요 디폴트
    let is_liked = 0;

    //과거 해당 게시물에 유저가 좋아요를 생성한 이력이 있는지 확인
    const find_liked = await Models.Article.find_like_by_id(
      article_id,
      user_id
    );

    //만약 처음 좋아요를 누른 거라면,
    if (find_liked.length === 0) {
      //해당 게시물의 식별자 id와 유저 id를 담은 데이터를 좋아요 db에 삽입
      await Models.Article.create_like(1, article_id, user_id);
      //좋아요 생성 시 숫자는 0에서 1로 변경
      is_liked = 1;
      await Models.Article.update_total_likes(is_liked, article_id);
      //좋아요 생성 되었다는 메시지 클라이언트에 전달
      return res.status(status.CREATED).send({
        message: "Likes created!",
        is_liked: is_liked,
      });
    }

    //만약 기존에 좋아요를 누른 이력이 있을 때,
    if (find_liked[0].is_liked === 0) {
      //좋아요를 취소했다가 다시 생성
      await Models.Article.edit_like(1, article_id, user_id);
      //좋아요 생성 시 숫자는 0에서 1로 변경
      is_liked = 1;
      //게시물의 총 좋아요 개수에 +1
      await Models.Article.update_total_likes(is_liked, article_id);
      //이미 좋아요한 게시물의 좋아요를 취소한다면,
    } else if (find_liked[0].is_liked === 1) {
      await Models.Article.edit_like(0, article_id, user_id);
      //좋아요 취소로 숫자는 1에서 0으로 변경
      is_liked = 0;
      //게시물의 총 좋아요 개수에 -1
      await Models.Article.update_total_likes(is_liked, article_id);
    }

    //201 상태코드, 좋아요 생성 되었다는 메시지와 좋아요 취소인지 생성인지 확인할 수 있는 데이터를 클라이언트에 전달
    return res.status(status.CREATED).send({
      message: "Likes updated!",
      is_liked: is_liked,
    });
  } catch (error) {
    logger.error(
      `file: articles.ctrl.js, location: like_on_off(), error: ${error}`
    );
    next(error);
  }
};

const like_check = async (req, res, next) => {
  try {
    //로그인한 유저 정보 가져오기
    const { user_id } = req.session;
    //좋아요를 반영할 게시물의 식별 id 가져오기
    const { article_id } = req.params;
    const result = await Models.Article.find_like_by_id(article_id, user_id);

    if(!result.length){
      logger.info(
        `file: articles.ctrl.js, location: Models.Article.find_like_by_id(${article_id}, ${user_id}), msg: No Like history`
      );
      return res.status(status.NOT_FOUND).send({
        data : false
      })
    }

    logger.info(
      `file: articles.ctrl.js, location: Models.Article.find_like_by_id(${article_id}, ${user_id}), msg: Like history is found`
    );
    return res.status(status.OK).send({
      data: result
    })
  } catch (error) {
    next(error);
  }
};

module.exports = {
  create_article,
  edit_article,
  delete_article,
  get_my_articles,
  get_article,
  get_articles,
  // query_articles,
  like_on_off,
  like_check,
};
