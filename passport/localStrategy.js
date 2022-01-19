const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy; //로컬 패스포트 인증 모듈
const bcrypt = require("bcrypt"); //암호화복호화 모듈
const User = require("../models/user");

require("dotenv").config();
module.exports = () => {
  passport.use(
    new LocalStrategy(
      (LocalStrategyOption = {
        usernameField: "user_id",
        passwordField: "user_password",
      }),
      async (user_id, user_password, done) => {
        try {
          console.log(user_password);
          const userRow = await User.findOne({ where: { user_id } });
          //회원 디비에 값이 있으면
          if (userRow) {
            const result = await bcrypt.compare(
              user_password,
              userRow.user_password
            ); //암호를 복호화하고 비교하기
            //done 함수를 쓰게 되면 받는 것은 routes/user.js에 req.login 함수에서 받아와서 실행이 됨
            if (result) {
              done(null, userRow); //비밀번호가 일치가 되면 로그인 성공 ->
            } else {
              done(null, false, { message: "비밀번호가 일치하지 않습니다." }); //비밀번호가 일치가 안되면 오류 표시
            }
          } else {
            done(null, false, { message: "가입되지 않은 회원입니다." });
          }
        } catch (err) {
          console.error(err);
          done(err);
        }
      }
    )
  ); //패스포트 로그인할 때 필요
};
