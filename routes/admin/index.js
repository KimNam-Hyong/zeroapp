const express = require("express");
const router = express.Router();
const { AppConfig, Category, User, sequelize } = require("../../models");
const base_convert = require("locutus/php/math/base_convert");
const bcrypt = require("bcrypt");
const adminUserControllers = require("../../controllers/admin.user.controllers");
const adminCategoryControllers = require("../../controllers/admin.category.controllers");
const adminServiceControllers = require("../../controllers/admin.service.controllers");
const adminOrderControllers = require("../../controllers/admin.order.controllers");
const adminBoardSettingControllers = require("../../controllers/admin.boardsetting.controllers");
const adminBoardControllers = require("../../controllers/admin.board.controllers");
const multer = require("multer");
const path = require("path");
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      console.log("file");
      console.log(req.request);
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, path.basename(file.originalname, ext) + Date.now() + ext);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 },
});

//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.token = req.cookies.token;
  res.locals.user_id = req.cookies.user_id;
  next();
});
//GET / 라우터
router.get("/", async (req, res) => {
  console.log(req.cookies.token);
  res.render("./admin/index", { title: "제로브이 관리자모드" }); // 가져올 html파일 , 데이터
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

//GET 웹 및 앱 설정페이지
router.get("/setting", async (req, res, next) => {
  try {
    const row = await AppConfig.findOne();
    res.render("./admin/setting", { title: "웹&앱 설정하기", row: row });
  } catch (error) {}
});

//POST 웹 및 앱 설정을 db에 넣기
router.post("/setting", async (req, res, next) => {
  try {
    console.log(req.body.com_info);

    const row = await sequelize.query(`select * from app_config`, {
      nest: true,
    });
    const {
      company,
      com_ceo,
      post_code,
      address,
      address2,
      com_tel,
      com_fax,
      com_email,
      com_info,
      com_bizno,
      com_networkno,
      com_private,
      com_use_terms,
    } = req.body;
    if (row.length == 0) {
      await AppConfig.create({
        company,
        com_ceo,
        post_code,
        address,
        address2,
        com_tel,
        com_fax,
        com_email,
        com_info,
        com_bizno,
        com_networkno,
        com_private,
        com_use_terms,
      });
    } else {
      await AppConfig.update(
        {
          company,
          com_ceo,
          post_code,
          address,
          address2,
          com_tel,
          com_fax,
          com_email,
          com_info,
          com_bizno,
          com_networkno,
          com_private,
          com_use_terms,
        },
        {
          where: { id: 1 },
        }
      );
    }
    res.redirect("/admin/setting");
  } catch (error) {
    console.error(error);
  }
});
/* 분류 관련 라우터 시작 */
//GET 분류 목록 페이지
router.get("/category_list", adminCategoryControllers.getCategoryList);
//GET 분류 등록 및 수정 페이지
router.get("/category_form", adminCategoryControllers.getCategoryForm);
//POST 분류 인서트 및 업데이트 하기
router.post("/category_form", adminCategoryControllers.postCategoryForm);
//POST 분류 개별삭제와 전체 삭제
router.post("/category_remove", adminCategoryControllers.postCategoryRemove);
/* 분류 관련 라우터 끝 */

/* 회원관리 라우터 시작 */
//GET 회원관리 목록페이지
router.get("/user_list", adminUserControllers.getUserList);
//GET 회원관리 폼페이지
router.get("/user_form", adminUserControllers.getUserForm);
//POST 회원등록
router.post("/user_form", adminUserControllers.postUserForm);
/* 회원관리 라우터 끝 */
/* 서비스 관리 라우터 시작 */
//GET 서비스관리 목록페이지
router.get("/service_list", adminServiceControllers.getServiceList);
//GET 서비스 폼
router.get("/service_form", adminServiceControllers.getServiceForm);
//POST 서비스 등록 및 수정
router.post("/service_form", adminServiceControllers.postServiceForm);
//POST 서비스 삭제
router.post("/service_remove", adminServiceControllers.postServiceRemove);
/* 서비스 관리 라우터 끝 */

/* 서비스 예약관리 시작 */
/* GET 서비스 예약관리 목록 시작 */
router.get("/order_list", adminOrderControllers.getOrderList);
/* GET 서비스 상세 보기 */
router.get("/order_view", adminOrderControllers.getOrderView);
/* POST 서비스 상태 변경 */
router.post("/ajax_order_status", adminOrderControllers.postOrderStatusChange);
/* 서비스 예약관리 끝 */

/* 게시판 관리 시작 */
/* GET 게시판 관리 목록 */
router.get(
  "/board_setting_list",
  adminBoardSettingControllers.getBoardSettingList
);
/* GET 게시판 관리 폼 */
router.get(
  "/board_setting_form",
  adminBoardSettingControllers.getBoardSettingForm
);
/* POST 게시판 관리 폼 등록 및 수정 */
router.post(
  "/board_setting_form",
  adminBoardSettingControllers.postBoardSettingForm
);
/* POST 게시판 관리 목록 수정 및 삭제 */
router.post(
  "/board_setting_list_update",
  adminBoardSettingControllers.postBoardSettingListUpdate
);
router.post(
  "/board_setting_remove",
  adminBoardSettingControllers.postBoardSettingRemove
);
/* 게시판 관리 끝 */
/* 게시판 시작 */
/* GET 게시판 목록 */
router.get("/:bo_id/list", adminBoardControllers.getBoardList);
/* GET 게시판 폼 페이지 */
router.get("/:bo_id/form", adminBoardControllers.getBoardForm);

/* 파일첨부 기능 넣기 */
router.post("/photo_upload", upload.single("service_photo"), (req, res) => {
  console.log(req.file);
  res.json({ file: req.file });
});
module.exports = router;
