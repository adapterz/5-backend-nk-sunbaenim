//Controllers for users
const User = require("../models/user.model");
const bcrypt = require('bcryptjs');

//상태코드 상수화
const status_code = {
  success: 200,
  upload_success: 201,
  invalid_input: 400,
  forbidden: 401,
  not_found_user: 404,
  server_error: 500,
};

// http post "users/signup" 요청 시 응답 (회원가입)
const create_account = async function (req, res) {

  //비밀번호 암호화, 암호화에 사용할 salt는 기본으로 권장되는 10번으로 설정.
  const hash_pwd = await bcrypt.hash(req.body.pwd, 10);

  //Create user account
  const user = {
    email: req.body.email,
    pwd: hash_pwd,
    //validate.account 미들웨어로 유효성 검사를 완료한 뒤 데이터를 받기 때문에, pwd와 pwd_check는 같은 값 입력
    pwd_check: hash_pwd,
    //nickname은 회원가입 페이지 바로 다음 페이지에서 받을 예정이며, DB에서는 UPDATE users SET nickname where id 명령어를 사용하여 변경해 줄 예정. " "인 이유 : not null로 DB data type 설정하였기 때문.
    nickname: " ",
    //signup(회원가입한 날짜)
    signup: new Date().toISOString().slice(0, 10).replace("T", " "),
    signout: null,
    //field_id(유저 관심 카테고리) : 회원가입 시 디폴트 값으로 등록
    field_id: 0,
  };

  //Save account in the database
  User.create_account(user, (err, data) => {
    if (err) return res.status(status_code.server_error);
    res.send(data);
  });
};

// http post "users/:user_id/nickname" 요청 시 응답 (닉네임 등록)
const create_nickname = function (req, res) {
  //user_id(유저 식별자)는 문자열로 받아오기 때문에 십진법 숫자로 바꿈.
  const user_id = parseInt(req.params.user_id, 10);
  
  //Validate nickname POST request
  if (!req.body.nickname) return res.status(status_code.invalid_input);

  //Save nickname info in users database
  User.create_nickname(user_id, req.body.nickname, (err, data) => {
    if (err) return res.status(status_code.server_error);
    res.send(data);
  });
};

// POST: "/:user_id/fields" 유저의 관심 분야 입력 요청 시 응답
// field: 유저가 선택하는 자신의 IT 분야(ex. 프론트엔드, 백엔드, 데브옵스 등등), 필드는 숫자를 통해 판별하기로 한다.
const create_field = function (req, res) {
  const user_id = parseInt(req.params.user_id, 10);

  //Validate field POST request
  if (!req.body.field_id) return res.status(status_code.invalid_input);

  //Save field info in users database
  User.create_field(user_id, req.body.field_id, (err, data) => {
    if (err) return res.status(status_code.invalid_input);
    res.status(status_code.upload_success).send(data);
  });
};

// POST: "/:user_id/image" 유저의 프로필 이미지 등록 요청 시 응답 (이미지 등록)
const create_profile_image = function (req, res) {
  const user_id = parseInt(req.params.user_id, 10);
  //새로운 파일 생성 시, 유저 식별 아이디, 파일명, 생성일자 삽입
  const new_file = {
    user_id: user_id,
    file_name: req.file.filename,
    create_at: new Date(),
  };

  //Save file info in files database
  User.create_profile(user_id, new_file, (err) => {
    if (err) return res.status(status_code.invalid_input);
    res.status(status_code.upload_success).send(req.file);
  });
};

// POST: "/login" 유저 로그인 요청 시 응답
const login = function (req, res){
  User.login(req.body.email, (err, data) => {
    //유저가 로그인하기 위해 입력한 email 정보가 db에 없는 경우 에러 메시지 응답
    if(err) return res.status(status_code.not_found_user).send("아이디 또는 비밀번호를 확인하세요.");

    //유저가 로그인하기 위해 입력한 email 정보가 db에 있는 경우, user 정보 data로 출력
    if(data){
      const compare_pwd = async function (pwd, target){
        const match = await bcrypt.compare(pwd, target);
        if(match) {
          //비밀번호가 일치하는 경우 세션에 유저의 식별자 id 저장
          req.session.user_id = data.id;
          return res.status(status_code.success).send(`${data.nickname}` + "님 환영합니다.");
        }
        //비밀번호가 일치하지 않는 경우 에러 메시지 응답
        if(!match) return res.status(status_code.not_found_user).send("아이디 또는 비밀번호를 확인하세요.");
      }
      //유저가 로그인하기 위해 입력한 비밀번호가 db에 저장된 비밀번호와 일치하는 지 확인
      compare_pwd(req.body.pwd, data.pwd);
    }
  });
};


//비밀번호 찾기
const find_pwd = function (req, res) {
  const user_info = users.filter((user) => user.email === req.body.email);

  //유저가 메일 주소를 입력하지 않았을 경우
  if (req.body.email === "") return res.status(400).send("Email required");
  //가입된 적 없는 메일 주소를 입력했을 경우
  if (!user_info) return res.status(404).send("Not found user");

  res.status(200).send("Success : Change pwd");
};

//회원탈퇴
const delete_account = function (req, res) {
  const pwd = req.body.pwd;
  //유저가 탈퇴를 진행하기 위해 입력한 비밀번호가 가입된 유저 정보에 있는지 확인,
  //0이면 비밀번호 오류, 1이면 비밀번호 일치하여 탈퇴 프로세스 진행 가능
  const check_pwd_input = users.filter((user) => user.pwd === pwd).length;

  if (!check_pwd_input)
    //400번
    return res.status(400).send("Please enter correct information");
  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  users = users.filter((user) => user.pwd !== pwd);
  res.status(204).send("Success : signout");
};

const edit_nickname = function (req, res) {
  const nickname = req.body.nickname;
  //user_id는 문자열로 받아오기 때문에 십진법 숫자로 바꿔줍니다.
  const user_id = parseInt(req.params.user_id, 10);
  const user_info = users.filter((user) => user.id === user_id);
  const is_duplicated = users.filter(
    (user) => user.nickname === nickname
  ).length;

  if (!nickname)
    return res.status(400).send("Please enter correct information");
  if (is_duplicated) return res.status(409).send("Nickname already existed");

  user_info[0]["nickname"] = nickname;
  res.status(201).send("Success : nickname changed");
};

const edit_image = function (req, res) {
  const image = req.params.image;
  const user_id = parseInt(req.params.user_id, 10);
  const user_info = users.filter((user) => user.id === user_id);

  //FIXME: 이미지 사이즈가 클 경우
  if (!image) return res.status(413).send("Image size is too big");

  user_info[0]["profile_image"] = image;
  res.status(200).send("Success : Update profile image");
};

const edit_pwd = function (req, res) {
  const pwd = req.body.pwd;
  const new_pwd = req.body.new_pwd;
  const new_pwd_check = req.body.new_pwd_check;
  const search_pwd = users.filter((user) => user.pwd === pwd);

  //유저가 정보를 입력하지 않은 경우
  if (!pwd || !new_pwd)
    return res.status(400).send("Please enter correct information");
  //비밀번호와 비밀번호 확인이 일치하지 않은 경우
  if (new_pwd !== new_pwd_check)
    return res.status(400).send("New pwd not matched");
  //유저가 틀린 비밀번호를 입력했을 경우
  if (!search_pwd) return res.status(404).send("Wrong pwd");

  search_pwd[0]["pwd"] = new_pwd;
  //new_pwd_check를 통해 동일하게 입력되었는지 위에서 확인했으므로 같은 변수값 할당
  search_pwd[0]["pwd_check"] = new_pwd;
  res.status(200).send("Success : Change pwd");
};

module.exports = {
  create_account,
  create_nickname,
  create_profile_image,
  create_field,
  delete_account,
  login,
  find_pwd,
  edit_nickname,
  edit_image,
  edit_pwd,
};
