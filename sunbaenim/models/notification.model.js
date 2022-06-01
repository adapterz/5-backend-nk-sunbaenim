//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const Notification = {
  //로그인한 유저 아이디를 통해 알람 db를 받아오는 메소드
  find_by_user_id: async function (user_id) {
    try{
      const [row] = await sql.execute(
        "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC",
        [user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: notification.model.js, location: SELECT * FROM notifications WHERE user_id = ${user_id} ORDER BY id DESC, error: ${error}`
      );
    }
  },

  find_article_by_id: async function(notification_id){
    try{
      const [row] = await sql.execute(
        "SELECT article_id FROM notifications WHERE id = ?",
        [notification_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: notification.model.js, location: SSELECT article_id FROM notifications WHERE id = ${notification_id}, error: ${error}`
      );
    }
  },

  find_comment_by_id: async function(notification_id){
    try{
      const [row] = await sql.execute(
        "SELECT comment_id FROM notifications WHERE id = ?",
        [notification_id]
      );
      const [article_id] = await sql.execute(
        "SELECT article_id FROM comments WHERE id = ?",
        [row[0].comment_id]
      )
      return article_id;
    } catch(error){
      logger.error(
        `file: notification.model.js, location: SSELECT comment_id FROM notifications WHERE id = ${notification_id}, error: ${error}`
      );
      logger.error(
        `file: notification.model.js, location: SSELECT article_id FROM comments WHERE id = ${row[0].comment_id}, error: ${error}`
      );
    }
  },

  //유저가 알람을 읽었는지 안읽었는지 상태를 db에 업데이트하는 메소드
  update_status: async function(is_checked, id){
    try{
      sql.execute(
        "UPDATE notifications SET noti_checked = ? WHERE id = ?", [
          is_checked, id
        ]
      );
    }catch(error){
      logger.error(
        `file: notification.model.js, location: UPDATE notifications SET noti_checked = ${is_checked} WHERE id = ${user_id}, error: ${error}`
      );
    }
  }
};

module.exports = Notification;