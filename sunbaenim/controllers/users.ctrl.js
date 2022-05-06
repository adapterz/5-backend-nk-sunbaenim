//Models 상수화
const Models = require("../models/models");
const bcrypt = require("bcryptjs");

//상태코드 상수화
const status_code = {
  //요청 성공하고 반환해야 할 콘텐츠 있을 때
  success: 200,
  //요청 성공하고 결과로 새로운 리소스가 생성되었을 때
  created: 201,
  //요청 성공하였으나, 반환해야 할 콘텐츠가 없을 때
  update_success: 204,
  //클라이언트에서 요청을 잘못된 형식으로 했을 때
  invalid_input: 400,
  //아이디나 비밀번호를 잘못 입력했을 때
  unauthenticated: 401,
  //찾고자 하는 데이터가 db에 없을 때
  not_found_user: 404,
  //이미 존재하는 데이터가 db에 있을 때(중복 정보 검사)
  already_existed_data: 409,
  server_error: 500,
};

// http post "users/signup" 요청 시 응답 (회원가입)
const create_account = async (req, res, next) => {
  try {
    const { email, pwd } = req.body;
    const existed_email = await Models.User.find_by_email(email);

    //이미 존재하는 유저일 경우 굳이 패스워드를 해시하는 코드가 동작 안한다!
    if (existed_email.length !== 0) {
      //이미 존재하는 유저가 있으므로 상태코드 409 반환
      return res.status(status_code.already_existed_data).json({
        message: "The email already in use!",
      });
    }

    //비밀번호 암호화, 암호화에 사용할 salt는 기본으로 권장되는 10번으로 설정
    //TODO: bycrpt에 salt가 필요할까? 필요하지 않다면 왜 필요하지 않는지 명확한 이유 찾기
    const hash_pwd = await bcrypt.hash(pwd, 10);

    //Save account in the database
    await Models.User.create(email, hash_pwd, hash_pwd);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204
    return res.status(status_code.update_success).end();

  } catch (err) {
    next(err);
  }
};

// http POST "users/:user_id/nickname" 요청 시 응답 (닉네임 등록)
const create_nickname = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { nickname } = req.body;
    const existed_nickname = await Models.User.find_by_nickname(nickname);
    console.log(existed_nickname);

    //Validate nickname POST request
    //FIXME: 닉네임 유효성 검사는 간단한데, 미들웨어를 별도로 두어야할지, 아니면 이렇게 직접 컨트롤러 안에 넣어도 될지 고민
    if (!nickname) return res.status(status_code.invalid_input).send("Please input user nickname!");
    if (existed_nickname.length > 0) {
      //이미 존재하는 유저가 있으므로 상태코드 409 반환
      return res.status(status_code.already_existed_data).json({
        message: "The nickname already in use!",
      });
    }

    //Save nickname info in users database
    await Models.User.update_nickname(nickname, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};

// POST: "/:user_id/fields" 유저의 관심 분야 입력 요청 시 응답
// field : 유저가 선택하는 자신의 IT 분야(ex. 프론트엔드, 백엔드, 데브옵스 등등), 필드는 숫자를 통해 판별하기로 한다.
const create_field = async (req, res, next) => {
  try{
    const { user_id } = req.params;
    const { field_id } = req.body;

    //Validate field_id POST request
    //유저가 제대로 된 입력값을 넣지 않았으므로 상태코드 400 반환
    if (!field_id) return res.status(status_code.invalid_input).send("Please input field id!");

    await Models.User.update_field_id(field_id, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};

// POST: "/:user_id/image" 유저의 프로필 이미지 등록 요청 시 응답 (이미지 등록)
// PATCH: "/:user_id/image" 유저의 프로필 이미지 변경 요청 시 응답 (이미지 등록)
const create_profile_image = async (req, res, next) => {
  try {
    const { filename } = req.file;
    const { user_id } = req.params;
    const create_at = new Date();
    //기존에 프로필 이미지를 등록한 이력이 있는 유저인지 확인
    const find_file = await Models.User.find_file_by_id(user_id);

    //만약 기존에 등록한 유저라면? Update file
    if(find_file.length !== 0) {
      await Models.User.update_profile_image(user_id, filename, create_at);
      console.log("업데이트 완료");
      //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
      return res.status(status_code.update_success).end();
    }

    //만약 처음 이미지를 등록하는 유저라면? Create file
    await Models.User.create_profile_image(user_id, filename, create_at);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};

// POST: "/login" 유저 로그인 요청 시 응답
const login = async (req, res, next) => {
  try{
    const { email, pwd } = req.body;
    //유저가 입력한 이메일 주소로 가입된 유저의 정보 받아오기
    const find_user = await Models.User.find_by_email(email);

    if(find_user.length === 0){
      //유저가 로그인하기 위해 입력한 email 정보가 db에 없는 경우, 401 에러 메시지 응답
      return res.status(status_code.unauthenticated).json({
        //메시지 : 유저 정보의 보안을 위해 아이디와 비밀번호 중 오류 지점을 명확히 하지 않음.
        message: "Chekch your id or password",
      });
    }

    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);
    //비밀번호가 일치하는 경우 세션에 유저의 식별자 id 저장
    if(compare_pwd === true){
      req.session.user_id = find_user[0].id;
      return res
      .status(status_code.success)
      .send("User logged in!");
    }
    //비밀번호가 일치하지 않는 경우,409 에러 메시지 응답
    res.status(status_code.unauthenticated).json({
      message: "Chekch your id or password"
    });
  } catch(err) {
    next(err);
  }
};

//비밀번호 찾기
//FIXME: node mailer 도입하여 수정 예정
const find_pwd = async (req, res, next) => {
  try{
    const { email } = req.body;
    const find_user = await Models.User.find_by_email(email);

    //비밀번호가 일치하지 않는 경우,409 에러 메시지 응답
    if(find_user.length === 0) return res.status(status_code.not_found_user).send("Not found user");

  } catch(err) {
    next(err);
  }
};

//회원탈퇴
// PATCH /:user_id/signout
const delete_account = async (req, res, next) => {
  try{
    const { user_id } = req.params;
    const { pwd } = req.body;
    //회원 탈퇴를 위해 유저가 입력한 비밀번호와 유저의 식별자 id 값을 통해 확인한 비밀번호가 일치하는 지 확인
    const find_user = await Models.User.find_by_id(user_id);
    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);

    //회원 탈퇴한 유저의 경우 식별자 id 값을 제외하고 email, pwd, nickname은 null 처리, 탈퇴일자 업데이트 (탈퇴 일자가 필요한 정보일지? -> 나중에 유저가 재가입 시 해당 정보가 필요한지?)
    const null_email = "";
    const null_pwd = "";
    const null_nickname = "";
    const signout_at = new Date().toISOString().slice(0, 10).replace("T", " ");

    //비밀번호가 틀릴 경우, 401 에러 메시지 응답
    if(!compare_pwd) return res.status(status_code.unauthenticated).send("Invalid password");

    await Models.User.delete(null_email, null_pwd, null_nickname, signout_at, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err);
  }
};


//비밀번호 변경
//PATCH /:user_id/pwd
const edit_pwd = async (req, res, next) => {
  try{
    const { user_id } = req.params;
    const { new_pwd } = req.body;
    //비밀번호 변경을 위해 유저가 입력한 비밀번호와 db에 저장된 비밀번호와 일치하는 정보가 있는지 확인
    const find_user = await Models.User.find_by_id(user_id);
    //비밀번호가 틀릴 경우, 401 에러 메시지 응답
    if(find_user.length === 0) return res.status(status_code.unauthenticated).send("not found user");

    //일치하는 비밀번호가 있다면, 업데이트 할 예정인 비밀번호를 암호화
    const hash_pwd = await bcrypt.hash(new_pwd, 10);
    //암호화한 새 비밀번호로 db 업데이트
    await Models.User.update_pwd(hash_pwd, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.update_success).end();
  } catch(err) {
    next(err)
  }
};

module.exports = {
  create_account,
  create_nickname,
  create_profile_image,
  create_field,
  delete_account,
  login,
  find_pwd,
  edit_pwd,
};
