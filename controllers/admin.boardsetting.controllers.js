const express = require("express");
const { BoardSetting, Board, sequelize } = require("../models");
const alert = require("../module/alert");
//GET 게시판관리 목록
let getBoardSettingList = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = 20; //목록 갯수
    const pageSize = 10; //페이지네이션
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select count(*) as count from board_setting ${where}`;

    const countRow = await sequelize.query(sql, { nest: true });
    const totalCount = countRow[0].count;
    const pageTotal = Math.ceil(totalCount / limit); // 총페이지수
    const pageStart = (Math.ceil(page / pageSize) - 1) * pageSize + 1; //페이지 그룹 첫번째 페이지
    const pageEnd = pageStart + pageSize - 1; //마지막 페이지
    //datetime으로는 시간표시가 영문으로 나오기 때문에 date_format으로 꼭 해야 함
    var sql = `select * from board_setting o ${where} order by id desc limit ${skipSize},${limit}`;
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
    res.render("./admin/board_setting_list", {
      title: "게시판관리",
      row: row,
      pageData,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
  }
};
//get 게시판관리 폼 페이지
let getBoardSettingForm = async (req, res, next) => {
  try {
    if (req.query.mode == "update") {
      const row = await BoardSetting.findOne({
        id: req.query.id,
      });
      res.render("./admin/board_setting_form", {
        title: "게시판수정",
        row: row,
        query: req.query,
      });
    } else {
      res.render("./admin/board_setting_form", { title: "게시판등록" });
    }
  } catch (error) {}
};
//post 게시판관리 폼 등록 및 수정
let postBoardSettingForm = async (req, res, next) => {
  try {
    const {
      bo_id,
      bo_name,
      bo_skin_path,
      bo_write_level,
      bo_comment_level,
      bo_list_level,
      bo_view_level,
      bo_upload_level,
      bo_download_level,
      bo_file_ea,
      bo_file_size,
      bo_list_su,
    } = req.body;

    if (req.body.mode == "update") {
      await BoardSetting.update(
        {
          bo_name,
          bo_skin_path,
          bo_write_level,
          bo_comment_level,
          bo_list_level,
          bo_view_level,
          bo_upload_level,
          bo_download_level,
          bo_file_ea,
          bo_file_size,
          bo_list_su,
        },
        {
          where: { id: req.body.id },
        }
      );
      res.redirect("/admin/board_setting_list");
    } else {
      const row = await BoardSetting.findOne({
        where: {
          bo_id: req.body.bo_id,
        },
      });
      if (row == null) {
        await BoardSetting.create({
          bo_id,
          bo_name,
          bo_skin_path,
          bo_write_level,
          bo_comment_level,
          bo_list_level,
          bo_view_level,
          bo_upload_level,
          bo_download_level,
          bo_file_ea,
          bo_file_size,
          bo_list_su,
        });
        res.redirect("/admin/board_setting_list");
      } else {
        alert("이미 존재하는 게시판입니다.", res);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
//POST 목록 업데이트 및 삭제
let postBoardSettingListUpdate = async (req, res, next) => {
  try {
    for (let i = 0; i < req.body.chk.length; i++) {
      let tempId = req.body.chk[i];

      if (req.body.mode == "update") {
        //게시판 설정 업데이트
        await BoardSetting.update(
          {
            bo_skin_path: req.body.bo_skin_path[tempId],
          },
          {
            where: {
              id: req.body.id[tempId],
            },
          }
        );
      } else {
        //해당하는 모든 게시물들을 삭제(파일과 코멘트도 같이 삭제됨)
        await Board.destroy({
          where: { f_bo_id: req.body.f_bo_id[tempId] },
        });
        //게시판 설정 삭제
        await BoardSetting.destroy({
          where: { id: req.body.id[tempId] },
        });
      }
    }
    res.json({ is_success: true });
  } catch (error) {
    console.log(error);
  }
};
//POST 게시판 개별 삭제
let postBoardSettingRemove = async (req, res, next) => {
  try {
    console.log(req.body);
    const row = await BoardSetting.findOne({
      where: { id: req.body.id },
    });
    await Board.destroy({
      where: { f_bo_id: row.bo_id },
    });
    await BoardSetting.destroy({
      where: { id: req.body.id },
    });
    res.json({ is_success: true });
  } catch (error) {
    console.error(error);
  }
};
module.exports = {
  getBoardSettingList,
  getBoardSettingForm,
  postBoardSettingForm,
  postBoardSettingListUpdate,
  postBoardSettingRemove,
};
