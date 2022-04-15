//Controllers for users
const User = require("../models/user.model");

//상태코드 상수화
const status_code = {
  server_error: 500,
  invalid_input: 400,
  forbidden: 401,
  upload_success: 201
}

// http post "users/signup" 요청 시 응답 (회원가입)
const create_account = function (req, res) {
  //Create user account
  const user = new User({
    email: req.body.email,
    pwd: req.body.pwd,
    pwd_check: req.body.pwd_check,
    //nickname은 회원가입 페이지 바로 다음 페이지에서 받을 예정이며, DB에서는 UPDATE users SET nickname where id 명령어를 사용하여 변경해 줄 예정. " "인 이유 : not null로 DB data type 설정하였기 때문.
    nickname: " ",
    //signup(회원가입한 날짜)
    signup: new Date().toISOString().slice(0, 10).replace("T", " "),
    signout: null,
    //FIXME: field_id 업데이트 코드 필요
    //field_id(유저 관심 카테고리) : 테스트를 위해 일시적으로 하드코딩. 추후 변경 필요.
    field_id: 1,
  });

  //Save account in the database
  User.create_account(user, (err, data) => {
    if (err)
    return res.status(status_code.server_error);
    res.send(data);
  });
};


// http post "users/:user_id/nickname" 요청 시 응답 (닉네임 등록)
const create_nickname = function (req, res) {
  //user_id(유저 식별자)는 문자열로 받아오기 때문에 십진법 숫자로 바꿈.
  const user_id = parseInt(req.params.user_id, 10);
  console.log(user_id);
  //Validate request
  if (!req.body.nickname)
    return res.status(status_code.invalid_input);

  //Save account in the database
  User.create_nickname(user_id, req.body.nickname, (err, data) => {
    if(err) return res.status(status_code.server_error);
    res.send(data);
  })
};

// POST: "/:user_id/image" 유저의 프로필 이미지 등록 요청 시 응답 (이미지 등록)
const create_profile_image = function (req, res) {
  const user_id = parseInt(req.params.user_id, 10);
  //새로운 파일 생성 시, 유저 식별 아이디, 파일명, 생성일자 삽입
  const new_file = {
    user_id: user_id,
    file_name : req.file.filename,
    create_at : new Date()
  }

  User.create_profile(user_id, new_file, (err, data) => {
    if(err) return res.status(status_code.invalid_input);
    res.status(status_code.upload_success).send(req.file);
  })
};

// POST: "/:user_id/fields" 유저의 관심 분야 입력 요청 시 응답
const create_field = function (req, res) {
  //필드가 어떤걸 의미하는 지 주석으로 넣으면 좋을 것 같다.
  const field = req.body.field_id;
  const user_id = parseInt(req.params.user_id, 10);
  const user_info = users.filter((user) => user.id === user_id);

  if (!field) return res.status(400).send("Please select your field");

  user_info[0]["field"] = field;
  res.status(201).send("Success : field");
};


//로그인
const login = function (req, res) {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const user_info = users.filter((user) => user.email === email);

  //0, null, undefined가 다 걸러지는지
  if (!email || !pwd)
    return res.status(400).send("Please enter correct information");
  if (!user_info || user_info[0]["pwd"] !== pwd)
    return res.status(400).send("Not found user");

  res.status(200).send("Success : login");
};


//로그아웃
const logout = function (req, res) {
  const user_id = req.body.user_id;
  const user_info = users.filter((user) => user.id === user_id);

  if (user_info) return res.status(200).send("Success : logout");
};

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
  logout,
  find_pwd,
  edit_nickname,
  edit_image,
  edit_pwd,
};
