//db 연결
const sql = require("../config/mysql");
const logger = require("../config/winston");

const File = {
  //게시글의 파일 추가
  create_files: async function (user_id, article_id, file_name) {
    try {
      sql.execute(
        "INSERT INTO files (user_id, article_id, file_name, create_at) VALUES (?,?,?,NOW())",
        [user_id, article_id, file_name]
      );
    } catch (error) {
      logger.error(
        `file: file.model.js, location: INSERT INTO files (user_id, article_id, file_name, create_at) VALUES (${user_id}, ${article_id}, ${file_name}, ${NOW()}), error: ${error}`
      );
    }
  },

  //유저의 프로필 이미지 등록 여부 확인
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

  get_file_by_user_id: async function (user_id) {
    try{
      const [row] = await sql.execute(
        "SELECT file_name FROM files WHERE article_id IS NULL AND user_id = ?",
        [user_id]
      );
      return row;
    } catch(error) {
      logger.error(
        `file: file.model.js, location: SELECT file_name FROM files WHERE user_id = ${user_id}, error: ${error}`
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
