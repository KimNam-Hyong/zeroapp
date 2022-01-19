const express = require("express"); //익스프레스 모듈 가져오기
const morgan = require("morgan"); //로그를 기록하기 위한 모듈
const cookieParser = require("cookie-parser"); //쿠키를 굽는 모듈
const session = require("express-session"); //세션 인식 모듈
const dotenv = require("dotenv"); //키값을 지정하는 모듈
const path = require("path"); //경로 모듈 가져오기
const multer = require("multer");
const fs = require("fs");
const nunjucks = require("nunjucks");
const { sequelize, AppConfig, Category, BoardSetting } = require("./models");
const passport = require("passport");
const passportConfig = require("./passport");
const logger = require("./logger");
const ip = require("ip");
const helmet = require("helmet");
const hpp = require("hpp");

dotenv.config(); ////키값을 가져오는 기본 설정

sequelize
  .sync({ force: false })
  .then(() => {
    console.log("db 연결 성공");
  })
  .catch((err) => {
    console.log(err);
  });

try {
  fs.readdirSync("uploads"); //uploads 디렉토리 가져오기
} catch (error) {
  console.error("uplaods 디렉토리가 없어 uploads 디렉토리를 생성합니다.");
  fs.mkdirSync("uploads");
}
const upload = multer({
  storage: multer.diskStorage({
    //하드 디스크 저장하겠다는 함수
    destination(req, file, done) {
      //어디에 저장을 할 것인지
      done(null, "uploads/"); //uploads에 저장 지정 => filename 함수로 이동
    },
    filename(req, file, done) {
      //파일명을 뭘로 할것인지
      const ext = path.extname(file.originalname); //확장자만 가져오기
      done(null, path.basename(file.originalname, ext) + Date.now() + ext); //원본파일명 뒤에 현재시간을 넣어서 파일저장하기
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, //5MB 제한두기
});
const app = express(); //익스프레스를 사용
passportConfig();
app.set("port", process.env.PORT || 3000); // 포트 번호 설정 process.env파일에 PORT를 가져오거나 또는 3000번 포트로 설정
app.set("view engine", "html");
//views에 있는 파일을 가져오겠다는 설정
nunjucks.configure("views", {
  express: app, //express 프레임워크 어떤 객체로 쓸 것인지
  watch: true, //렌더링 할 것인지 말 것인지
});

const installRouter = require("./routes/install");
const appIndexRouter = require("./routes/app");
const appUserRouter = require("./routes/app/user");
const appServiceRouter = require("./routes/app/service");
const adminRouter = require("./routes/admin");
const appAuthRouter = require("./routes/app/auth");
const uploaderRouter = require("./routes/uploader");
/*const boardRouter = require("./routes/board");*/

//전역변수 지정하기
app.use(async (req, res, next) => {
  res.locals.ip = ip.address();
  try {
    res.locals.info = await AppConfig.findOne();
    res.locals.category = await Category.findAll();
    res.locals.boardSettingRow = await BoardSetting.findAll();
    //게시판 스킨 배열
    let skins = [];
    fs.readdir("./views/app/skin/", (err, data) => {
      data.forEach((dir) => {
        skins.push(dir);
      });
    });
    res.locals.skins = skins;
  } catch (error) {}
  next();
});
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
  app.use(helmet());
  app.use(hpp());
} else {
  app.use(morgan("dev"));
}

app.use("/", express.static(path.join(__dirname, "public"))); // /public을 url주소 /로 해도 바로 접근이 가능하게
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); //파일첨부 디렉토리 설정
app.use(express.json()); //json을 사용한다
app.use(express.urlencoded({ extended: true })); //url 인코드를 사용하지 않겠다.
app.use(cookieParser(process.env.COOKIE_SECRET)); //쿠키를 암호화해서 파싱하기
const sessionOption = session({
  resave: false, //세션을 재저장을 하지 않겠다
  saveUninitialized: false, //세션을 초기화 하지 않겠다
  secret: process.env.COOKIE_SECRET, //비밀키 설정
  cookie: {
    httpOnly: true, //쿠키는 http 프로토콜에서만 쓰겠다 =>클라이언트에서 확인 못함
    secure: false, //보안처리 하지 않겠다 => https로 사용할 때는 반드시 true
  },
});
if (process.env.NODE_ENV == "production") {
  sessionOption.proxy = true;
}
app.use(session(sessionOption));

app.use(passport.initialize()); //패스포트 초기 설정
app.use(passport.session()); //패스포트 세션 설정
app.use("/app", appIndexRouter);
app.use("/app/user", appUserRouter);
app.use("/app/service", appServiceRouter);
app.use("/app/auth", appAuthRouter);
app.use("/install", installRouter);
app.use("/admin", adminRouter);
app.use("/uploader", uploaderRouter);

app.use((req, res, next) => {
  console.log("모든 요청에 다 실행됩니다.");
  const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
  error.status = 404;
  logger.info("hello");
  logger.error(error.message);
  next(); //다음 미들웨어에 검수하기
});

//최종적으로 오류가 발생하면 메세지 보여주기
app.use((err, req, res, next) => {
  console.error(err);
  res.locals.message = err.message;
  res.locals.error = process.env.NODE_ENV !== "production" ? err : {};
  res.status(500).send(err.message); //500번 오류 메세지 보여주기
});

app.listen(app.get("port"), () => {
  //기본 포트는 3000번
  console.log(app.get("port"), "번 포트에서 대기중");
});
