//Controllers for users

let users = [
  {
    id: 0,
    email: "nknkcho@gmail.com",
    pwd: "PAssword1!@#",
    pwd_check: "PAssword1!@#",
    nickname: "hihi",
  },
  {
    id: 1,
    email: "srirachacho@gmail.com",
    pwd: "PAssword2!@#",
    pwd_check: "PAssword2!@#",
    nickname: "byebye",
  },
  {
    id: 2,
    email: "mizicho@gmail.com",
    pwd: "PAssword3!@#",
    pwd_check: "PAssword3!@#",
    nickname: "",
  },
];

const signup = function (req, res) {
  const email = req.body.email;
  const pwd = req.body.pwd;
  const pwd_check = req.body.pwd_check;
  //id는 유저 식별 번호를 의미
  const id = 0;
  const user = { id, email, pwd, pwd_check };
  //is_duplicated가 0이면 이미 가입된 유저가 없다는 의미, 1이면 이미 가입된 유저가 있다는 의미
  const is_duplicated = users.filter((user) => user.email === email).length;

  //상태코드를 상수화
  if (!email) return res.status(400).send("Please enter email");
  if (!pwd) return res.status(400).send("Please enter pwd");
  if (pwd !== pwd_check) return res.status(409).send("Password is not matched");
  if (is_duplicated) return res.status(409).send("User already existed");

  users.push(user);
  res.status(201).send("Success : email, pwd");
};

const get_nickname = function (req, res) {
  const nickname = req.body.nickname;
  //user_id는 문자열로 받아오기 때문에 십진법 숫자로 바꿔줍니다.
  //user_id는 유저 식별 번호를 의미
  const user_id = parseInt(req.params.user_id, 10);
  //FIXME: id를 0부터 시작하면, 배열 index값으로도 찾을 수 있지 않을까?
  const user_info = users.filter((user) => user.id === user_id);
  const is_duplicated = users.filter(
    (user) => user.nickname === nickname
  ).length;

  if (!nickname)
    return res.status(400).send("Please enter correct information");
  if (is_duplicated) return res.status(409).send("Nickname already existed");

  user_info[0]["nickname"] = nickname;
  res.status(201).send("Success : nickname");
};

const get_image = function (req, res) {
  const image = req.params.image;
  const user_id = parseInt(req.params.user_id, 10);
  const user_info = users.filter((user) => user.id === user_id);

  //FIXME: 이미지 사이즈가 클 경우
  if (!image) return res.status(413).send("Image size is too big");

  user_info[0]["profile_image"] = image;
  res.status(200).send("Success : Create profile image");
};

const get_field = function (req, res) {
  //필드가 어떤걸 의미하는 지 주석으로 넣으면 좋을 것 같다.
  const field = req.body.field_id;
  const user_id = parseInt(req.params.user_id, 10);
  const user_info = users.filter((user) => user.id === user_id);

  if (!field) return res.status(400).send("Please select your field");

  user_info[0]["field"] = field;
  res.status(201).send("Success : field");
};

//회원탈퇴
const signout = function (req, res) {
  const pwd = req.body.pwd;
  //유저가 탈퇴를 진행하기 위해 입력한 비밀번호가 가입된 유저 정보에 있는지 확인,
  //0이면 비밀번호 오류, 1이면 비밀번호 일치하여 탈퇴 프로세스 진행 가능
  const check_pwd_input = users.filter((user) => user.pwd === pwd).length;

  if (!check_pwd_input)
    //409번? 400번?
    return res.status(400).send("Please enter correct information");
  //데이터를 아예 삭제하는 것이 아니라 filter 함수를 통해 데이터를 바꿔치기 한다.
  users = users.filter((user) => user.pwd !== pwd);
  res.status(204).send("Success : signout");
};

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

const logout = function (req, res) {
  const user_id = req.body.user_id;
  const user_info = users.filter((user) => user.id === user_id);

  if (user_info) return res.status(200).send("Success : logout");
};

const get_pwd = function (req, res) {
  const user_info = users.filter((user) => user.email === req.body.email);

  //유저가 메일 주소를 입력하지 않았을 경우
  if (req.body.email === "") return res.status(400).send("Email required");
  //가입된 적 없는 메일 주소를 입력했을 경우
  if (!user_info) return res.status(404).send("Not found user");

  res.status(200).send("Success : Change pwd");
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
  signup,
  get_nickname,
  get_image,
  get_field,
  signout,
  login,
  logout,
  get_pwd,
  edit_nickname,
  edit_image,
  edit_pwd,
};
