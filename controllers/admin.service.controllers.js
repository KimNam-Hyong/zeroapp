const express = require("express");
const router = express.Router();
const { Category, Service, ServiceOption, sequelize } = require("../models");
const base_convert = require("locutus/php/math/base_convert");
const bcrypt = require("bcrypt");
//GET 서비스 목록
let getServiceList = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20; //목록 갯수
    const pageSize = 10; //페이지네이션
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select count(*) as count from service ${where}`;

    const countRow = await sequelize.query(sql, { nest: true });
    const totalCount = countRow[0].count;
    const pageTotal = Math.ceil(totalCount / limit); // 총페이지수
    const pageStart = (Math.ceil(page / pageSize) - 1) * pageSize + 1; //페이지 그룹 첫번째 페이지
    const pageEnd = pageStart + pageSize - 1; //마지막 페이지
    //datetime으로는 시간표시가 영문으로 나오기 때문에 date_format으로 꼭 해야 함
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt,format(service_price,0) as service_price from service ${where} order by id desc limit ${skipSize},${limit}`;
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
    res.render("./admin/service_list", {
      title: "서비스관리",
      row: row,
      pageData,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
  }
};
//GET 서비스 폼
let getServiceForm = async (req, res, next) => {
  try {
    const categoryRow = await Category.findAll();
    if (req.query.mode == "update") {
      let sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt from service where id='${req.query.id}'`;
      const row = await sequelize.query(sql, {
        nest: true,
      });
      console.log(row);
      let optionSql = `select * from service_option where service_id='${req.query.id}'`;
      const optionRow = await sequelize.query(optionSql, {
        nest: true,
      });

      res.render("./admin/service_form", {
        title: "서비스수정",
        row: row[0],
        query: req.query,
        mode: req.query.mode,
        optionRow: optionRow,
        categoryRow: categoryRow,
      });
    } else {
      res.render("./admin/service_form", {
        title: "서비스등록",
        categoryRow: categoryRow,
      });
    }
  } catch (error) {
    console.error(error);
  }
};
//POST 서비스 등록 및 수정
let postServiceForm = async (req, res, next) => {
  try {
    let service_status =
      req.body.service_status == "1" ? req.body.service_status : 0;
    console.log(req.body);

    if (req.body.mode == "update") {
      await Service.update(
        {
          ca_code: req.body.ca_code,
          service_name: req.body.service_name,
          service_price: req.body.service_price,
          service_info: req.body.service_info,
          service_status: service_status,
          service_photo1: req.body.service_photo1,
          service_photo2: req.body.service_photo2,
          service_photo3: req.body.service_photo3,
          service_photo4: req.body.service_photo4,
          service_photo5: req.body.service_photo5,
        },
        {
          where: { id: req.body.id },
        }
      ).then(async (result) => {
        console.log(req.body.id);
        await ServiceOption.destroy({ where: { service_id: req.body.id } });
        //옵션명이 배열로 되어 있으면
        if (Array.isArray(req.body.option_name)) {
          for (var i = 0; i < req.body.option_name.length; i++) {
            if (req.body.option_name[i] != "") {
              await ServiceOption.create({
                service_id: req.body.id,
                option_name: req.body.option_name[i],
                option_price: req.body.option_price[i],
              });
            }
          }
          //단일로 되어있으면
        } else {
          if (req.body.option_name != "") {
            await ServiceOption.create({
              service_id: req.body.id,
              option_name: req.body.option_name,
              option_price: req.body.option_price,
            });
          }
        }
      });
      res.redirect("/admin/service_list");
    } else {
      await Service.create({
        user_id: "admin",
        ca_code: req.body.ca_code,
        service_name: req.body.service_name,
        service_price: req.body.service_price,
        service_info: req.body.service_info,
        service_status: service_status,
        service_photo1: req.body.service_photo1,
        service_photo2: req.body.service_photo2,
        service_photo3: req.body.service_photo3,
        service_photo4: req.body.service_photo4,
        service_photo5: req.body.service_photo5,
      }).then(async (result) => {
        console.log(req.body.option_name);
        //옵션명이 배열로 되어 있으면
        if (Array.isArray(req.body.option_name)) {
          for (var i = 0; i < req.body.option_name.length; i++) {
            if (req.body.option_name[i] != "") {
              await ServiceOption.create({
                service_id: result.id,
                option_name: req.body.option_name[i],
                option_price: req.body.option_price[i],
              });
            }
          }
          //단일로 되어있으면
        } else {
          if (req.body.option_name != "") {
            await ServiceOption.create({
              service_id: result.id,
              option_name: req.body.option_name,
              option_price: req.body.option_price,
            });
          }
        }
        res.redirect("/admin/service_list");
        /**/
      });
    }
  } catch (error) {
    console.error(error);
  }
};
//POST 서비스삭제
let postServiceRemove = async (req, res, next) => {
  try {
    await Service.destroy({
      where: { id: req.body.id },
    });
    res.json({ success: true });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getServiceList,
  getServiceForm,
  postServiceForm,
  postServiceRemove,
};
