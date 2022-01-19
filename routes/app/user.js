const express = require("express");
const router = express.Router();
const ip = require("ip");
const { UserToken, User } = require("../../models");
const bcrypt = require("bcrypt");
//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use(async (req, res, next) => {
  res.locals.user = req.user;

  next();
});
//GET 로그인 페이지
router.get("/login", async (req, res) => {
  console.log("로그인");
  console.log(req.user);
  if (req.user != undefined) {
    res.redirect("/app");
  } else {
    res.render("./app/user/login", {
      title: "제로브이 회원로그인",
    }); // 가져올 html파일 , 데이터
  }
});

//GET 회원가입 페이지
router.get("/register/", async (req, res) => {
  if (req.query.mode === "update") {
    console.log(req.user);
    if (req.user == undefined) {
      res.render("./app/user/error", {
        title: "제로브이 오류",
        msg: "잘못된 경로로 들어왔습니다.",
      }); // 가져올 html파일 , 데이터
      return;
    } else {
      const row = await User.findOne({
        where: { user_id: req.user.user_id },
      });

      res.render("./app/user/register", {
        title: "제로브이 회원수정",
        row: row,
        mode: req.query.mode,
      }); // 가져올 html파일 , 데이터
    }
  } else {
    res.render("./app/user/register", { title: "제로브이 회원가입" }); // 가져올 html파일 , 데이터
  }
});

//GET 회원가입 완료 페이지
router.get("/register_result/:user_id", async (req, res) => {
  console.log("회원가입 완료 페이지");
  res.render("./app/user/register_result", {
    title: "제로브이 회원가입 완료",
    user_id: req.params.user_id,
  });
});
//GET 로그아웃
router.get("/logout", async (req, res) => {
  await UserToken.update(
    {
      access_token: "",
      refresh_token: "",
    },
    { where: { user_id: req.user.user_id } }
  );
  req.logout();
  res.redirect("/app");
});

//POST 회원아이디(이메일) 중복체크하기
router.post("/id_check", async (req, res, next) => {
  try {
    const row = await User.findOne({
      where: { user_id: req.body.user_id },
    });
    if (row === null) {
      return res.json({ is_id_check: true });
    } else {
      return res.json({ is_id_check: false });
    }
  } catch (error) {}
});
//POST 회원가입 및 수정하기
router.post("/register", async (req, res, next) => {
  try {
    //회원가입하기
    if (req.body.mode == "") {
      const hashpassword = await bcrypt.hash(
        req.body.user_password.toString(),
        10
      );
      console.log(req.body.user_password);

      await User.create({
        user_id: req.body.user_id,
        user_name: req.body.user_name,
        user_password: hashpassword,
        user_postcode: req.body.user_postcode,
        user_addr1: req.body.user_addr1,
        user_addr2: req.body.user_addr2,
        user_hp: req.body.user_hp,
        user_level: 2,
      });
      res.redirect(`/app/user/register_result/${req.body.user_id}`);
      //회원정보 수정하기
    } else {
      await User.update(
        {
          user_name: req.body.user_name,
          user_postcode: req.body.user_postcode,
          user_addr1: req.body.user_addr1,
          user_addr2: req.body.user_addr2,
          user_hp: req.body.user_hp,
        },
        {
          where: { user_id: req.body.user_id },
        }
      );
      //비밀번호 수정을 할 시에
      if (req.body.user_password) {
        const hashpassword = await bcrypt.hash(req.body.user_password, 10); //value,default
        await User.update(
          {
            user_password: hashpassword,
          },
          { where: { user_id: req.body.user_id } }
        );
      }
      res.redirect("/app");
    }
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
