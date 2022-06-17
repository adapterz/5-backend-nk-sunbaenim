const path = require("path");
//Models 상수화
const Models = require("../models/models");
//상태코드 상수화
const status = require("../middlewares/error.handling/http.status.codes");
const logger = require('../config/winston');

//게시글 내 파일 첨부
//POST /
const create_files = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { article_id } = req.params;
    //게시글에 업로드된 파일들을 db에 저장
    await Promise.all(
      req.files.map((v) => Models.File.create_files(user_id, article_id, v.filename))
    );
    //업로드가 성공적으로 반영되었으며, 반환해야 할 콘텐츠가 없으므로 상태코드 204
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(`file: files.ctrl.js, location: create_files(), error: ${err}`);
    next(error);
  }
};

// POST: "/:user_id" 유저의 프로필 이미지 등록 요청 시 응답 (이미지 등록)
// PATCH: "/:user_id" 유저의 프로필 이미지 변경 요청 시 응답 (이미지 등록)
const create_profile_image = async (req, res, next) => {
  try {
    const { filename } = req.file;
    const { user_id } = req.params;
    //기존에 프로필 이미지를 등록한 이력이 있는 유저인지 확인
    //기존에 등록된 유저라면 db에 저장된 데이터를 업데이트 하고, 신규 유저라면 db를 새로 생성하기 위해. 계속 POST면 db에 안쓰는 데이터가 계속 쌓이지 않나요?
    const find_file = await Models.File.find_file_by_user_id(user_id);

    //만약 기존에 등록한 유저라면? Update file
    if(find_file.length !== 0) {
      await Models.File.update_profile_image(user_id, filename);
      logger.info(
        `file: files.ctrl.js, location: Models.File.update_profile_image(${user_id}, ${filename}), msg: User profile img updated`
      );
      //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
      return res.status(status.NO_CONTENT).end();
    }

    //만약 처음 이미지를 등록하는 유저라면? Create file
    await Models.File.create_profile_image(user_id, filename);
    logger.info(
      `file: files.ctrl.js, location: Models.File.create_profile_image(${user_id}, ${filename}), msg: User profile img updated`
    );
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status.NO_CONTENT).end();
  } catch(error) {
    logger.error(`file: files.ctrl.js, location: create_profile_image(), error: ${err}`);
    next(error);
  }
};

const get_profile_image = async (req, res, next) => {
  try{
    const { user_id } = req.session;

    const file_name = await Models.File.get_file_by_user_id(user_id);
    logger.info(
      `file: files.ctrl.js, location: Models.File.get_file_by_user_id(${user_id}), msg: Get user profile img`
    );
    if(file_name.length == 0){
      logger.info(
        `file: files.ctrl.js, location: Models.File.get_file_by_user_id(${user_id}), msg: NO user profile img`
      )
      return res.status(status.NOT_FOUND).end();
    }
    const file = file_name[0].file_name;
    return res.status(status.OK).sendFile(path.resolve('./public/images/' + file));
  } catch(error) {
    logger.error(`file: files.ctrl.js, location: get_profile_image(), error: ${err}`);
    next(error);
  }
}

const get_writer_profile_image = async (req, res, next) => {
  try{
    const { user_id } = req.params;

    const file_name = await Models.File.get_file_by_user_id(user_id);
    if(file_name.length == 0){
      logger.info(
        `file: files.ctrl.js, location: Models.File.get_file_by_user_id(${user_id}), msg: NO user profile img`
      )
      return res.status(status.NOT_FOUND).end();
    }

    logger.info(
      `file: files.ctrl.js, location: Models.File.get_file_by_user_id(${user_id}), msg: Get user profile img`
    );
    const file = file_name[0].file_name;
    return res.status(status.OK).sendFile(path.resolve('./public/images/' + file));
  } catch(error) {
    logger.error(`file: files.ctrl.js, location: get_profile_image(), error: ${err}`);
    next(error);
  }
}


module.exports = {
  create_files,
  create_profile_image,
  get_profile_image,
  get_writer_profile_image
}