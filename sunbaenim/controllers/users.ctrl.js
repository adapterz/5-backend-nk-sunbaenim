//Models 상수화
const Models = require("../models/models");
const bcrypt = require("bcryptjs");
const status = require("../middlewares/error.handling/http.status.codes");
const logger = require("../config/winston");

// http post "users/signup" 요청 시 응답 (회원가입)
const create_account = async (req, res, next) => {
  try {
    const { email, pwd } = req.body;
    const existed_email = await Models.User.find_by_email(email);

    //이미 존재하는 유저일 경우 굳이 패스워드를 해시하는 코드가 동작 안한다!
    if (existed_email.length !== 0) {
      logger.info(
        `file: users.ctrl.js, location: Models.User.find_by_email(${email}), msg: Already Existed Email`
      );
      //이미 존재하는 유저가 있으므로 상태코드 409 반환
      return res.status(status.CONFLICT).send({
        message: "The email already in use!"
      });
    }

    //비밀번호 암호화, 암호화에 사용할 salt는 기본으로 권장되는 10번으로 설정
    //TODO: bycrpt에 salt가 필요할까? 필요하지 않다면 왜 필요하지 않는지 명확한 이유 찾기
    const hash_pwd = await bcrypt.hash(pwd, 10);

    //Save account in the database
    const result = await Models.User.create(email, hash_pwd, hash_pwd);
    logger.info(
      `file: users.ctrl.js, location: Models.User.create(), msg: User account created`
    );
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204
    return res.status(status.OK).send({ result });
  } catch (error) {
    logger.error(
      `file: users.ctrl.js, location: create_account(), error: ${error}`
    );
    next(error);
  }
};

// http POST "users/:user_id/nickname" 요청 시 응답 (닉네임 등록)
const create_nickname = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { nickname } = req.body;
    const existed_nickname = await Models.User.find_by_nickname(nickname);

    //Validate nickname POST request
    //FIXME: 닉네임 유효성 검사는 간단한데, 미들웨어를 별도로 두어야할지, 아니면 이렇게 직접 컨트롤러 안에 넣어도 될지 고민
    if (!nickname) {
      logger.info(
        `file: users.ctrl.js, location: create_nickname(), msg: Invalidate nickname`
      );
      return res
        .status(status.BAD_REQUEST)
        .send({ message: "Please input user nickname" });
    }
    if (existed_nickname.length > 0) {
      //이미 존재하는 유저가 있으므로 상태코드 409 반환
      logger.info(
        `file: users.ctrl.js, location: Models.User.find_by_nickname(${nickname}), msg: Nickname existed`
      );
      return res.status(status.CONFLICT).send({
        message: "The nickname already in use!",
      });
    }

    //Save nickname info in users database
    await Models.User.update_nickname(nickname, user_id);
    logger.info(
      `file: users.ctrl.js, location: Models.User.update_nickname(${nickname}, ${user_id}), msg: Nickname created`
    );
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: users.ctrl.js, location: create_nickname(), error: ${error}`
    );
    next(error);
  }
};

// POST: "/:user_id/fields" 유저의 관심 분야 입력 요청 시 응답
// field : 유저가 선택하는 자신의 IT 분야(ex. 프론트엔드, 백엔드, 데브옵스 등등), 필드는 숫자를 통해 판별하기로 한다.
const create_field = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { field_id } = req.body;

    //Validate field_id POST request
    //유저가 제대로 된 입력값을 넣지 않았으므로 상태코드 400 반환
    if (!field_id) {
      logger.info(
        `file: users.ctrl.js, location: create_field(), msg: Invalidate field_id`
      );
      return res
        .status(status.BAD_REQUEST)
        .send({ message: "Please input field id!" });
    }

    await Models.User.update_field_id(field_id, user_id);
    logger.info(
      `file: users.ctrl.js, location: Models.User.update_field_id(${field_id}, ${user_id}), msg: Field created`
    );
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: users.ctrl.js, location: create_field(), error: ${error}`
    );
    next(error);
  }
};

// POST: "/login" 유저 로그인 요청 시 응답
const login = async (req, res, next) => {
  try {
    const { email, pwd } = req.body;
    //유저가 입력한 이메일 주소로 가입된 유저의 정보 받아오기
    const find_user = await Models.User.find_by_email(email);

    if (find_user.length === 0) {
      logger.info(
        `file: users.ctrl.js, location: Models.User.find_by_email(${email}), msg: Invalidate Email`
      );
      //유저가 로그인하기 위해 입력한 email 정보가 db에 없는 경우, 401 에러 메시지 응답
      return res.status(status.UNAUTHORIZED).send({
        //메시지 : 유저 정보의 보안을 위해 아이디와 비밀번호 중 오류 지점을 명확히 하지 않음.
        message: "Check your id or password",
      })
    }

    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);
    //비밀번호가 일치하지 않는 경우, 401 에러 메시지 응답
    if(!compare_pwd){
      logger.info(
        `file: users.ctrl.js, location: compare_pwd, msg: Incorrect password`
      );
      res.status(status.UNAUTHORIZED).send({
        message: "Check your id or password",
      });
    }
    //비밀번호가 일치하는 경우 세션에 유저의 식별자 id 저장
    if (compare_pwd === true) {
      req.session.user_id = find_user[0].id;
      logger.info(
        `file: users.ctrl.js, location: compare_pwd, msg: Login success`
      );
      return res.status(status.OK).send({ message: "User logged in!", data: req.sessionID });
    }
  } catch (error) {
    logger.error(`file: users.ctrl.js, location: login(), error: ${error}`);
    next(error);
  }
};

//비밀번호 찾기
//FIXME: node mailer 도입하여 수정 예정
const find_pwd = async (req, res, next) => {
  try {
    const { email } = req.body;
    const find_user = await Models.User.find_by_email(email);

    //비밀번호가 일치하지 않는 경우, 401 에러 메시지 응답
    if (find_user.length === 0) {
      logger.info(
        `file: users.ctrl.js, location: Models.User.find_by_email(${email}), msg: Invalidate Email`
      );
      return res
        .status(status.UNAUTHORIZED)
        .send({ message: "Not found user" });
    }
  } catch (error) {
    logger.error(`file: users.ctrl.js, location: find_pwd(), error: ${error}`);
    next(error);
  }
};

//회원탈퇴
// PATCH /signout
const delete_account = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { pwd } = req.body;
    //회원 탈퇴한 유저의 경우 식별자 id 값을 제외하고 email, pwd, nickname은 null 처리, 탈퇴일자 업데이트
    const null_email = "";
    const null_pwd = "";
    const null_nickname = "";

    //회원 탈퇴를 위해 유저가 입력한 비밀번호와 유저의 식별자 id 값을 통해 확인한 비밀번호가 일치하는 지 확인
    const find_user = await Models.User.find_by_id(user_id);
    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);

    //비밀번호가 틀릴 경우, 401 에러 메시지 응답
    if (!compare_pwd) {
      logger.info(
        `file: users.ctrl.js, location: compare_pwd, msg: Invalidate password`
      );
      return res
        .status(status.UNAUTHORIZED)
        .send({ message: "Invalid password" });
    }

    await Models.User.delete(null_email, null_pwd, null_nickname, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    logger.info(
      `file: users.ctrl.js, location: Models.User.delete(${null_email},
        ${null_pwd},
        ${null_nickname},
        ${user_id}), msg: Signout success`
    );
    return res.status(status.NO_CONTENT).end();
  } catch (error) {
    logger.error(
      `file: users.ctrl.js, location: delete_account(), error: ${error}`
    );
    next(error);
  }
};

//비밀번호 변경
//PATCH /:user_id/pwd
const edit_pwd = async (req, res, next) => {
  try {
    const { user_id } = req.session;
    const { pwd, new_pwd } = req.body;
    //비밀번호 변경을 위해 유저가 입력한 비밀번호와 db에 저장된 비밀번호와 일치하는 정보가 있는지 확인
    const find_user = await Models.User.find_by_id(user_id);
    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);

    //비밀번호가 틀릴 경우, 401 에러 메시지 응답
    if (!compare_pwd) {
      logger.info(
        `file: users.ctrl.js, location: compare_pwd, msg: Invalidate password`
      );
      return res
        .status(status.UNAUTHORIZED)
        .send({ message: "not found user" });
    }

    //일치하는 비밀번호가 있다면, 업데이트 할 예정인 비밀번호를 암호화
    const hash_pwd = await bcrypt.hash(new_pwd, 10);
    //암호화한 새 비밀번호로 db 업데이트
    await Models.User.update_pwd(hash_pwd, user_id);
    logger.info(
      `file: users.ctrl.js, location: Models.User.update_pwd(${hash_pwd}, ${user_id}), msg: Password updated`
    );
    //요청이 성공적으로 반영되었고, 새로운 리소스가 생성되었으므로 성공 여부를 201 상태코드 반환
    return res.status(status.CREATED).send({
      message: "Password updated",
    });
  } catch (error) {
    logger.error(`file: users.ctrl.js, location: edit_pwd(), error: ${error}`);
    next(error);
  }
};

module.exports = {
  create_account,
  create_nickname,
  create_field,
  delete_account,
  login,
  find_pwd,
  edit_pwd,
};
