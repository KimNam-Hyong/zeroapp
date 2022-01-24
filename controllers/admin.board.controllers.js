const express = require("express");
const { BoardSetting, Board, sequelize, BoardFile } = require("../models");
const alert = require("../module/alert");
//GET 게시판 목록
let getBoardList = async (req, res, next) => {
  try {
    console.log(`locals:${req.user}`);
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
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt from board ${where}  and f_bo_id='${req.params.bo_id}' order by id desc limit ${skipSize},${limit}`;
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
      const row = await Board.findOne({
        where: { f_bo_id: req.params.bo_id, id: req.query.id },
      });
      const fileRow = await BoardFile.findAll({
        where: { f_bbs_id: req.query.id },
      });

      res.render(`./admin/skin/${bsRow.bo_skin_path}/form`, {
        title: `${bsRow.bo_name} 수정`,
        btn_write: "글수정",
        bsRow: bsRow,
        query: req.query,
        fileRow: fileRow,
        row: row,
      });
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
//GET 게시판 상세 페이지
let getBoardView = async (req, res, next) => {
  try {
    const bsRow = await BoardSetting.findOne({
      where: { bo_id: req.params.bo_id },
    });
    const row = await Board.findOne({
      where: { f_bo_id: req.params.bo_id, id: req.params.id },
    });
    const fileRow = await BoardFile.findAll({
      where: { f_bbs_id: req.params.id },
    });
    res.render(`./admin/skin/${bsRow.bo_skin_path}/view`, {
      title: `${bsRow.bo_name} 상세보기`,
      bsRow: bsRow,
      row: row,
      fileRow: fileRow,
    });
  } catch (error) {
    console.error(error);
  }
};
//POST 게시판 폼 인서트 및 업데이트
let postBoardForm = async (req, res, next) => {
  try {
    const { f_bo_id, bo_subject, bo_content, user_id, user_name } = req.body;
    if (req.body.mode == "update") {
      await Board.update(
        {
          bo_subject,
          bo_content,
        },
        {
          where: {
            id: req.body.id,
          },
        }
      ).then(async (result) => {
        for (var i = 0; i < req.body.file_path.length; i++) {
          var file_no = i + 1;
          if (req.body.file_path[i] != "") {
            if (req.body.file_id[i] == "") {
              await BoardFile.create({
                file_no: file_no,
                file_path: req.body.file_path[i],
                file_name: req.body.file_name[i],
                file_size: req.body.file_size[i],
                mimetype: req.body.mimetype[i],
                file_download_su: 0,
                f_bbs_id: req.body.id,
              });
            } else {
              await BoardFile.update(
                {
                  file_no: file_no,
                  file_path: req.body.file_path[i],
                  file_name: req.body.file_name[i],
                  file_size: req.body.file_size[i],
                  mimetype: req.body.mimetype[i],
                  file_download_su: 0,
                  f_bbs_id: result.id,
                },
                {
                  where: { id: req.body.file_id[i] },
                }
              );
            }
          }
        }
      });
      res.redirect(`/admin/${req.body.f_bo_id}/view/${req.body.id}`);
    } else {
      //게시판 인서트하기
      await Board.create({
        f_bo_id,
        bo_subject,
        bo_content,
        user_id,
        user_name,
      }).then(async (result) => {
        //게시판 file 테이블에 인서트하기
        for (let i = 0; i < req.body.file_path.length; i++) {
          let file_no = i + 1;
          if (req.body.file_path[i] != "") {
            await BoardFile.create({
              file_no: file_no,
              file_path: req.body.file_path[i],
              file_name: req.body.file_name[i],
              file_size: req.body.file_size[i],
              mimetype: req.body.mimetype[i],
              file_download_su: 0,
              f_bbs_id: result.id,
            });
          }
        }
      });
      res.redirect(`/admin/${req.body.f_bo_id}/list`);
    }
  } catch (error) {
    console.error(error);
  }
};
//POST 게시판 삭제
let postBoardRemove = async (req, res, next) => {
  try {
    //체크해서 삭제하기
    if (req.body.mode == "list") {
      const idArr = req.body.ids.toString().split(",");
      for (let i = 0; i < idArr.length; i++) {
        await Board.destroy({
          where: {
            id: idArr[i],
          },
        });
      }
      return res.json({ success: true });
      //개별적으로 삭제하기
    } else {
      await Board.destroy({
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
  getBoardList,
  getBoardForm,
  postBoardForm,
  getBoardView,
  postBoardRemove,
};
