const passport = require("passport");
const local = require("./localStrategy"); //로컬 요청시 유효성체크하는 곳
const User = require("../models/user"); //회원 디비 가져오기

module.exports = () => {
  //로그인을 하게 되면 먼저 여기에 들어옴
  passport.serializeUser((user, done) => {
    console.log(user);
    done(null, user.user_id); //세션 할당 express.session에 할당
  });
  //세션요청시 마다 응답해주는 함수(새로고침,브라우저 끄고 다시 켤 때,컴퓨터 재부팅할 때 적용)
  passport.deserializeUser((user_id, done) => {
    console.log(user_id);
    User.findOne({ where: { user_id } }) //회원이 있는지 조회
      .then((user) => done(null, user)) //세션 재할당하기
      .catch((err) => done(err)); //오류 발생시키기
  });
  local();
};
