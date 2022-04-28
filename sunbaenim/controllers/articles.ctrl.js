//Models 상수화
const Models = require("../models/models");

//상태코드 상수화
const status_code = {
  //요청 성공하고 반환해야 할 콘텐츠 있을 때
  success: 200,
  //요청 성공하고 결과로 새로운 리소스가 생성되었을 때
  created: 201,
  //요청 성공하였으나, 반환해야 할 콘텐츠가 없을 때
  update_success: 204,
  //서버가 요청은 이해했지만 승인을 거부함
  unauthorized: 401,
  //찾고자 하는 기사가 db에 없을 때
  not_found_article: 404,
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
    await Models.Article.create(
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
    return res.status(status_code.created).send("Article Create Success!");
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
      req.files.map((v) => Models.Article.create_files(user_id, v.filename))
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
    const { user_id } = req.session;
    const { article_id } = req.params;
    const { title, content, category_id } = req.body;

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    const find_article = await Models.Article.find_by_id(article_id);
    if (find_article.length === 0) {
      return res
        .status(status_code.not_found_article)
        .send("Not found article!");
    }
    //수정하고자 하는 게시물의 작성자가 맞는지 권한 확인
    if (find_article[0].user_id !== user_id){
      return res.status(status_code.unauthorized).send("Not allowed user")
    }

    //Edit article in the database
    await Models.Article.edit(article_id, title, content, category_id);
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
    await Models.Article.delete(article_id);
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
    const find_article = await Models.Article.find_by_id(article_id);
    console.log(article_id);

    //수정하고자 하는 게시물이 db 상에 존재하는지 확인
    if (find_article.length === 0)
      return res
        .status(status_code.not_found_article)
        .send("Not found article~");

    //만약 조회하고자 하는 게시물이 이미 삭제된 게시물이라 존재하지 않는 경우 404 리턴
    if (find_article[0].delete_at !== null)
      return res
        .status(status_code.not_found_article)
        .send("Not found article**");

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
    }

    //만약 게시물이 있다면, 상태코드 200과 함께 찾은 게시물 정보 리턴
    return res.status(status_code.success).json(find_article[0]);
  } catch (err) {
    next(err);
  }
};

//내가 발행한 글 또는 임시 저장한 글의 목록 조회 (같은 컨트롤러로 적용 가능할 것으로 판단하여 합침)
//offset pagination으로 구현, 이유 : 유저 게시글 생성 시 데이터 변화가 많이 없을 것으로 판단. 실시간으로 유저가 여러명이 들어와서 게시판을 업데이트 하는 것이 아니고, 유저 개인의 공간이기 때문에 offset으로 구현.
//GET url 예시 : /articles?is_published=1&page=1&size=5
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

    return res.status(status_code.success).send({
      data: result,
      paging: {
        total: total_articles.length,
        page: page,
        pages: pages,
      },
    });
  } catch (err) {
    next(err);
  }
};

//게시글 목록 조회
//cursor pagination으로 구현
//GET url 예시 : /articles?limit=5&cursor=13
const get_articles = async (req, res, next) => {
  try {
    //불러올 게시물의 첫번째 인덱스, 첫화면의 경우 0(false)으로 설정
    const cursor = parseInt(req.query.cursor);
    //게시물의 인덱스로부터 몇 개의 게시물을 가져올 것인가를 결정
    const limit = parseInt(req.query.limit);

    //요청시 받아올 게시물들을 담는 변수
    let articles;

    if (cursor) {
      //만약 cursor가 0이 아니라면 cursor 값을 WHERE 절의 id에 삽입, , 이유: cursor는 조회해야 할 콘텐츠의 첫 순서를 의미하기 때문
      articles = await Models.Article.get_articles(cursor, limit + 1);
    } else {
      //만약 cursor가 0이라면 article db의 가장 마지막 id로부터 데이터 받아오기
      articles = await Models.Article.get_articles_init(limit + 1);
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

    return res.status(status_code.success).send({
      data: articles,
      paging: {
        more_articles,
        next_cursor,
      },
    });
  } catch (err) {
    next(err);
  }
};

//검색시 게시글 조회
//FIXME: 원래 라우터 엔드포인트 URL을 '/articles/search?key='형식으로 해서 req.query로 받아오려 했는데, 자꾸 게시글 상세 조회 URL로 요청이 들어가서 아래와 같이 URL을 바꾸었더니 겨우 작동되었다. 근데 아직도 왜 그렇게 되는지 이유를 모르겠다.
//GET /search/:category_id?key&limit&cursor
const query_articles = async (req, res, next) => {
  try {
    const { key } = req.query;
    console.log(req.query.key);

    //쿼리문으로 받아온 검색어 키워드를 가지고 검색 결과 값 받아오기
    const result = await Models.Article.search_articles(key);

    console.log("Search Success")
    //TODO: 검색 기능 결과 값들의 pagination 아직 안함
    return res.status(status_code.success).send({
      data: result,
      key
    })
  } catch (err) {
    next(err);
  }
};

//게시글 좋아요 생성 또는 좋아요 취소
//POST /:article_id/likes
const like_on_off = async (req, res, next) => {
  try {
    //로그인한 유저 정보 가져오기
    const { user_id } = req.session;
    //좋아요를 반영할 게시물의 식별 id 가져오기
    const { article_id } = req.params;
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
      return res.status(status_code.created).send({
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
    return res.status(status_code.created).send({
      message: "Likes updated!",
      is_liked: is_liked,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create_article,
  create_files,
  edit_article,
  delete_article,
  get_my_articles,
  get_article,
  get_articles,
  query_articles,
  like_on_off
};
