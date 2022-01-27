const express = require("express");
const router = express.Router();
const { BoardSetting, Board, sequelize, BoardFile } = require("../../models");
const alert = require("../../module/alert");
const { verifyToken } = require("./middleware");
const multer = require("multer");
const path = require("path");
const sharp = require("sharp"); //썸네일을 할 때 필요함
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      console.log("file");
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
//GET 게시판 목록
router.get("/:bo_id/list", verifyToken, async (req, res, next) => {
  try {
    console.log(`req.decoded.user_level : ${req.decoded}`);
    let user_level = req.decoded != undefined ? req.decoded.user_level : 1;
    if (user_level < bsRow.bo_list_level) {
      alert("목록을 볼 수 있는 권한이 없습니다.", res);
      return;
    }
    const bsRow = await BoardSetting.findOne({
      where: { bo_id: req.params.bo_id },
    });

    const limit = bsRow.bo_list_su; //목록 갯수
    const page = 1;
    const skipSize = (page - 1) * limit; //다음페이지

    let where = "where 1";
    if (req.query.field && req.query.value) {
      where += ` and ${req.query.field} like '%${req.query.value}%'`;
    }
    var sql = `select *,date_format(createdAt,'%Y-%m-%d') as createdAt from board ${where}  and f_bo_id='${req.params.bo_id}' order by id desc limit ${skipSize},${limit}`;
    const row = await sequelize.query(sql, {
      nest: true,
    });
    res.render(`./app/skin/${bsRow.bo_skin_path}/list`, {
      title: `${bsRow.bo_name} 목록`,
      row: row,
      page: page,
      bsRow,
      bo_id: req.params.bo_id,
      query: req.query,
    });
  } catch (error) {
    console.error(error);
  }
});
//GET 게시판 상세페이지
router.get("/:bo_id/view/:id", verifyToken, async (req, res) => {
  try {
    let user_level = req.decoded != undefined ? req.decoded.user_level : 1;
    if (user_level < bsRow.bo_view_level) {
      alert("상세보기 볼 수 있는 권한이 없습니다.", res);
      return;
    }
    const bsRow = await BoardSetting.findOne({
      where: { bo_id: req.params.bo_id },
    });
    const row = await Board.findOne({
      where: { f_bo_id: req.params.bo_id, id: req.params.id },
    });
    const fileRow = await BoardFile.findAll({
      where: { f_bbs_id: req.params.id },
    });
    res.render(`./app/skin/${bsRow.bo_skin_path}/view`, {
      title: `${bsRow.bo_name} 상세보기`,
      bsRow: bsRow,
      row: row,
      fileRow: fileRow,
    });
  } catch (error) {
    console.error(error);
  }
});
//GET 게시판 글쓰기 폼
router.get("/:bo_id/form", verifyToken, async (req, res, next) => {
  try {
    let user_level = req.decoded != undefined ? req.decoded.user_level : 1;
    if (user_level < bsRow.bo_view_level) {
      alert("등록 및 수정을 할 수 있는 권한이 없습니다.", res);
      return;
    }
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

      res.render(`./app/skin/${bsRow.bo_skin_path}/form`, {
        title: `${bsRow.bo_name} 수정`,
        btn_write: "글수정",
        bsRow: bsRow,
        query: req.query,
        fileRow: fileRow,
        row: row,
      });
    } else {
      res.render(`./app/skin/${bsRow.bo_skin_path}/form`, {
        title: `${bsRow.bo_name} 등록`,
        btn_write: "글등록",
        bsRow: bsRow,
      });
    }
  } catch (error) {
    console.error(error);
  }
});
//파일첨부
router.post("/file_upload", upload.single("bo_file"), (req, res) => {
  console.log(req.file);
  try {
    //썸네일 할 때 필요로 함
    const imageExtArray = [".jpeg", ".jpg", ".gif", "png"];
    //이미지 확장자명만 썸네일 시키기
    if (-1 < imageExtArray.indexOf(path.extname(req.file.originalname))) {
      sharp(req.file.path)
        .resize({ width: 640 })
        .withMetadata()
        .toFile(`uploads/thumb_${req.file.filename}`, (err, info) => {
          if (err) throw err;
        });
    }

    console.log(req.file);
    //console.log(path.extname(req.file.originalname));

    res.json(req.file);
  } catch (error) {}
});
//POST 게시판 인서트 및 업데이트
router.post("/:bo_id/form", async (req, res, next) => {
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
      res.redirect(`/app/board/${req.body.f_bo_id}/view/${req.body.id}`);
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
      res.redirect(`/app/board/${req.body.f_bo_id}/list`);
    }
  } catch (error) {
    console.error(error);
  }
});
module.exports = router;
