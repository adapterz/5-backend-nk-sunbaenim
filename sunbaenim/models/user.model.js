//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const User = {
  //DB에 새로운 유저의 계정 정보 저장
  create: async function (email, pwd) {
    try {
      //nickname은 회원가입 페이지 바로 다음 페이지에서 업데이트 예정
      const nickname = " ";
      //회원 탈퇴한 날짜
      const signout_at = null;
      //field_id(유저 관심 카테고리) : 회원가입 시 디폴트 값으로 등록, 다음 가입 페이지에서 업데이트 될 예정
      const field_id = 0;
      await sql.execute(
        "INSERT INTO users (email, pwd, pwd_check, nickname, signup, signout, field_id) VALUES (?,?,?,?,NOW(),?,?)",
        [email, pwd, pwd, nickname, signout_at, field_id]
      );
      //생성된 유저 계정의 인덱스 값을 리턴
      const [row] = await sql.execute("SELECT id FROM users WHERE email = ?", [
        email,
      ]);
      return row;
    } catch (error) {
      logger.error(
        `file: users.model.js, location: INSERT INTO users (email, pwd, pwd, nickname, signup, signout, field_id) VALUES (${email}, ${pwd}, ${pwd}, ${nickname},NOW(), ${signout},${field_id}), error: ${error}`
      );
      logger.error(
        `file: users.model.js, location: SELECT id FROM users WHERE email = ${email}, error: ${error}`
      );
    }
  },

  //입력된 이메일을 통해 유저 이메일, 인덱스, 비밀번호 확인
  find_by_email: async function (email) {
    try{
      const [row] = await sql.execute("SELECT email, pwd, id FROM users WHERE email = ?", [
        email,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: users.model.js, location: SELECT email, pwd, id FROM users WHERE email = ${email}, error: ${error}`
      );
    }
  },

  //기존 유저들 중 중복되는 닉네임이 있는지 확인
  find_by_nickname: async function (nickname) {
    try{
      const [row] = await sql.execute(
        "SELECT nickname FROM users WHERE nickname = ?",
        [nickname]
      );
      return row;
    } catch(error){
      logger.error(
        `file: users.model.js, location: SELECT nickname FROM users WHERE nickname = ${nickname}, error: ${error}`
      );
    }
  },

  //유저 식별자인 id을 통해 유저 정보(비밀번호, 닉네임) 확인
  find_by_id: async function (user_id) {
    try{
      const [row] = await sql.execute("SELECT pwd, nickname FROM users WHERE id = ?", [
        user_id,
      ]);
      return row;
    } catch(error){
      logger.error(
        `file: users.model.js, location: SELECT pwd FROM users WHERE id = ${user_id}, error: ${error}`
      );
    }
  },


  //신규 유저의 닉네임 정보 추가
  update_nickname: async function (nickname, user_id) {
    try{
      sql.execute("UPDATE users SET nickname = ? WHERE id = ?", [
        nickname,
        user_id,
      ]);
    } catch(error){
      logger.error(
        `file: users.model.js, location: UPDATE users SET nickname = ${nickname} WHERE id = ${user_id}, error: ${error}`
      );
    }
  },

  //신규 유저의 관심 분야 정보 추가
  update_field_id: async function (field_id, user_id) {
    try{
      sql.execute("UPDATE users SET field_id = ? WHERE id = ?", [
        field_id,
        user_id,
      ]);
    } catch(error) {
      logger.error(
        `file: users.model.js, location: UPDATE users SET field_id = ${field_id} WHERE id = ${user_id}, error: ${error}`
      );
    }
  },

  //유저의 비밀번호 변경
  update_pwd: async function (new_pwd, user_id) {
    try{
      sql.execute("UPDATE users SET pwd = ?, pwd_check = ? WHERE id = ?", [
        new_pwd,
        new_pwd,
        user_id,
      ]);
    } catch(error){
      logger.error(
        `file: users.model.js, location: UPDATE users SET pwd = ${new_pwd}, pwd_check = ${new_pwd} WHERE id = ${user_id}, error: ${error}`
      );
    }
  },

  //유저 회원탈퇴 시, 유저 이메일, 비밀번호, 닉네임 정보 초기화, 회원탈퇴일자 업데이트
  delete: async function (email, pwd, nickname, user_id) {
    try{
      sql.execute(
        "UPDATE users SET email = ?, pwd = ?, nickname = ?, signout_at = NOW() WHERE id = ?",
        [email, pwd, nickname, user_id]
      );
    } catch(error){
      logger.error(
        `file: users.model.js, location: UPDATE users SET email = ${email} , pwd = ${new_pwd}, nickname = ${nickname}, signout_at = NOW() WHERE id = ${user_id}, error: ${error}`
      );
    }
  },
};

module.exports = User;
