const express = require("express");
const { BoardSetting, Board, sequelize } = require("../models");
const alert = require("../module/alert");
//GET 게시판 목록
let getBoardList = async (req, res, next) => {
  try {
    console.log(req.params.bo_id);
    const bsRow = await BoardSetting.findOne({
      where: { bo_id: req.params.bo_id },
    });

    const page = Number(req.query.page) || 1;
    const limit = bsRow.bo_list_su; //목록 갯수
    const pageSize = 10; //페이지네이션
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select count(*) as count from board ${where} and f_bo_id='${req.params.bo_id}'`;

    const countRow = await sequelize.query(sql, { nest: true });
    const totalCount = countRow[0].count;
    const pageTotal = Math.ceil(totalCount / limit); // 총페이지수
    const pageStart = (Math.ceil(page / pageSize) - 1) * pageSize + 1; //페이지 그룹 첫번째 페이지
    const pageEnd = pageStart + pageSize - 1; //마지막 페이지
    //datetime으로는 시간표시가 영문으로 나오기 때문에 date_format으로 꼭 해야 함
    var sql = `select * from board ${where}  and f_bo_id='${req.params.bo_id}' order by id desc limit ${skipSize},${limit}`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    console.log(`page:${page}`);
    const pageData = {
      page,
      pageStart,
      totalCount,
      pageEnd,
      pageTotal,
      skipSize,
    };
    res.render(`./admin/skin/${bsRow.bo_skin_path}/list`, {
      title: `${bsRow.bo_name} 목록`,
      row: row,
      pageData,
      bo_id: req.params.bo_id,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
  }
};
//GET 게시판 폼 페이지
let getBoardForm = async (req, res, next) => {
  try {
    const bsRow = await BoardSetting.findOne({
      where: { bo_id: req.params.bo_id },
    });
    if (req.query.mode == "update") {
    } else {
      res.render(`./admin/skin/${bsRow.bo_skin_path}/form`, {
        title: `${bsRow.bo_name} 등록`,
        btn_write: "글등록",
        bsRow: bsRow,
      });
    }
  } catch (error) {
    console.error(error);
  }
};

module.exports = {
  getBoardList,
  getBoardForm,
};
