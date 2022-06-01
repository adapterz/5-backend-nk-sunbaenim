//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const File = {
  //게시글의 파일 추가
  create_files: async function (user_id, file_name) {
    try {
      sql.execute(
        "INSERT INTO files (user_id, file_name, create_at) VALUES (?,?,NOW())",
        [user_id, file_name]
      );
    } catch (error) {
      logger.error(
        `file: file.model.js, location: INSERT INTO files (user_id, file_name, create_at) VALUES (${user_id},${file_name}, ${NOW()}), error: ${error}`
      );
    }
  },

  //유저의 프로필 이미지 등록 여부 확인
  //기존에 등록된 유저라면 db에 저장된 데이터를 업데이트 하고, 신규 유저라면 db를 새로 생성하기 위해. 계속 POST면 db에 안쓰는 데이터가 계속 쌓이지 않나요?
  find_file_by_user_id: async function (user_id) {
    try{
      const [row] = await sql.execute(
        "SELECT user_id FROM files WHERE user_id = ?",
        [user_id]
      );
      return row;
    } catch(error){
      logger.error(
        `file: file.model.js, location: SELECT user_id FROM files WHERE user_id = ${user_id}, error: ${error}`
      );
    }
  },

  //유저의 프로필 이미지 추가
  create_profile_image: async function (user_id, file_name) {
    try{
      sql.execute(
        "INSERT INTO files (user_id, file_name, create_at) VALUES (?,?,NOW())",
        [user_id, file_name]
      );
    } catch(error){
      logger.error(
        `file: file.model.js, location: INSERT INTO files (user_id, file_name, create_at) VALUES (${user_id},${file_name},${NOW()}), error: ${error}`
      );
    }
  },

  //유저의 프로필 이미지 업데이트
  update_profile_image: async function (user_id, file_name) {
    try{
      sql.execute(
        "UPDATE files SET file_name = ?, create_at = NOW() WHERE user_id = ?",
        [file_name, user_id]
      );
    } catch(error){
      logger.error(
        `file: file.model.js, location: UPDATE files SET file_name = ${file_name}, create_at = ${NOW()} WHERE user_id =${user_id}, error: ${error}`
      );
    }
  },
};

module.exports = File;
