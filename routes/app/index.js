const express = require("express");
const router = express.Router();
const { sequelize, AppConfig } = require("../../models");
//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use(async (req, res, next) => {
  res.locals.user = req.user;

  next();
});
//GET / 라우터
router.get("/", async (req, res) => {
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

router.get("/about", (req, res) => {
  res.render("about"); // 가져올 html파일 , 데이터
});

module.exports = router;
