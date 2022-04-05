//Routes for notifications
const express = require("express");
const router = express.Router();
const ctrl = require("./notifications.ctrl");

//알림 목록 조회
router.get("/:user_id", ctrl.get_noti_list);

//알림 목록 조회 확인
router.get("/:user_id", ctrl.check_noti_list);

module.exports = router;
