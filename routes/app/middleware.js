const jwt = require("jsonwebtoken");
const { User, UserToken, sequelize } = require("../../models");

exports.verifyToken = async (req, res, next) => {
  const uuid = req.cookies.uuid;
  try {
    console.log(`uuid : ${uuid}`);
    const row = await sequelize.query(
      `select * from user_token where uuid='${uuid}' order by id desc limit 1`,
      {
        nest: true,
      }
    );

    //액세스 토큰값이 살아 있으면 화면 그대로 놔두고
    req.decoded = jwt.verify(
      row[0].access_token,
      process.env.ACCESS_TOKEN_SECRET
    );
    res.cookie("uuid", req.cookies.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
    return next();
  } catch (error) {
    console.log(`error : ${error}`);
    try {
      const row = await sequelize.query(
        `select * from user_token where uuid='${uuid}' order by id desc`,
        {
          nest: true,
        }
      );

      //리프레시 토큰값 살아 있으면
      req.decoded = jwt.verify(
        row[0].refresh_token,
        process.env.REFRESH_TOKEN_SECRET
      );

      if (req.decoded.user_id.length != 0) {
        const userRow = await User.findOne({
          where: { user_id: row[0].user_id },
        });

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
        res.cookie("uuid", req.cookies.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
        req.login(userRow, () => {
          req.decoded = jwt.verify(
            access_token,
            process.env.ACCESS_TOKEN_SECRET
          );
        });
        return next();
      }
    } catch (error) {
      res.cookie("uuid", req.cookies.uuid); //고유 아이피 또는 디바이스 값을 쿠키로 구움
      return next();
    }
  }
};
