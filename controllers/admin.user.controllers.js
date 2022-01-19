const express = require("express");
const router = express.Router();
const { AppConfig, Category, User, sequelize } = require("../models");
const base_convert = require("locutus/php/math/base_convert");
const bcrypt = require("bcrypt");
//회원 목록
let getUserList = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20; //목록 갯수
    const pageSize = 10; //페이지네이션
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select count(*) as count from users ${where}`;

    const countRow = await sequelize.query(sql, { nest: true });
    const totalCount = countRow[0].count;
    const pageTotal = Math.ceil(totalCount / limit); // 총페이지수
    const pageStart = (Math.ceil(page / pageSize) - 1) * pageSize + 1; //페이지 그룹 첫번째 페이지
    const pageEnd = pageStart + pageSize - 1; //마지막 페이지
    //datetime으로는 시간표시가 영문으로 나오기 때문에 date_format으로 꼭 해야 함
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt from users ${where}`;
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
    res.render("./admin/user_list", {
      title: "회원관리",
      row: row,
      pageData,
      query: req.query,
    });
  } catch (error) {}
};
//회원 폼
let getUserForm = async (req, res, next) => {
  try {
    if (req.query.mode == "update") {
      var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt from users where user_id='${req.query.user_id}'`;
      const row = await sequelize.query(sql, {
        nest: true,
      });
      res.render("./admin/user_form", {
        title: "회원수정",
        row: row[0],
        query: req.query,
      });
    } else {
      res.render("./admin/user_form", { title: "회원등록" });
    }
  } catch (error) {}
};
let postUserForm = async (req, res, next) => {
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
      res.redirect(
        `/admin/user_form/?mode=update&user_id=${req.body.user_id}&page=${req.body.page}&field=${req.body.field}&value=${req.body.value}`
      );
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
      res.redirect(
        `/admin/user_form/?mode=update&user_id=${req.body.user_id}&page=${req.body.page}&field=${req.body.field}&value=${req.body.value}`
      );
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getUserList,
  getUserForm,
  postUserForm,
};
