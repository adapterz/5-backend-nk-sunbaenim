//db 연결
const sql = require("../config/mysql");

const Notification = {
  //로그인한 유저 아이디를 통해 알람 db를 받아오는 메소드
  find_by_user_id: async function (user_id) {
    const [row] = await sql.execute(
      "SELECT * FROM notifications WHERE user_id = ? ORDER BY id DESC",
      [user_id]
    );
    return row;
  },

  //유저가 알람을 읽었는지 안읽었는지 상태를 db에 업데이트하는 메소드
  update_status: async function(noti_checked, id){
    const [row] = await sql.execute(
      "UPDATE notifications SET noti_checked = ? WHERE id = ?", [
        noti_checked, id
      ]
    );

    return row;
  }
};

module.exports = Notification;