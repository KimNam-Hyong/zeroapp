const express = require("express");
const { ServiceOrder, sequelize } = require("../models");
//GET 예약관리 목록
let getOrderList = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20; //목록 갯수
    const pageSize = 10; //페이지네이션
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select count(*) as count from service_order ${where}`;

    const countRow = await sequelize.query(sql, { nest: true });
    const totalCount = countRow[0].count;
    const pageTotal = Math.ceil(totalCount / limit); // 총페이지수
    const pageStart = (Math.ceil(page / pageSize) - 1) * pageSize + 1; //페이지 그룹 첫번째 페이지
    const pageEnd = pageStart + pageSize - 1; //마지막 페이지
    //datetime으로는 시간표시가 영문으로 나오기 때문에 date_format으로 꼭 해야 함
    var sql = `select *,(select option_name from service_order_option where order_id=o.id limit 1) as option_name,date_format(createdAt,'%Y-%m-%d') as createdAt,format(service_price,0) as service_price from service_order o ${where} order by id desc limit ${skipSize},${limit}`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    console.log(`page:${page}`);
    const pageData = {
      page,
      pageStart,
      pageEnd,
      pageTotal,
      skipSize,
    };
    res.render("./admin/order_list", {
      title: "서비스예약관리",
      row: row,
      pageData,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
  }
};
//GET 예약관리 상세보기
let getOrderView = async (req, res, next) => {
  try {
    const sql = `select * from service_order where id='${req.query.id}'`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    const sql2 = `select *,format(option_price,0) as option_price from service_order_option where order_id='${row[0].id}'`;
    const orderOptionRow = await sequelize.query(sql2, {
      nest: true,
    });
    res.render("./admin/order_view", {
      title: "서비스예약 상세보기",
      row: row[0],
      orderOptionRow: orderOptionRow,
      query: req.query,
    });
  } catch (error) {}
};
//POST 예약 상태 변경하기
let postOrderStatusChange = async (req, res, next) => {
  try {
    await ServiceOrder.update(
      {
        service_status: req.body.service_status,
      },
      {
        where: {
          id: req.body.id,
        },
      }
    );
    res.json({ success: true });
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getOrderList,
  getOrderView,
  postOrderStatusChange,
};
