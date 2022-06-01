//Routes for notifications
const express = require("express");
const router = express.Router();
//Controllers
const ctrl = require("../controllers/notifications.ctrl");
//Middlewares
//로그인 되어있는 유저인지 확인하는 미들웨어
const login_check = require("../middlewares/logincheck.middleware");

//알림 목록 조회
router.get("/", login_check.if_not_logged_in, ctrl.get_noti_list);

//알림 목록 조회 확인
router.get("/:id", login_check.if_not_logged_in, ctrl.check_noti_list);

module.exports = router;
