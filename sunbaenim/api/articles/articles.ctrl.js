//Controllers for articles
let articles = [
  {
    article_id: 0,
    //발행된 기사의 경우 1, 발행되지 않고 임시저장된 게시물의 경우 0으로 구분한다.
    is_published: 1,
    title: "All about express.js",
    content: "blahblah",
    //카테고리는 자주 변경될 여지가 있기 때문에, 문자가 아닌 번호로 구분
    category_id: 1,
    likes: 10,
    comments: 5,
    create_at: null,
    update_at: null,
    writer: {
      user_id: 0,
      nickname: "hihi",
      profile_image: "why.jpg",
    },
  },
  {
    article_id: 1,
    is_published: 0,
    title: "All about express.js",
    content: "blahblah",
    //카테고리는 자주 변경될 여지가 있기 때문에, 문자가 아닌 번호로 구분
    category_id: 1,
    likes: 30,
    comments: 10,
    create_at: "2022-03-08",
    update_at: null,
    writer: {
      user_id: 0,
      nickname: "hihi",
      profile_image: "why.jpg",
    },
  },
];

let article_likes = [
  {
    article_id: 0,
    user_id: 0,
    data: {
      like_id: 0,
      is_liked: 1,
      create_at: "2022-01-24",
    },
  },
  {
    article_id: 1,
    user_id: 1,
    data: {
      like_id: 1,
      is_liked: 1,
      create_at: "2022-01-24",
    },
  },
];

const get_my_articles = function (req, res) {
  //유저가 접속된 상태에서 발행된 글을 is_published를 통해 filter하도록 구현
  const user_id = parseInt(res.params.user_id, 10);

  res.json(articles.filter((article) => article.user_id === user_id));
};

const get_my_unpublished_articles = function (req, res) {
  //유저가 접속된 상태에서 발행된 글을 is_published를 통해 filter하도록 구현
  const is_published = parseInt(res.params.is_published, 10);

  res.json(articles.filter((article) => article.is_published === 0));
};

const create_article = function (req, res) {
  const user_id = req.body.user_id;
  const article = {
    //TODO: 아티클 번호 부여하는 법 생각하기
    article_id: null,
    //게시물 생성의 의미를 담은 숫자 1 할당
    is_published: 1,
    title: req.body.title,
    content: req.body.content,
    category_id: req.body.category_id,
    //게시글 생성일자를 서버 시간으로 할당
    create_at: new Date(),
    update_at: null,
    writer: {
      user_id,
      nickname,
      profile_image,
    },
  };

  //TODO: 이미 로그인한 유저가 게시글을 생성하였는데, 유저 정보를 body에 담아 보내는 방법 외에 무엇이 있을지 찾아보기
  const search_user = users.filter((user) => user.id === user_id);
  const nickname = search_user[0]["nickname"];
  const profile_image = search_user[0]["profile_image"];

  //제목을 입력하지 않은 경우
  if (!title) return res.status(400).send("Null title");
  //본문을 입력하지 않은 경우
  if (!content) return res.status(400).send("Null content");
  //로그인 전에 게시물 작성을 하려하는 경우
  if (!user_id) return res.status(401).send("Unauthorized User. Please Login");

  articles.push(article);
  res.status(201).send("Success: article created");
};

const edit_article = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const title = req.body.title;
  const content = req.body.content;
  const category_id = req.body.category_id;
  //게시글 생성일자를 서버 시간으로 할당
  const update_at = new Date();

  const search_article = articles.filter(
    (article) => article.article_id === article_id
  );

  search_article[0]["title"] = title;
  search_article[0]["content"] = content;
  search_article[0]["category_id"] = category_id;
  search_article[0]["update_at"] = update_at;

  res.json(search_article);
};

const delete_article = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);

  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  articles = articles.filter((article) => article.article_id !== article_id);
  res.status(204).send("Success : signout");
};

const get_article = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  res.json(articles.filter((article) => article.article_id === article_id));
};

const get_articles = function (req, res) {
  res.status(200).end();
};

const query_articles = function (req, res) {
  res.status(200).end();
};

const create_like = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const search_like = article_likes.fillter(
    (like) => like.article_id === article_id
  );

  if (search_like[0]["is_liked"] === 0) return (search_like[0]["is_liked"] = 1);

  res.status(201).end("Success : article like changed");
};

const delete_like = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const search_like = article_likes.fillter(
    (like) => like.article_id === article_id
  );

  if (search_like[0]["is_liked"] === 1) return (search_like[0]["is_liked"] = 0);

  res.status(201).end("Success : article like changed");
};

module.exports = {
  get_my_articles,
  get_my_unpublished_articles,
  create_article,
  edit_article,
  delete_article,
  get_article,
  get_articles,
  query_articles,
  create_like,
  delete_like,
};
