// Models 상수화
const Models = require("../models/models");
const logger = require("../config/winston");
const status = require("../middlewares/error.handling/http.status.codes");

// 알림 목록 조회
// GET '/'
const get_noti_list = async (req, res, next) => {
  try {
    // 접속한 유저의 아이디 받아오기
    const { user_id } = req.session;
    // 업데이트된 소식(내가 발행한 게시물 및 댓글에 받은 반응) 목록 받아오기
    const noti_list = await Models.Notification.find_by_user_id(user_id);
    logger.info(
      `file: notifications.ctrl.js, location: Models.Notification.find_by_user_id(${user_id}), msg: Notification list is accessed`
    );
    return res.status(status.OK).send({
      data: noti_list,
    });
  } catch (error) {
    logger.error(
      `file: notifications.ctrl.js, location: get_noti_list(), error: ${error}`
    );
    next(error);
  }
};

// 알림 목록의 내용 확인
// GET '/:id'
const check_noti_list = async (req, res, next) => {
  try {
    // 알람 식별 id를 파라미터로 받아옴 == 유저가 해당 알람을 클릭했다는 의미
    const { notification_id } = req.params;
    // 유저가 특정 알람을 확인했다면, 'Y'로 변경 (디폴트 : 'N')
    const is_checked = "Y";
    // 해당 알람을 확인한 사실을 db에 업데이트
    await Models.Notification.update_status(is_checked, notification_id);
    logger.info(
      `file: notifications.ctrl.js, location: Models.Notification.update_status(${is_checked}, ${notification_id}), msg: Notification list is checked`
    );

    const redirect_article = await Models.Notification.find_article_by_id(notification_id);
    const redirect_comment = await Models.Notification.find_comment_by_id(notification_id);

    // FIXME: 목록을 클릭했을 때 해당하는 링크로 연결해주어야 한다.
    if(redirect_article) {
      return res.redirect(`http://localhost:8080/articles/${redirect_article[0].article_id}`)
    }

    if(redirect_comment){
      return res.redirect(`http://localhost:8080/comments?article_id=${redirect_comment[0].article_id}`)
    }

    // return res.status(status.CREATED).end();
  } catch (error) {
    logger.error(
      `file: notifications.ctrl.js, location: check_noti_list(), error: ${error}`
    );
    next(error);
  }
};

module.exports = {
  get_noti_list,
  check_noti_list,
};
