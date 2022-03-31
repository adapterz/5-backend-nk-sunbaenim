//Controllers for comments

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

const get_my_comments = function (req, res) {
  const comment_id = parseInt(res.params.comment_id, 10);
  res.json(
    comments.filter((comment) => comment.data.comment_id === comment_id)
  );
};

const create_comment = function (req, res) {
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
};

const reply_comment = function (req, res) {
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
};

const edit_comment = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const comment_id = parseInt(req.params.comment_id, 10);
  const content = req.body.content;

  const search_comment = comments.filter(
    (comment) => comment.comment_id === comment_id
  );

  search_comment[0]["content"] = content;
  res.status(201).end();
};

const delete_comment = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const comment_id = parseInt(req.params.comment_id, 10);

  comments = comments.filter((comment) => comment.comment_id !== comment_id);

  res.status(204).end();
};

const get_comment_list = function (req, res) {
  const article_id = parseInt(req.params.article_id, 10);
  const articles = articles.filter(
    (article) => article.article_id === article_id
  );

  res.json(articles);
};

const create_comment_like = function (req, res) {
  const comment_id = parseInt(req.params.comment_id, 10);
  const comment_like = comment_likes.fillter(
    (like) => like.comment_id === comment_id
  );

  if (comment_like[0]["is_liked"] === 0)
    return (comment_like[0]["is_liked"] = 1);

  res.status(201).end("Success : comment like changed");
};

const delete_comment_like = function (req, res) {
  const comment_id = parseInt(req.params.comment_id, 10);
  const comment_like = comment_likes.fillter(
    (like) => like.comment_id === comment_id
  );

  if (comment_like[0]["is_liked"] === 1)
    return (comment_like[0]["is_liked"] = 0);

  res.status(201).end("Success : comment like changed");
};

module.exports = {
  get_my_comments,
  create_comment,
  reply_comment,
  edit_comment,
  delete_comment,
  get_comment_list,
  create_comment_like,
  delete_comment_like,
};
