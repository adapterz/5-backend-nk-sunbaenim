//Controllers for comments
const Comment = require("../models/comment.model");

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
  //찾고자 하는 데이터가 db에 없을 때
  not_found_comment: 404,
  //찾고자 하는 데이터가 db에 없을 때
  not_found_user: 404,
  //이미 존재하는 데이터가 db에 있을 때(중복 정보 검사)
  already_existed_data: 409,
  //서버가 요청을 이해하고 요청 문법도 올바르나 요청된 지시를 따를 수 없는 상태
  unprocessable_entity: 422,
  server_error: 500,
};

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

//댓글 생성
//POST /:article_id
const create_comment = async (req, res, next) => {
  try {
    //댓글 작성한 유저의 식별 id
    const { user_id } = req.session;
    //댓글이 작성된 게시글의 식별 id
    const { article_id } = req.params;
    //댓글 콘텐츠
    const { content } = req.body;
    //댓글 좋아요 총 개수 초기화
    const total_likes = 0;
    //대댓글 총 개수 초기화
    const total_replies = 0;

    //생성되는 댓글이 대댓글일 경우, 부모의 식별 id를 입력 (디폴트 : null)
    let group_id = null;
    //생성되는 댓글이 대댓글일 경우, 자식의 의미로 1로 표기, 부모일 경우 0 (디폴트 : 0)
    let class_id = 0;
    //생성되는 댓글이 대댓글일 경우, 대댓글의 순서를 식별하기 위함 (디폴트 : 0)
    let orders = 0;
    //만약 클라이언트에서 POST 요청 시 group_id가 있다면, null에서 요청값으로 변경
    //동시에 class_id는 자식을 의미하는 1로 변경
    if ("group_id" in req.body) {
      group_id = req.body.group_id;
      class_id = 1;
    }

    //만약 클라이언트에서 POST 요청 시 orders가 있다면, 0에서 요청값으로 변경
    if ("orders" in req.body) {
      orders = req.body.orders;
    }

    const result = await Comment.create(
      article_id,
      user_id,
      content,
      class_id,
      orders,
      group_id,
      total_likes,
      total_replies
    );

    //댓글 식별 id를 리턴
    return res.status(status_code.created).json(result[0].id);
  } catch (err) {
    next(err);
  }
};

//댓글 수정
//PATCH /:comment_id
const edit_comment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const { content } = req.body;

    //수정하고자 하는 댓글이 존재하는지 확인 (이유? 댓글 url을 통해 접근하려고 하는 유저가 있을 수도 있기 때문)
    const find_comment = await Comment.find_by_id(comment_id);
    //유저가 찾는 댓글이 없는 경우, 404 반환
    if (find_comment.length === 0)
      return res
        .status(status_code.not_found_comment)
        .send("Not found article");

    //유저가 찾는 댓글이 있을 때, 수정 가능
    await Comment.edit(comment_id, content);
    console.log("Successfully Edited");
    //수정이 반영된 이후, 반환해야 할 콘텐츠 없으므로 204
    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
  res.status(201).end();
};

//댓글 삭제
//DELETE /:comment_id
//실제 db 상에선 데이터를 삭제하지 않음
const delete_comment = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    await Comment.delete(comment_id);
    console.log("Comment deleted!")
    //요청(댓글 삭제)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};

//게시글 댓글 목록 조회
//GET /:article_id
const get_comments = async (req, res, next) => {
  try{
    const { article_id } = req.params;

    //article 식별 id와 관련된 모든 댓글 정보 가져오기
    const comments = await Comment.find_by_article_id(article_id);


  } catch(err) {
    next(err)
  }
};

//댓글 좋아요 생성
//POST /:comment_id
const create_comment_like = async (req, res) => {
  const comment_id = parseInt(req.params.comment_id, 10);
  const comment_like = comment_likes.fillter(
    (like) => like.comment_id === comment_id
  );

  if (comment_like[0]["is_liked"] === 0)
    return (comment_like[0]["is_liked"] = 1);

  res.status(201).end("Success : comment like changed");
};

//댓글 좋아요 삭제
//POST /:comment_id
const delete_comment_like = async (req, res) => {
  const comment_id = parseInt(req.params.comment_id, 10);
  const comment_like = comment_likes.fillter(
    (like) => like.comment_id === comment_id
  );

  if (comment_like[0]["is_liked"] === 1)
    return (comment_like[0]["is_liked"] = 0);

  res.status(201).end("Success : comment like changed");
};

module.exports = {
  create_comment,
  edit_comment,
  delete_comment,
  get_comments,
  create_comment_like,
  delete_comment_like,
};
