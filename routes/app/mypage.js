const express = require("express");
const router = express.Router();
const { ServiceOrder, ServiceOrderOption, sequelize } = require("../../models");
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.token = req.cookies.token;
  res.locals.user_id = req.cookies.user_id;
  next();
});
//GET 마이페이지 목록
router.get("/service/list/:status", async (req, res, next) => {
  console.log("나의 예약 목록페이지");
  try {
    console.log(req.params.ca_code);
    let where = `1`;
    if (req.user != undefined) {
      where += ` and user_id = '${req.user.user_id}'`;
    }
    if (req.params.status == "ing") {
      where += ` and service_status='확인전' or service_status='확인완료'`;
    } else {
      where += ` and service_status='서비스완료'`;
    }
    let optionRow = null;
    let sql = `select * from service_order where ${where}`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    let cateRow = new Array();
    for (let i = 0; i < row.length; i++) {
      let cRow = await ServiceOrderOption.findOne({
        where: { order_id: row[i].id },
      });
      cateRow.push(cRow);
    }
    console.log(`${cateRow}`);
    res.render("./app/mypage/service_list", {
      title: `나의 서비스 목록`,
      row: row,
      cateRow: cateRow,
      params: req.params,
    });
    console.log(row);
  } catch (error) {
    console.log(error);
  }
});
//GET 마이페이지 상세보기
router.get("/service/view", async (req, res, next) => {
  console.log("나의 예약 상세페이지");
  try {
    const sql = `select * from service_order where order_no='${req.query.order_no}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    const sql2 = `select *,format(option_price,0) as option_price from service_order_option where order_id='${row[0].id}'`;
    const orderOptionRow = await sequelize.query(sql2, {
      nest: true,
    });
    res.render("./app/mypage/service_view", {
      title: "서비스예약 상세보기",
      row: row[0],
      orderOptionRow: orderOptionRow,
      query: req.query,
    });
  } catch (error) {
    console.log(error);
  }
});
module.exports = router;
