//db 연결
const sql = require("../config/mysql")

//FIXME: 리팩토링 고민 필요.
const User = {
  //DB에 새로운 유저의 계정 정보 저장
  create_account: function (new_user, result) {
    //유저의 새로운 정보를 입력하기 전, 기존 가입 유저인지 email로 확인
    sql.query(
      "SELECT email FROM users WHERE email = ?",
      new_user.email,
      (err, rows) => {
        //기존 가입 이력이 없다면? DB 생성
        if (rows.length == 0) {
          return sql.query("INSERT INTO users SET ?", new_user, (err, res) => {
            if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            }
            console.log("User account is created");
            result(null, res);
          });
        }
        console.log("existed email of user: ", rows[0]);
        result(null, rows[0]);
      }
    );
  },

  //신규 유저의 닉네임 정보 추가
  create_nickname: function (user_id, nickname, result) {
    //닉네임이 기존 유저와 중복되는 지 확인
    sql.query(
      "SELECT nickname FROM users WHERE nickname = ?",
      nickname,
      (err, rows) => {
        //만약 중복되는 부분이 없다면, req.params 로 받은 id를 가진 유저의 닉네임에 추가
        if (rows.length == 0) {
          return sql.query(
            "UPDATE users SET nickname = ? WHERE id =?",
            [nickname, user_id],
            (err, res) => {
              if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
              }
              console.log("User nickname is created");
              result(null, res);
            }
          );
        }
        //만약 중복된다면 어떤 닉네임이 중복되는 지 응답
        console.log("existed nickname of user: ", rows[0]);
        result(null, rows[0]);
      }
    );
  },

  //신규 유저의 관심 분야 정보 추가
  create_field: function (user_id, field_id, result) {
    sql.query(
      "UPDATE users SET field_id = ? WHERE id = ?",
      [field_id, user_id],
      (err, res) => {
        if (err) {
          console.log("error: ", err);
          result(err, null);
          return;
        }
        console.log("User field is updated");
        result(null, res);
      }
    );
  },

  //유저의 프로필 이미지 추가
  create_profile: function (user_id, new_file, result) {
    //유저 id를 통해 기존에 프로필 이미지가 등록된 유저인지 확인
    sql.query(
      "SELECT user_id FROM files WHERE user_id = ?",
      user_id,
      (err, rows) => {
        //기존에 프로필 이미지를 등록한 적이 없는 유저라면, 새로 생성
        if (rows.length == 0)
          return sql.query("INSERT INTO files SET ?", new_file, (err, res) => {
            if (err) {
              console.log("error: ", err);
              result(err, null);
              return;
            }
            console.log("User profile is created");
            result(null, res);
          });
        //기존에 프로필 이미지를 등록했던 유저라면, 이미지 새로 갱신
        if (rows.length !== 0)
          return sql.query(
            "UPDATE files SET ? WHERE user_id = ?",
            [new_file, user_id],
            (err, res) => {
              if (err) {
                console.log("error: ", err);
                result(err, null);
                return;
              }
              console.log("User nickname is updated");
              result(null, res);
            }
          );
      }
    );
  },

  //유저 로그인
  login: function (email, result) {
    //유저가 입력한 이메일이 존재하는 지 확인
    sql.query("SELECT * FROM users WHERE email = ?", email, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      //유저가 존재한다면, 유저 정보를 담은 db row를 반환
      if (res[0]) {
        console.log("found user: " + JSON.stringify(res[0]));
        return result(null, res[0]);
      }

      //not found user with the email
      return result({ message: "not found user" }, null);
    });
  },
};

module.exports = User;
