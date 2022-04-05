const res = require("express/lib/response");
//db 연결
const sql = require("../../config/mysql");

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
  sql.query(`SELECT email FROM users WHERE email = ?`, new_user.email, (err, rows) =>{
    //기존 가입 이력이 없다면? DB 생성
    if(rows.length == 0){
      sql.query(
        "INSERT INTO users SET ?", new_user,
        (err, res) => {
          if (err) {
            console.log("error: ", err);
            result(err, null);
            return;
          }
          console.log("User account is created");
          result(null, res);
        }
      );
    }
    else console.log("existed information of user: ", rows[0]);
    result(null, rows[0]);
  })
};


module.exports = User;
