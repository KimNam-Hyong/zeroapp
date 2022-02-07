const express = require("express");
const {
  sequelize,
  Category,
  Service,
  ServiceOption,
  ServiceOrder,
  ServiceOrderOption,
  User,
  UserFcm,
} = require("../../models");
const router = express.Router();
const fcm_push = require("../../module/fcm_push");
require("dotenv").config();
//const jwt = require("jsonwebtoken");

require("dotenv").config();
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.token = req.cookies.token;
  res.locals.user_id = req.cookies.user_id;
  next();
});
//GET 상품 분류 페이지
router.get("/category", async (req, res, next) => {
  try {
    const row = await Category.findAll({
      order: [["ca_code", "desc"]],
    });
    console.log(`category${row}`);
    res.render("./app/service/category", {
      title: `예약하기`,
      row: row,
    });
  } catch (error) {
    console.error(`error-${error}`);
  }
});
//GET 상품 목록
router.get("/list/:ca_code", async (req, res, next) => {
  console.log("상품목록페이지");
  try {
    console.log(req.params.ca_code);
    let sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt,format(service_price,0) as service_price from service where ca_code='${req.params.ca_code}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    const categoryRow = await Category.findOne({
      where: { ca_code: req.params.ca_code },
    });

    res.render("./app/service/list", {
      title: `${categoryRow.ca_name} 서비스`,
      row: row,
    });
    console.log(row);
  } catch (error) {
    console.log(error);
  }
});
//GET 상품상세페이지
router.get("/view", async (req, res) => {
  try {
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt,format(service_price,0) as service_price from service where id='${req.query.id}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    res.render("./app/service/view", {
      title: `${row[0].service_name}`,
      row: row[0],
    }); // 가져올 html파일 , 데이터
  } catch (error) {
    console.error(error);
  }
});
//GET 서비스신청페이지
router.get("/request", async (req, res) => {
  try {
    const nowDate = new Date();

    const order_no = `${nowDate.getTime()}_${Math.floor(
      Math.random(10, 99) * 100
    )}`;
    const optionRow = await ServiceOption.findAll({
      where: { service_id: req.query.id },
    });
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt,format(service_price,0) as service_price from service where id='${req.query.id}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    res.render("./app/service/request", {
      title: `${row[0].service_name} 예약`,
      optionRow: optionRow,
      row: row[0],
      order_no: order_no,
      query: req.query,
    }); // 가져올 html파일 , 데이터
  } catch (error) {
    console.log(error);
  }
});
//GET 서비스 예약 완료 페이지
router.get("/request_result/:order_no", async (req, res, next) => {
  try {
    const sql = `select * from service_order where order_no='${req.params.order_no}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    const sql2 = `select * from service_order_option where order_id='${row[0].id}'`;
    const orderOptionRow = await sequelize.query(sql2, {
      nest: true,
    });
    res.render("./app/service/request_result", {
      title: "예약완료",
      row: row[0],
      orderOptionRow: orderOptionRow,
    }); // 가져올 html파일 , 데이터
  } catch (error) {
    console.error(error);
  }
});
//POST 서비스 예약 신청
router.post("/request", async (req, res, next) => {
  try {
    console.log(req.body.chk);

    const row = await Service.findOne({
      where: {
        id: req.body.service_id,
      },
    });
    const service_name = row.service_name;
    await ServiceOrder.create({
      order_no: req.body.order_no,
      service_id: req.body.service_id,
      service_name: service_name,
      user_id: req.body.user_id,
      user_name: req.body.user_name,
      user_tel: req.body.user_tel,
      user_addr1: req.body.user_addr1,
      user_addr2: req.body.user_addr2,
      service_date: `${req.body.service_date1} ${req.body.service_date2}`,
      service_price: req.body.service_price,
    }).then(async (result) => {
      for (let i = 0; i < req.body.chk.length; i++) {
        const idx = req.body.chk[i];
        const option_id = req.body.option_id[idx];
        const option_ea = req.body.option_ea[idx];
        const option_price = req.body.order_option_price[idx];
        const optionRow = await ServiceOption.findOne({
          where: {
            id: option_id,
          },
        });
        const option_name = optionRow.option_name;
        await ServiceOrderOption.create({
          order_id: result.id,
          option_id: option_id,
          option_name: option_name,
          option_ea: option_ea,
          option_price: option_price,
        });
      }
      const io = req.app.get("io");
      await io.of("/service").emit("servicePush", {
        msg: `${req.body.user_name}님이 예약신청을 하였습니다.`,
        href: "/admin/order_list",
      });

      //푸시보내기 실행
      //관리자 전체 보내기
      const userRow = await User.findAll({
        where: {
          user_level: 10,
        },
      });
      //관리자 아이디로 푸시 토큰값 전부 다 가져오기
      let tokens = new Array();
      for (let i = 0; i < userRow.length; i++) {
        var sql = `select * from user_fcm where user_id='${userRow[i].user_id}' and push_status='Y'`;
        var fcmRow = await sequelize.query(sql, {
          nest: true,
        });
        for (let j = 0; j < fcmRow.length; j++) {
          if (fcmRow[j].fcm_token != undefined) {
            tokens.push(fcmRow[0].fcm_token);
          }
        }
      }
      //푸시를 보내기
      for (let f = 0; f < tokens.length; f++) {
        fcm_push(
          req,
          "제로브이 서비스 예약",
          `${req.body.user_name}님이 서비스 예약을 하였습니다.`,
          tokens[f],
          `${process.env.PUSH_URL}admin/order_list`
        );
      }
      res.redirect(`/app/service/request_result/${req.body.order_no}`);
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
