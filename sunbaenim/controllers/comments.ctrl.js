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
  //찾고자 하는 댓글 데이터가 db에 없을 때
  not_found_comment: 404,
  server_error: 500,
};


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
    //대댓글 생성 시 부모 댓글의 총 대댓글 개수(total_replies)에 1 추가하는 변수
    let add_reply = 0;

    //만약 클라이언트에서 POST 요청 시 group_id(부모 댓글 id)가 있다면, null에서 요청값으로 변경
    //동시에 class_id는 자식을 의미하는 1로 변경
    if ("group_id" in req.body) {
      group_id = req.body.group_id;
      class_id = 1;
      //총 대댓글 개수에 더하는 변수
      add_reply = 1;
      await Models.Comment.update_total_replies(add_reply, group_id);
    }

    //만약 클라이언트에서 POST 요청 시 orders가 있다면, 0에서 요청값으로 변경
    if ("orders" in req.body) {
      orders = req.body.orders;
    }

    //db에 새로운 댓글 데이터 생성
    await Models.Comment.create(
      article_id,
      user_id,
      content,
      class_id,
      orders,
      group_id,
      total_likes,
      total_replies
    );

    return res.status(status_code.created).send({
      message: "Comment created!"
    });
  } catch (err) {
    next(err);
  }
};

//댓글 수정
//PATCH /:comment_id
const edit_comment = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { comment_id } = req.params;
    const { content } = req.body;

    //수정하고자 하는 댓글이 존재하는지 확인 (이유? 댓글 url을 통해 접근하려고 하는 유저가 있을 수도 있기 때문)
    const find_comment = await Models.Comment.find_by_id(comment_id);

    //수정하고자 하는 게시물의 작성자가 맞는지 권한 확인
    if (find_comment[0].user_id !== user_id){
      return res.status(status_code.unauthorized).send("Not allowed user");
    }

    //유저가 찾는 댓글이 없는 경우, 404 반환
    if (find_comment.length === 0)
      return res
        .status(status_code.not_found_comment)
        .send("Not found article");

    //유저가 찾는 댓글이 있을 때, 수정 가능
    await Models.Comment.edit(comment_id, content);
    console.log("Successfully Edited");
    //수정이 반영된 이후, 반환해야 할 콘텐츠 없으므로 204
    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
};

//댓글 삭제
//DELETE /:comment_id
//실제 db 상에선 데이터를 삭제하지 않음
const delete_comment = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { comment_id } = req.params;

    //로그인한 유저가 게시물 작성자가 맞는지 권한 확인
    const find_comment = await Models.Comment.find_by_id(comment_id);
    if (find_comment[0].user_id !== user_id){
      return res.status(status_code.unauthorized).send("Not allowed user");
    }

    await Models.Comment.delete(comment_id);
    console.log("Comment deleted!")
    //요청(댓글 삭제)은 성공하였으나 반환해야 할 값이 없으므로 204 리턴
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};

//게시글 댓글 목록 조회
//cursor pagination으로 구현
//GET /:article_id?limit=&cursor=
const get_comments = async (req, res, next) => {
  try{
    const { article_id } = req.params;
    //불러올 게시물의 첫번째 인덱스, 첫화면의 경우 0(false)으로 설정
    const cursor = parseInt(req.query.cursor);
    //게시물의 인덱스로부터 몇 개의 게시물을 가져올 것인가를 결정
    const limit = parseInt(req.query.limit);

    //조회하고자 하는 댓글들
    let comments;
    if(cursor){
      //만약 cursor가 0이 아니라면 WHERE 절의 댓글 id에 삽입해하여 조회해야 할 게시물의 첫 순서를 지정
      comments = await Models.Comment.get_comments(article_id, cursor, limit + 1);
    } else {
      //만약 cursor가 0이라면 article db의 가장 마지막 id로부터 데이터 받아오기, get_comments_init에서 init은 댓글 목록의 초기 화면을 의미함
      comments = await Models.Comment.get_comments_init(article_id, limit + 1);
    }

    //limit+1과 게시물 데이터들을 담아놓은 변수의 길이가 같다면, 현재 조회한 데이터 다음에 조회할 데이터가 더 있다는 의미
    const more_comments = comments.length === limit + 1;
    //limit+1번째 데이터의 id값을 파악하기 위한 변수
    let next_cursor = null;

    if(more_comments){
      //limit+1번째에 게시물이 있다면, next_cursor에 해당 게시물 id값 넣기
      next_cursor = comments[limit].id;
      //limit+1번째 데이터는 요청한 사이즈 안에 포함된 데이터가 아니기 때문에 끝에서 제외
      comments.pop();
    }

    return res.status(status_code.success).send({
      data: comments,
      paging: {
        more_comments,
        next_cursor,
      }
    });

  } catch(err) {
    next(err)
  }
};

//댓글 좋아요 생성
//POST /:comment_id/likes
const create_comment_like = async (req, res, next) => {
  try {
    //로그인한 유저 정보 가져오기
    const { user_id } = req.session;
    //좋아요를 반영할 댓글의 식별 id 가져오기
    const { comment_id } = req.params;
    //좋아요 디폴트
    let is_liked = 0;

    //과거 해당 댓글에 유저가 좋아요를 생성한 이력이 있는지 확인
    const find_liked = await Models.Comment.find_like_by_id(comment_id, user_id);

    //만약 처음 좋아요를 누른 거라면,
    if(find_liked.length === 0) {
      //해당 댓글의 식별자 id와 유저 id를 담은 데이터를 좋아요 db에 삽입
      await Models.Comment.create_like(1, comment_id, user_id);
      //좋아요 생성 시 숫자는 0에서 1로 변경
      is_liked = 1;
      //댓글의 총 좋아요 개수에 +1
      await Models.Comment.update_total_likes(is_liked, comment_id);
      //좋아요 생성 되었다는 메시지 클라이언트에 전달
      return res.status(status_code.created).send({
        message: "Likes created!",
        is_liked: is_liked
      });
    }

    //만약 기존에 좋아요를 누른 이력이 있을 때,
    if (find_liked[0].is_liked === 0) {
      //좋아요를 취소했다가 다시 생성
      await Models.Comment.edit_like(1, comment_id, user_id);
      //좋아요 생성 시 숫자는 0에서 1로 변경
      is_liked = 1;
      //댓글의 총 좋아요 개수에 +1
      await Models.Comment.update_total_likes(is_liked, comment_id);
      //이미 좋아요한 댓글의 좋아요를 취소한다면,
    } else if (find_liked[0].is_liked === 1) {
      await Models.Comment.edit_like(0, comment_id, user_id);
      //좋아요 취소로 숫자는 1에서 0으로 변경
      is_liked = 0;
      //댓글의 총 좋아요 개수에 -1
      await Models.Comment.update_total_likes(is_liked, comment_id);
    }

    //201 상태코드, 좋아요 생성 되었다는 메시지와 좋아요 취소인지 생성인지 확인할 수 있는 데이터를 클라이언트에 전달
    return res.status(status_code.created).send({
      message: "Likes updated!",
      is_liked: is_liked
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  create_comment,
  edit_comment,
  delete_comment,
  get_comments,
  create_comment_like,
};
