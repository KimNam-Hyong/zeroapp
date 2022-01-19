const express = require("express");
const router = express.Router();
const { Category, sequelize } = require("../models");
const base_convert = require("locutus/php/math/base_convert");
const bcrypt = require("bcrypt");
//GET 분류 목록
let getCategoryList = async (req, res, next) => {
  try {
    const row = await Category.findAll({
      order: [["ca_code", "ASC"]],
    });
    res.render("./admin/category_list", { title: "분류관리", row: row });
  } catch (error) {}
};
//GET 분류폼
let getCategoryForm = async (req, res, next) => {
  try {
    let ca_code = "";
    if (req.query.mode != "update") {
      let len = ca_code.length;
      let len2 = len + 1;
      let sql = `select max(substring(ca_code,${len2},2)) as max_subid from category where substring(ca_code,1,${len}) = '${ca_code}'`;
      console.log(sql);
      const row = await sequelize.query(sql, { nest: true });
      const max_subid = row[0].max_subid || 0;
      let base_ca_code = base_convert(max_subid, 36, 10) || 0;
      base_ca_code = parseInt(base_ca_code) + 36;
      if (base_ca_code >= 36 * 36) {
        base_ca_code = " ";
      }
      base_ca_code = base_convert(base_ca_code, 10, 36);
      var sub_ca_code = base_ca_code.substring(`00${base_ca_code}`, -2);
      sub_ca_code = ca_code + sub_ca_code;
      console.log(sub_ca_code);

      res.render("./admin/category_form", {
        title: "분류등록",
        ca_code: sub_ca_code,
      });
    } else {
      const row = await Category.findOne({
        where: { id: req.query.id },
      });
      console.log(row);
      const ca_code = row.ca_code;
      res.render("./admin/category_form", {
        title: "분류수정",
        ca_code: ca_code,
        mode: req.query.mode,
        row: row,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

//POST 분류 db 업데이트 인서트
let postCategoryForm = async (req, res, next) => {
  try {
    if (req.body.mode != "update") {
      await Category.create({
        ca_code: req.body.ca_code,
        ca_name: req.body.ca_name,
      });
    } else {
      await Category.update(
        {
          ca_name: req.body.ca_name,
        },
        {
          where: {
            ca_code: req.body.ca_code,
          },
        }
      );
    }
    res.redirect("/admin/category_list");
  } catch (error) {}
};
//POST 분류삭제
let postCategoryRemove = async (req, res, next) => {
  try {
    //체크해서 삭제하기
    if (req.body.mode == "list") {
      const idArr = req.body.ids.toString().split(",");
      for (let i = 0; i < idArr.length; i++) {
        await Category.destroy({
          where: {
            id: idArr[i],
          },
        });
      }
      return res.json({ success: true });
      //개별적으로 삭제하기
    } else {
      await Category.destroy({
        where: { id: req.body.id },
      }).then((result) => {
        return res.json({ success: true });
      });
      return res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  getCategoryList,
  getCategoryForm,
  postCategoryForm,
  postCategoryRemove,
};
