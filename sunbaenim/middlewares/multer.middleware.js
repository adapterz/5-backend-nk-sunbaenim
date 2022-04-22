const path = require('path');
const multer = require('multer');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, './public/images/avatars');
  },
  filename: (_req, file, cb) => {
    cb(null, new Date().valueOf() + path.extname(file.originalname));
  }
})


const fileFilter = (_req, file, cb) => {
  //이미지 확장자 구분 검사
  if(file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg' || file.mimetype == 'image/png'){
    cb(null, true)
  } else {
    cb("*.jpg, *.jpeg, *.png 파일만 업로드가 가능합니다.", false)
  }
}

const upload = multer({ storage : storage, limits : {fileSize : 5 * 1024 * 1024}, fileFilter: fileFilter });

module.exports = upload;