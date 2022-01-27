const express = require("express");
const jwt = require("jsonwebtoken");
const { User, UserToken, sequelize } = require("../../models");
const bcrypt = require("bcrypt"); //암호화복호화 모듈
const router = express.Router();
//이거는 필수 user view에서 user를 쓰기 위함
router.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
//로그인을 할 때
router.post("/auth", async (req, res, next) => {
  try {
    console.log(req.body);
    const row = await User.findOne({ where: { user_id: req.body.user_id } });
    //로그인 정보가 있을 경우
    if (row) {
      console.log(req.body.user_password);
      console.log(row.user_password);
      const passwordCheck = await bcrypt.compare(
        req.body.user_password,
        row.user_password
      );
      console.log(passwordCheck);
      //패스워드가 일치가 되면 json으로 표시하기
      if (passwordCheck) {
        //액세스 토큰 값 발급하기
        const access_token = jwt.sign(
          {
            type: "ACCESS",
            user_id: req.body.user_id,
            user_level: row.user_level,
          },
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1m",
            issuer: "제로브이 액세스토큰",
          }
        );
        //리프레시 토큰 값 발급하기
        const refresh_token = jwt.sign(
          {
            type: "REFRESH",
            user_id: req.body.user_id,
          },
          process.env.REFRESH_TOKEN_SECRET,
          {
            expiresIn: "30 days",
            issuer: "제로브이 리프레시토큰",
          }
        );
        //토큰값 db에 저장하기
        await UserToken.create({
          user_id: req.body.user_id,
          access_token: access_token,
          refresh_token: refresh_token,
          uuid: req.body.uuid,
        }).then((result) => {
          if (result) {
            //세션 지정하기
            req.login(row, () => {
              res.cookie("uuid", req.body.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
              return res.json({ success: true, msg: "" });
            });
          }
        });

        //패스워드가 일치가 안 되면 json으로 표시하기
      } else {
        return res.json({ success: false, msg: "비밀번호가 맞지 않습니다." });
      }
    } else {
      return res.json({ success: false, msg: "로그인 정보가 맞지 않습니다" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ success: false, msg: "로그인 정보가 맞지 않습니다." });
  }
});
//POST 토큰값 확인하기
router.post("/token", async (req, res, next) => {
  try {
    const row = await sequelize.query(
      `select * from user_token where uuid='${req.body.uuid}' order by id desc limit 1`,
      {
        nest: true,
      }
    );

    //액세스 토큰값이 살아 있으면 화면 그대로 놔두고
    const accessToken = jwt.verify(
      row[0].access_token,
      process.env.ACCESS_TOKEN_SECRET
    );
    if (accessToken === undefined) {
      console.log("액세스 토큰 없음");
    }
    const userRow = await User.findOne({
      where: { user_id: row[0].user_id },
    });
    console.log("token : " + accessToken);
    res.cookie("uuid", req.body.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
    //토큰값이 살아 있을 때
    if (typeof req.user.user_id !== "undefined") {
      res.json({ is_login: true, is_refresh: false, msg: "" });
    } else {
      req.login(userRow, () => {
        return res.json({ is_login: true, is_refresh: true, msg: "" });
      });
    }
    next();
  } catch (error) {
    console.log(error);
    try {
      const row = await sequelize.query(
        `select * from user_token where uuid='${req.body.uuid}' order by id desc`,
        {
          nest: true,
        }
      );
      const userRow = await User.findOne({
        where: { user_id: row[0].user_id },
      });
      if (row.length != 0) {
        //리프레시 토큰값 살아 있으면
        req.decoded = jwt.verify(
          row[0].refresh_token,
          process.env.REFRESH_TOKEN_SECRET
        );

        if (req.decoded.user_id.length != 0) {
          //액세스토큰 재발급
          //액세스 토큰 값 발급하기
          const access_token = jwt.sign(
            {
              type: "ACCESS",
              user_id: row[0].user_id,
              user_level: userRow.user_level,
            },
            process.env.ACCESS_TOKEN_SECRET,
            {
              expiresIn: "1m",
              issuer: "제로브이 액세스토큰",
            }
          );
          console.log(access_token);
          //리프레시 토큰 값 발급하기
          const refresh_token = jwt.sign(
            {
              type: "REFRESH",
              user_id: row[0].user_id,
            },
            process.env.REFRESH_TOKEN_SECRET,
            {
              expiresIn: "30 days",
              issuer: "제로브이 리프레시토큰",
            }
          );
          //리프레시 토큰 재발급
          const updateRow = await UserToken.update(
            {
              access_token: access_token,
              refresh_token: refresh_token,
            },
            {
              where: { id: row[0].id },
            }
          );
          console.log(updateRow);

          req.login(userRow, () => {
            res.cookie("uuid", req.body.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
            return res.json({ is_login: true, is_refresh: true, msg: "" });
          });
        }
      } else {
      }
    } catch (error) {
      req.logout();
      console.log(error);
      res.json({ is_login: false });
    }
  }
});

module.exports = router;
