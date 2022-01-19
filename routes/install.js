const express = require("express");
const router = express.Router();
const { User, sequelize } = require("../models");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.token = req.cookies.token;
  res.locals.user_id = req.cookies.user_id;
  next();
});
//GET 설치페이지
router
  .get("/", async (req, res) => {
    console.log(req.cookies.token);
    const row = await sequelize.query(
      "select count(*) as cnt from users where user_level='10'",
      {
        nest: true,
      }
    );
    if (row[0].cnt == 0) {
      res.render("./install", { title: "제로브이 설치" }); // 가져올 html파일 , 데이터
    } else {
      res.render("./install_error");
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
  })
  .post("/", async (req, res) => {
    // 관리자 유저 테이블에 넣기
    try {
      const user_password = await bcrypt.hash(req.body.user_password, 10);
      await User.create({
        user_id: req.body.user_id,
        user_password: user_password,
        user_name: "관리자",
        user_level: 10,
      }).then((result) => {
        console.log(result);
        if (result) {
          res.redirect("/app");
        }
      });
    } catch (error) {
      console.error(error);
    }
  });

module.exports = router;
