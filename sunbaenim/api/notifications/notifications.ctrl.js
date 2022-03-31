//Controllers for notifications

const get_noti_list = function (req, res) {
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
};

const check_noti_list = function (req, res) {
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
};

module.exports = {
  get_noti_list,
  check_noti_list,
};
