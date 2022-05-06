//Models 상수화
const Models = require("../models/models");

//상태코드 상수화
const status_code = {
  //요청 성공하고 반환해야 할 콘텐츠 있을 때
  success: 200,
  //요청 성공하였으나, 반환해야 할 콘텐츠가 없을 때
  update_success: 204,
  server_error: 500,
};

//알림 목록 조회
//GET '/'
const get_noti_list = async (req, res, next) => {
  try {
    //접속한 유저의 아이디 받아오기
    const { user_id } = req.session;
    //업데이트된 소식(내가 발행한 게시물 및 댓글에 받은 반응) 목록 받아오기
    const noti_list = await Models.Notification.find_by_user_id(user_id);

    return res.status(status_code.success).send({
      data: noti_list,
    });
  } catch (err) {
    next(err);
  }
};

//알림 목록의 내용 확인
//GET '/:id'
const check_noti_list = async (req, res, next) => {
  try {
    //알람 식별 id를 파라미터로 받아옴 == 유저가 해당 알람을 클릭했다는 의미
    const { id } = req.params;
    //유저가 특정 알람을 확인했다면, 'Y'로 변경 (디폴트 : 'N')
    const noti_checked = "Y";
    //해당 알람을 확인한 사실을 db에 업데이트
    await Models.Notification.update_status(noti_checked, id);

    return res.status(status_code.update_success).end();
  } catch (err) {
    next(err);
  }
};

module.exports = {
  get_noti_list,
  check_noti_list,
};
