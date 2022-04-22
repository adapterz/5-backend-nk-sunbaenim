//Controllers for users
const User = require("../models/user.model");
const bcrypt = require("bcryptjs");

//상태코드 상수화
const status_code = {
  success: 200,
  upload_success: 204,
  invalid_input: 400,
  unauthorized: 401,
  not_found_user: 404,
  already_existed_data: 409,
  unprocessable_entity: 422,
  server_error: 500,
};

// http post "users/signup" 요청 시 응답 (회원가입)
const create_account = async (req, res, next) => {
  try {
    const { email, pwd } = req.body;
    const existed_email = await User.find_by_email(email);

    //비밀번호 암호화, 암호화에 사용할 salt는 기본으로 권장되는 10번으로 설정.
    //TODO: 보안에 조금 더 신경쓴다면 salt를 따로 파일로 빼서 보안한다.
    const hash_pwd = await bcrypt.hash(pwd, 10);
    //nickname은 회원가입 페이지 바로 다음 페이지에서 받을 예정이며, DB에서는 UPDATE users SET nickname where id 명령어를 사용하여 변경해 줄 예정. " "인 이유 : not null로 DB data type 설정하였기 때문.
    const nickname = " ";
    //signup(회원가입한 날짜)
    const signup_at = new Date().toISOString().slice(0, 10).replace("T", " ");
    const signout_at = null;
    //field_id(유저 관심 카테고리) : 회원가입 시 디폴트 값으로 등록, 다음 가입 페이지에서 업데이트 될 예정.
    const field_id = 0;

    if (existed_email.length !== 0) {
      //이미 존재하는 유저가 있으므로 상태코드 409 반환
      return res.status(status_code.already_existed_data).json({
        message: "The email already in use!",
      });
    }

    //Save account in the database
    await User.create(email, hash_pwd, hash_pwd, nickname, signup_at, signout_at, field_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204
    return res.status(status_code.upload_success).json({
      message: "The user has been successfully created."
    })

  } catch (err) {
    next(err);
  }
};

// http POST "users/:user_id/nickname" 요청 시 응답 (닉네임 등록)
const create_nickname = async (req, res, next) => {
  try {
    const { user_id } = req.params;
    const { nickname } = req.body;
    const existed_nickname = await User.find_by_nickname(nickname);
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
    await User.update_nickname(nickname, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.upload_success);
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
    //FIXME: 닉네임 유효성 검사는 간단한데, 미들웨어를 별도로 두어야할지, 아니면 이렇게 직접 컨트롤러 안에 넣어도 될지 고민
    if (!field_id) return res.status(status_code.invalid_input).send("Please input field id!");

    await User.update_field_id(field_id, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.upload_success)
  } catch(err) {
    next(err);
  }
};

// POST: "/:user_id/image" 유저의 프로필 이미지 등록 요청 시 응답 (이미지 등록)
const create_profile_image = async (req, res, next) => {
  try {
    const { filename } = req.file;
    const { user_id } = req.params;
    const create_at = new Date();
    //기존에 프로필 이미지를 등록한 이력이 있는 유저인지 확인
    const find_file = await User.find_file_by_id(user_id);

    //만약 기존에 등록한 유저라면? Update file
    if(find_file.length !== 0) {
      await User.update_profile_image(user_id, filename, create_at);
      //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
      return res.status(status_code.upload_success)
    }

    //만약 처음 이미지를 등록하는 유저라면? Create file
    await User.create_profile_image(user_id, filename, create_at);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.upload_success)
  } catch(err) {
    next(err);
  }
};

// POST: "/login" 유저 로그인 요청 시 응답
const login = async (req, res, next) => {
  try{
    const { email, pwd } = req.body;
    //유저가 입력한 이메일 주소로 가입된 유저의 정보 받아오기
    const find_user = await User.find_by_email(email);

    //유저가 로그인하기 위해 입력한 email 정보가 db에 없는 경우, 401 에러 메시지 응답
    if(find_user.length === 0){
      return res.status(status_code.unauthorized).json({
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
      .send(`${find_user[0].nickname}` + " 님, 환영합니다.");
    }
    //비밀번호가 일치하지 않는 경우,409 에러 메시지 응답
    res.status(status_code.unauthorized).json({
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
    const find_user = await User.find_by_email(email);

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
    const find_user = await User.find_by_id(user_id);
    const compare_pwd = await bcrypt.compare(pwd, find_user[0].pwd);

    //회원 탈퇴한 유저의 경우 식별자 id 값을 제외하고 email, pwd, nickname은 null 처리, 탈퇴일자 업데이트 (탈퇴 일자가 필요한 정보일지? -> 나중에 유저가 재가입 시 해당 정보가 필요한지?)
    const null_email = "";
    const null_pwd = "";
    const null_nickname = "";
    const signout_at = new Date().toISOString().slice(0, 10).replace("T", " ");

    //유저가 탈퇴를 위해 입력한 비밀번호와 db 내 저장된 비밀번호가 일치하지 않는다면, 409 에러 메시지
    if(!compare_pwd) return res.status(status_code.unauthorized).send("Invalid password");

    await User.delete(null_email, null_pwd, null_nickname, signout_at, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.upload_success);
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
    const find_user = await User.find_by_id(user_id);
    //일치하는 비밀번호가 없는 경우, 409 에러 메시지 응답
    if(find_user.length === 0) return res.status(status_code.unauthorized).send("not found user");

    //일치하는 비밀번호가 있다면, 업데이트 할 예정인 비밀번호를 암호화
    const hash_pwd = await bcrypt.hash(new_pwd, 10);
    //암호화한 새 비밀번호로 db 업데이트
    await User.update_pwd(hash_pwd, user_id);
    //요청은 성공적으로 반영되었으나, 응답으로 반환해줄 콘텐츠는 없는 경우 상태코드 204 반환
    return res.status(status_code.upload_success).json({
      message: "The user pwd has been successfully updated."
    })
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
