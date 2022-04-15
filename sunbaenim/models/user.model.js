const res = require("express/lib/response");
//db 연결
const sql = require("../config/mysql");

//constructor 생성
const User = function (user) {
  this.email = user.email;
  this.pwd = user.pwd;
  this.pwd_check = user.pwd_check;
  this.nickname = user.nickname;
  this.signup = user.signup;
  this.signout = user.signout;
  this.field_id = user.field_id;
};

//DB에 새로운 유저의 계정 정보 저장
User.create_account = (new_user, result) => {
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
};

//신규 유저의 닉네임 정보 추가
User.create_nickname = (user_id, nickname, result) => {
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
};

User.create_profile = (user_id, new_file, result) => {
  sql.query("SELECT user_id FROM files WHERE user_id = ?", user_id, (err, rows) => {
    if(rows.length == 0) return sql.query("INSERT INTO files SET ?", new_file, (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("User profile is created");
      result(null, res);
    })

    if(rows.length !== 0) return sql.query("UPDATE files SET ? WHERE user_id = ?", 
    [new_file, user_id], (err, res) => {
      if (err) {
        console.log("error: ", err);
        result(err, null);
        return;
      }
      console.log("User nickname is updated");
      result(null, res);
    })
  })
}

module.exports = User;
