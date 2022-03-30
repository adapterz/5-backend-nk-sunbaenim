const express = require("express");
const app = express();
const bodyParser = require("body-parser");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let users = [
  {
    id: 0,
    email: "nknkcho@gmail.com",
    pwd: "PAssword1!@#",
    pwd_check: "PAssword1!@#",
    nickname: "hihi",
  },
  {
    id: 1,
    email: "srirachacho@gmail.com",
    pwd: "PAssword2!@#",
    pwd_check: "PAssword2!@#",
    nickname: "byebye",
  },
  {
    id: 2,
    email: "mizicho@gmail.com",
    pwd: "PAssword3!@#",
    pwd_check: "PAssword3!@#",
    nickname: "",
  },
];

let articles = [
  {
    article_id: 0,
    //발행된 기사의 경우 1, 발행되지 않고 임시저장된 게시물의 경우 0으로 구분
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

let comments = [
  {
    article_id: 0,
    data: {
      comment_id: 3,
      content: "댓글내용이여",
      parent_id: null,
      create_at: "2022-02-10",
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

let comment_likes = [
  {
    article_id: 0,
    user_id: 0,
    data: {
      is_liked: 1,
      create_at: "2022-01-24",
    },
  },
  {
    article_id: 1,
    user_id: 1,
    data: {
      is_liked: 1,
      create_at: "2022-01-24",
    },
  },
];

//회원가입
app.post("/users/signup", function (req, res) {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const pwd_check = req.body.pwd_check;
  //유저 아이디에 고유한 숫자 번호 부여
  const id = Date.now();
  const user = { id, email, pwd, pwd_check };
  //길이가 0을 초과하면 겹치는 이메일이 존재한다는 의미
  const is_duplicated = users.filter((user) => user.email === email).length;

  if (!email || !pwd)
    return res.status(400).send("Please enter correct information");
  if (pwd !== pwd_check) return res.status(409).send("Password is not matched");
  if (is_duplicated) return res.status(409).send("User already existed");

  users.push(user);
  res.status(201).send("Success : email, pwd");
});

//내 닉네임 등록
app.post("/users/profile/:user_id/nickname", function (req, res) {
  const nickname = req.body.nickname;
  //user_id는 문자열로 받아오기 때문에 십진법 숫자로 바꿔줍니다.
  const user_id = parseInt(req.params.user_id, 10);
  //FIXME: id를 0부터 시작하면, 배열 index값으로도 찾을 수 있지 않을까?
  const search_user = users.filter((user) => user.id === user_id);
  const is_duplicated = users.filter(
    (user) => user.nickname === nickname
  ).length;

  if (!nickname)
    return res.status(400).send("Please enter correct information");
  if (is_duplicated) return res.status(409).send("Nickname already existed");

  search_user[0]["nickname"] = nickname;
  res.status(201).send("Success : nickname");
});

//TODO: 프로필 이미지 API
//내 프로필 이미지 등록
app.post("/users/profile/:user_id/:image", function (req, res) {
  const image = req.params.image;
  const user_id = parseInt(req.params.user_id, 10);
  const search_user = users.filter((user) => user.id === user_id);

  //FIXME: 이미지 사이즈가 클 경우
  if (!image) return res.status(413).send("Image size is too big");

  search_user[0]["profile_image"] = image;
  res.status(200).send("Success : Create profile image");
});

//내 관심분야 등록
app.post("/users/profile/:user_id/fields", function (req, res) {
  const field = req.body.field_id;
  const user_id = parseInt(req.params.user_id, 10);
  const search_user = users.filter((user) => user.id === user_id);

  if (!field) return res.status(400).send("Please select your field");

  search_user[0]["field"] = field;
  res.status(201).send("Success : field");
});

//회원탈퇴
app.delete("/users/signout", function (req, res) {
  const pwd = req.body.pwd;
  const search_user = users.filter((user) => user.pwd === pwd).length;

  if (!search_user)
    return res.status(400).send("Please enter correct information");
  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  users = users.filter((user) => user.pwd !== pwd);
  res.status(204).send("Success : signout");
});

//FIXME: 로그인, 로그아웃 API
//TODO: 로그인, 로그아웃을 구현하기 위해 알아야 하는 개념 (session, async, await, mysql)
//로그인
app.post("/users/login", function (req, res) {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const search_user = users.filter((user) => user.email === email);

  if (!email || !pwd)
    return res.status(400).send("Please enter correct information");
  if (!search_user || search_user[0]["pwd"] !== pwd)
    return res.status(404).send("Not found user");

  res.status(200).send("Success : login");
});

//로그아웃
app.post("/users/logout", function (req, res) {
  const user_id = req.body.user_id;
  const search_user = users.filter((user) => user.id === user_id);

  if (search_user) return res.status(200).send("Success : logout");
});

//비밀번호 찾기
app.post("/users/pwd", function (req, res) {
  const search_user = users.filter((user) => user.email === req.body.email);

  //유저가 메일 주소를 입력하지 않았을 경우
  if (req.body.email === "") return res.status(400).send("Email required");
  //가입된 적 없는 메일 주소를 입력했을 경우
  if (!search_user) return res.status(404).send("Not found user");

  res.status(200).send("Success : Change pwd");
});

//내 닉네임 변경
app.patch("/users/:user_id/nickname", function (req, res) {
  const nickname = req.body.nickname;
  //user_id는 문자열로 받아오기 때문에 십진법 숫자로 바꿔줍니다.
  const user_id = parseInt(req.params.user_id, 10);
  const search_user = users.filter((user) => user.id === user_id);
  const is_duplicated = users.filter(
    (user) => user.nickname === nickname
  ).length;

  if (!nickname)
    return res.status(400).send("Please enter correct information");
  if (is_duplicated) return res.status(409).send("Nickname already existed");

  search_user[0]["nickname"] = nickname;
  res.status(201).send("Success : nickname changed");
});

//내 프로필 이미지 변경
app.patch("/users/:user_id/:image", function (req, res) {
  const image = req.params.image;
  const user_id = parseInt(req.params.user_id, 10);
  const search_user = users.filter((user) => user.id === user_id);

  //FIXME: 이미지 사이즈가 클 경우
  if (!image) return res.status(413).send("Image size is too big");

  search_user[0]["profile_image"] = image;
  res.status(200).send("Success : Update profile image");
});

//내 비밀번호 변경
app.patch("/users/:user_id/pwd", function (req, res) {
  const pwd = req.body.pwd;
  const new_pwd = req.body.new_pwd;
  const new_pwd_check = req.body.new_pwd_check;
  const search_pwd = users.filter((user) => user.pwd === pwd);

  //유저가 정보를 입력하지 않은 경우
  if (!pwd || !new_pwd)
    return res.status(400).send("Please enter correct information");
  //비밀번호와 비밀번호 확인이 일치하지 않은 경우
  if (new_pwd !== new_pwd_check)
    return res.status(400).send("New pwd not matched");
  //유저가 틀린 비밀번호를 입력했을 경우
  if (!search_pwd) return res.status(404).send("Wrong pwd");

  search_pwd[0]["pwd"] = new_pwd;
  //new_pwd_check를 통해 동일하게 입력되었는지 위에서 확인했으므로 같은 변수값 할당
  search_pwd[0]["pwd_check"] = new_pwd;
  res.status(200).send("Success : Change pwd");
});

//알림 목록 조회
app.get("/notifications/:user_id", function (req, res) {
  const user_id = parseInt(res.params.user_id, 10);
  const search_article = articles.filter(
    (article) => article.writer.user_id === user_id
  );
  const notifications = search_article.length;

  res.json({
    article: {
      length: data.length,
      data: [
        {
          "article-id": 20,
        },
        {
          "article-id": 25,
        },
      ],
    },
    comment: {
      length: data.length,
      data: [
        {
          "comment-id": 23,
        },
      ],
    },
  });
});

//알림 목록 조회 확인
app.get("/notifications/:user_id", function (req, res) {
  const user_id = parseInt(res.params.user_id, 10);
  const search_article = articles.filter(
    (article) => article.writer.user_id === user_id
  );
  const notifications = search_article.length;

  res.json({
    article: [
      {
        article_id: 0,
        is_published: 1,
        title: "All about express.js",
        content: "blahblah",
        category_id: 1,
        likes: 10,
        comments: 5,
      },
      {
        article_id: 1,
        is_published: 1,
        title: "All about express.js",
        content: "blahblah",
        category_id: 1,
        likes: 11,
        comments: 6,
      },
    ],
  });
});

//내 게시판 조회(내 게시글이 모인 곳)
app.get("/articles/:is_published", function (req, res) {
  //유저가 접속된 상태에서 발행된 글을 is_published를 통해 filter하도록 구현
  const is_published = parseInt(res.params.is_published, 10);

  res.json(articles.filter((article) => article.is_published === 1));
});

//내 게시글 상세 조회, 포럼 게시글 상세 조회와 동일한 api 사용
app.get("/articles/:article_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  res.json(articles.filter((article) => article.article_id === article_id));
});

//내 임시 저장 게시판 조회(내 임시저장 글이 모인 곳)
app.get("/articles/:is_published", function (req, res) {
  //유저가 접속된 상태에서 발행된 글을 is_published를 통해 filter하도록 구현
  const is_published = parseInt(res.params.is_published, 10);

  res.json(articles.filter((article) => article.is_published === 0));
});

//내 임시 저장글 상세 조회
app.get("/articles/:article_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  res.json(articles.filter((article) => article.article_id === article_id));
});

//내 댓글 조회
app.get("/comments/:comment_id", function (req, res) {
  const comment_id = parseInt(res.params.comment_id, 10);
  res.json(
    comments.filter((comment) => comment.data.comment_id === comment_id)
  );
});

//게시글 생성
app.post("/articles", function (req, res) {
  const user_id = req.body.user_id;
  //게시물 생성의 의미를 담은 숫자 1 할당
  const is_published = 1;
  //TODO: 아티클 번호 부여하는 법 생각하기
  const article_id = null;
  const title = req.body.title;
  const content = req.body.content;
  const category_id = req.body.category_id;
  //게시글 생성일자를 서버 시간으로 할당
  const create_at = new Date();
  const update_at = null;

  //TODO: 이미 로그인한 유저가 게시글을 생성하였는데, 유저 정보를 body에 담아 보내는 방법 외에 무엇이 있을지 찾아보기
  const search_user = users.filter((user) => user.id === user_id);
  const nickname = search_user[0]["nickname"];
  const profile_image = search_user[0]["profile_image"];

  const article = {
    article_id,
    is_published,
    title,
    content,
    category_id,
    create_at,
    update_at,
    writer: {
      user_id,
      nickname,
      profile_image,
    },
  };

  //제목을 입력하지 않은 경우
  if (!title) return res.status(400).send("Null title");
  //본문을 입력하지 않은 경우
  if (!content) return res.status(400).send("Null content");
  //로그인 전에 게시물 작성을 하려하는 경우
  if (!user_id) return res.status(401).send("Unauthorized User. Please Login");

  articles.push(article);
  res.status(201).send("Success: article created");
});

//게시글 임시저장
app.post("/articles", function (req, res) {
  const user_id = req.body.user_id;
  //게시물 임시저장(즉, 발행하지 않음)의 의미를 담은 숫자 0 할당
  const is_published = 0;
  const article_id = null;
  const title = req.body.title;
  const content = req.body.content;
  const category_id = req.body.category_id;
  const create_at = new Date();
  const update_at = null;

  const search_user = users.filter((user) => user.id === user_id);
  const nickname = search_user[0]["nickname"];
  const profile_image = search_user[0]["profile_image"];

  const article = {
    article_id,
    is_published,
    title,
    content,
    category_id,
    create_at,
    update_at,
    writer: {
      user_id,
      nickname,
      profile_image,
    },
  };

  if (!title) return res.status(400).send("Null title");
  if (!content) return res.status(400).send("Null content");
  if (!user_id) return res.status(401).send("Unauthorized User. Please Login");

  articles.push(article);
  res.status(201).send("Success: article created");
});

//게시글 수정
app.patch("/articles/:article_id", function (req, res) {
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
});

//게시글 삭제
app.delete("/articles/:article_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);

  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  articles = articles.filter((article) => article.article_id !== article_id);
  res.status(204).send("Success : signout");
});

//게시글 다음글 조회
app.get("/articles/:article_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  //다음 게시글 아이디이기 때문에 숫자 +1로 얻음
  const search_article = articles.filter(
    (article) => article.article_id === article_id + 1
  );

  res.json(search_article);
});

//북마크 목록 조회
//FIXME: 하나의 URL로 주제별, 좋아요 순, 게시글 생성순, 조회수 순, 댓글 순으로 구분할 수 있을까? 확인 필요.
//URL info : category_id(게시판 카테고리, 모든 카테고리일 경우 null),
//last_id(이전 응답의 마지막 article_id, 첫 요청시 null),
//size(페이지 사이즈)
app.get(
  "/bookmarks?category_id=null&last_id=null&size=10",
  function (req, res) {
    res.status(200).end();
  }
);

//북마크 목록 조회(검색 시)
//URL info : keyword(검색 키워드)
app.get(
  "/bookmarks?keyword=&category_id=null&last_id=null&size=10",
  function (req, res) {
    res.status(200).end();
  }
);

//북마크 상세 조회
app.get("/bookmarks/:bookmark_id", function (req, res) {
  const bookmark_id = parseInt(req.params.bookmark, 10);
  res.json(
    bookmarks.filter((bookmark) => bookmark.bookmark_id === bookmark_id)
  );
});

//북마크 생성
app.post("/bookmarks", function (req, res) {
  const article_id = req.body.article_id;

  bookmarks.push(
    articles.filter((article) => article.article_id === article_id)
  );

  res.status(201).send("Success : Create bookmark");
});

//저장된 북마크 삭제
app.delete("/bookmarks/:bookmark_id", function (req, res) {
  const bookmark_id = parseInt(req.params.bookmark_id, 10);

  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  bookmarks = bookmarks.filter(
    (bookmark) => bookmark.bookmark_id !== bookmark_id
  );
  res.status(204).send("Success : signout");
});

//포럼(게시판) 목록 조회
//FIXME: 아래 URL로 주제별, 좋아요 순, 게시글 생성순, 조회수 순, 댓글 순으로 구분할 수 있을까? 확인 필요.
//URL info : category_id(게시판 카테고리, 모든 카테고리일 경우 null),
//last_id(이전 응답의 마지막 article_id, 첫 요청시 null),
//size(페이지 사이즈)
app.get("/articles?category_id=null&last_id=null&size=10", function (req, res) {
  res.status(200).end();
});

//포럼(게시판) 목록 조회(검색 시)
//URL info : keyword(검색 키워드)
app.get(
  "/articles?keyword=&category_id=null&last_id=null&size=10",
  function (req, res) {
    res.status(200).end();
  }
);

//포럼(게시판) 댓글 생성
app.post("/articles/:article_id/comments", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  //FIXME: 댓글 아이디 부여하는 방법 확인 필요
  const comment_id = 0;
  const parent_id = null;
  const content = req.body.content;
  const create_at = new Date();

  const comment = {
    article_id,
    data: { comment_id, parent_id, content, create_at },
  };
  comments.push(comment);
  res.status(201).send("Success : Create comment");
});

//포럼(게시판) 대댓글 생성
app.post("/articles/:article_id/comments", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  //FIXME: 댓글 아이디 부여하는 방법 확인 필요
  const comment_id = 0;
  const parent_id = req.body.parent_id;
  const content = req.body.content;
  const create_at = new Date();

  const comment = {
    article_id,
    data: { comment_id, parent_id, content, create_at },
  };
  comments.push(comment);
  res.status(201).send("Success : Create comment");
});

//포럼(게시판) 댓글 수정
app.patch("/articles/:article_id/comments/:comment_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const comment_id = parseInt(req.params.comment_id, 10);
  const content = req.body.content;

  const search_comment = comments.filter(
    (comment) => comment.comment_id === comment_id
  );

  search_comment[0]["content"] = content;
  res.status(201).end();
});

//포럼(게시판) 댓글 삭제
app.delete("/articles/:article_id/comments/:comment_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const comment_id = parseInt(req.params.comment_id, 10);

  comments = comments.filter((comment) => comment.comment_id !== comment_id);

  res.status(204).end();
});

//포럼 게시글 댓글 목록 조회
app.get("/articles/:article_id/comments", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const articles = articles.filter(
    (article) => article.article_id === article_id
  );

  res.json(articles);
});

//게시글 좋아요 생성 및 삭제
app.post("/articles/:article_id", function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const search_like = article_likes.fillter(
    (like) => like.article_id === article_id
  );

  if (search_like[0]["is_liked"] === 0) return (search_like[0]["is_liked"] = 1);
  if (search_like[0]["is_liked"] === 1) return (search_like[0]["is_liked"] = 0);

  res.status(201).end("Success : article like changed");
});

//댓글 좋아요 생성 및 삭제
app.post("/articles/:article_id/comments/:comment_id", function (req, res) {
  const comment_id = parseInt(req.params.comment_id, 10);
  const comment_like = comment_likes.fillter(
    (like) => like.comment_id === comment_id
  );

  if (comment_like[0]["is_liked"] === 0)
    return (comment_like[0]["is_liked"] = 1);
  if (comment_like[0]["is_liked"] === 1)
    return (comment_like[0]["is_liked"] = 0);

  res.status(201).end("Success : comment like changed");
});

app.listen(8080, function () {
  console.log("listening on 8080");
});

module.exports = app;
