const express = require("express");
const router = express.Router();
//const jwt = require("jsonwebtoken");
require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.token = req.cookies.token;
  res.locals.user_id = req.cookies.user_id;
  next();
});
//GET 게시판 목록
router.get("/:bo_id/list", async (req, res) => {
  console.log("상품목록페이지");
  res.render("./app/board/list", { title: "에어컨 목록페이지" });
});
//GET 게시판 상세페이지
router.get("/:bo_id/view/:id", async (req, res) => {
  console.log("상품상세페이지");
  res.render("./app/board/view", { title: "에어컨종합세척설명" }); // 가져올 html파일 , 데이터
});
module.exports = router;
