# 5-backend-nk-sunbaenim

## 📌 프로젝트명 및 제작 의도

IT인들을 위한 커뮤니티 사이트 SUNBAENIM의 백엔드 서버입니다.

### 기술 스택

Node.js, MySQL

## 📌 폴더 구조 설명

```
└── config
│  ├── mysql.js
│  └── winston.js
└── controllers
│   ├── articles.ctrl.js
│   ├── bookmarks.ctrl.js
│   ├── comments.ctrl.js
│   ├── files.ctrl.js
│   ├── notifications.ctrl.js
│   └── users.ctrl.js
└── middlewares
│   └── error.handling
│   │   └──  http.status.codes.js
│   ├── login.middleware.js (로그인 입력 값 유효성 검사 미들웨어)
│   ├── logincheck.middleware.js (인증/인가 확인 미들웨어)
│   ├── mail.js
│   ├── multer.middleware.js
│   ├── validate.account.middleware.js
│   ├── validate.article.js
│   ├── validate.comment.js
│   └── validate.pwd.js
└── models
│   ├── article.model.html
│   ├── bookmark.model.html
│   ├── comment.model.html
│   ├── file.model.html
│   ├── models.html (모든 모델 모듈화)
│   ├── notification.model.html
│   └── user.model.html
└── routers
│   ├── article.router.js
│   ├── bookmark.router.js
│   ├── comment.router.js
│   ├── file.router.js
│   ├── notification.router.js
│   └── user.router.js
├── server.js
├── package.json
└── package-lock.json
```

## 📌 프로젝트 설계도 (DB)
<img src="" width=800>

## 📌 API 구조

## 📌 문제점과 해결 방법
1. 문제점
비밀번호를 암호화하여 DB에 저장하려고 하는데, 암호화된 문자가 아닌 object Promise가 찍히는 문제
1-1. 해결 방법
비동기 처리를 하지 않아서 발생한 문제. async await 


## 📌 추후에 코드 개선할 점들
1. 로그 형식 구체화
프로젝트 중간에 깃헙 명령어를 잘못 입력하여 15일치 업데이트된 코드가 모조리 날아가는 경험을 했다. (나는 앞으로 절대 강제 명령어를 쓰지 않을 것이다) 그 때 주로 작성한 코드가 로그 구현이었는데, 마감 기한이 다가오다 보니 로그에 신경을 많이 못썼다.
2. Sequelize 도입
지금처럼 쿼리를 작성하지 않고도 객체의 메서드를 사용하는 것처럼 쿼리 로직을 작성하면 단순 쿼리를 날리는 것보단 효율적일 것 같다.
3. 미들웨어를 다양하게 적용해보기
유효성 검사 용도로만 미들웨어를 썼던 것 같다. 특히 오류 처리 관련하여 미들웨어를 도입하였다면 기존 코드가 훨씬 간결하게 보였을 것 같단 생각이 든다.
4. sql injection에 대비하기

## 📌 느낀점

1. 반복되는 코드를 어떻게 모듈화하여 깔끔하게 코드를 구현할 수 있을까 고민하고, 나름대로 적용해봄에 재미를 느꼈다.
2. 백엔드는 발생할 수 있는 모든 위험 요인과 예외를 생각해서 로직을 짜야하는 일임을 배웠다. 생각보다 매우 흔하게 해킹은 발생하며, 유저의 접근은 언제나 예측 불가능하기 때문에 백엔드 단에서 미리 대비를 하는 것이 중요하다.
3. 사실 처음에 도대체 어떻게 코드를 짜야하는 건지 감이 하나도 잡히지 않았다. 구글링을 아무리 해도 지식 개념만 나오는데, 그거 읽었다고 코드가 뚝딱 나올리 만무했다. 그래서 깃헙에 node.js, express 등을 검색해 나온 레포지토리 안의 코드들을 많이 읽었다. 그랬더니 조금씩 어떻게 코드를 짜야할 지에 대한 방향이 보였던 것 같다. 아직 한참 가야할 길이 멀지만, 코드를 짜는 것 만큼이나 많이 읽는 것도 중요함을 배웠다.
