//db 연결
const sql = require("../config/mysql");

const User = {
  //DB에 새로운 유저의 계정 정보 저장
  create: async function (
    email,
    pwd,
    pwd_check,
  ) {
    //nickname은 회원가입 페이지 바로 다음 페이지에서 업데이트 예정
    const nickname = " ";
    //signup(회원가입한 날짜)
    const signup_at = new Date();
    //회원 탈퇴한 날짜
    const signout_at = null;
    //field_id(유저 관심 카테고리) : 회원가입 시 디폴트 값으로 등록, 다음 가입 페이지에서 업데이트 될 예정
    const field_id = 0;
    sql.execute(
      "INSERT INTO users (email, pwd, pwd_check, nickname, signup, signout, field_id) VALUES (?,?,?,?,?,?,?)",
      [email, pwd, pwd_check, nickname, signup_at, signout_at, field_id]
    );
  },

  //입력된 이메일을 통해 유저 정보 확인
  find_by_email: async function (email) {
    const [row] = await sql.execute("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return row;
  },

  //기존 유저들 중 중복되는 닉네임이 있는지 확인
  find_by_nickname: async function (nickname) {
    const [row] = await sql.execute(
      "SELECT nickname FROM users WHERE nickname = ?",
      [nickname]
    );
    return row;
  },

  //유저 식별자인 id을 통해 유저 정보 확인
  find_by_id: async function (user_id) {
    const [row] = await sql.execute("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    return row;
  },

  //신규 유저의 닉네임 정보 추가
  //FIXME: 리턴 값을 줘서 업데이트가 정말 잘 되었는지 클라이언트에게 확인 시켜주기
  update_nickname: async function (nickname, user_id) {
    sql.execute("UPDATE users SET nickname = ? WHERE id = ?", [
      nickname,
      user_id,
    ]);
  },

  //신규 유저의 관심 분야 정보 추가
  //FIXME: 리턴 값을 줘서 업데이트가 정말 잘 되었는지 클라이언트에게 확인 시켜주기
  update_field_id: async function (field_id, user_id) {
    sql.execute("UPDATE users SET field_id = ? WHERE id = ?", [
      field_id,
      user_id,
    ]);
  },

  //유저의 비밀번호 변경
  //FIXME: 리턴 값을 줘서 업데이트가 정말 잘 되었는지 클라이언트에게 확인 시켜주기
  update_pwd: async function (new_pwd, user_id) {
    sql.execute("UPDATE users SET pwd = ?, pwd_check = ? WHERE id = ?", [
      new_pwd,
      new_pwd,
      user_id,
    ]);
  },

  //유저의 프로필 이미지 등록 여부 확인
  find_file_by_id: async function (user_id) {
    const [row] = await sql.execute("SELECT * FROM files WHERE user_id = ?", [
      user_id,
    ]);
    return row;
  },

  //유저의 프로필 이미지 추가
  create_profile_image: async function (user_id, file_name, create_at) {
    sql.execute(
      "INSERT INTO files (user_id, file_name, create_at) VALUES (?,?,?)",
      [user_id, file_name, create_at]
    );
  },

  //유저의 프로필 이미지 업데이트
  update_profile_image: async function (user_id, file_name, create_at) {
    sql.execute(
      "UPDATE files SET file_name = ?, create_at = ? WHERE user_id = ?",
      [file_name, create_at, user_id]
    );
  },

  //유저 회원탈퇴 시, 유저 이메일, 비밀번호, 닉네임 정보 초기화, 회원탈퇴일자 업데이트
  delete: async function (
    email,
    pwd,
    nickname,
    signout_at,
    user_id
  ) {
    sql.execute(
      "UPDATE users SET email = ?, pwd = ?, nickname = ?, signout_at = ? WHERE id = ?",
      [email, pwd, nickname, signout_at, user_id]
    );
  },
};

module.exports = User;
