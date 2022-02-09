const express = require("express");
const router = express.Router();
const { sequelize, AppConfig, UserFcm } = require("../../models");
const scheduler = require("../../module/scheduler");
const moment = require("moment");
//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use(async (req, res, next) => {
  res.locals.user = req.user;

  next();
});
//GET / 라우터
router.get("/", async (req, res) => {
  let service_date1 =
    moment("2022-02-09").subtract(1, "d").format("YYYY-MM-DD") + " 17:42:00"; //삼일전
  console.log(service_date1);
  var data = {
    subject: `스케줄러테스트`,
    url: `${process.env.PUSH_URL}/mypage/service/list/ing`,
  };
  scheduler(
    req,
    data,
    service_date1,
    "fSyo8iVuQm2-ANQeD5w1rL:APA91bF287sjD24AqqQbjS9XwJCOsf58WhTfzO1-yS9fwCkWmJXsY0adn_s_vcs4gxj2wGHLqYoyrXMXzU7QS7kFJHm-rydu8fnlUnTVpvM75DjmmSvxkCV3OZ9Q0jLxg30KD_0qppi_"
  );
  const row = await sequelize.query(
    "select count(*) as cnt from users where user_level='10'",
    {
      nest: true,
    }
  );
  if (row[0].cnt == 0) {
    res.redirect("/install");
  } else {
    res.render("./app/index", { title: "제로브이", index: true }); // 가져올 html파일 , 데이터
  }
  //토큰값이 있고 유저값이 있으면
  /*if (
    req.cookies.token != undefined &&
    req.cookies.token != "" &&
    req.user == undefined
  ) {
    //토큰체크 페이지로 이동하기
    return res.redirect("/user/token_check");
  } else {
    res.render("index", { title: "Express" }); // 가져올 html파일 , 데이터
  }*/
});
//GET 회사소개
router.get("/company", async (req, res) => {
  const row = await AppConfig.findOne({
    attributes: ["com_info"],
  });
  res.render("./app/company", { title: "회사소개", row: row }); // 가져올 html파일 , 데이터
});
//GET 더보기
router.get("/more", async (req, res) => {
  res.render("./app/more", { title: "더보기" }); // 가져올 html파일 , 데이터
});
//GET 개인정보처리 방침
router.get("/privacy", async (req, res) => {
  const row = await AppConfig.findOne({
    attributes: ["com_privacy"],
  });
  res.render("./app/privacy", { title: "개인정보처리방침", row: row }); // 가져올 html파일 , 데이터
});
//GET 이용약관
router.get("/terms_use", async (req, res) => {
  const row = await AppConfig.findOne({
    attributes: ["com_use_terms"],
  });
  res.render("./app/terms_use", { title: "개인정보처리방침", row: row }); // 가져올 html파일 , 데이터
});
//POST 토큰값 설정하기
router.post("/set_fcm_token", async (req, res, next) => {
  try {
    const row = await UserFcm.findAndCountAll({
      where: {
        user_id: req.body.user_id,
      },
    });
    console.log(row);
    if (req.body.user_id == "") {
      res.json({ fcm: false });
    } else {
      if (row.count == 0) {
        await UserFcm.create({
          user_id: req.body.user_id,
          fcm_token: req.body.fcm_token,
          deviceId: req.body.deviceId,
          push_status: "Y",
        });
      } else {
        await UserFcm.update(
          {
            user_id: req.body.user_id,
            fcm_token: req.body.fcm_token,
            push_status: "Y",
          },
          {
            where: {
              deviceId: req.body.deviceId,
            },
          }
        );
      }
      res.json({ fcm: true });
    }
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
