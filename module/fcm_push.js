//푸시를 보내는 모듈
const fcm = require("firebase-admin");
let setAccount = require("../zerovapp-firebase-adminsdk-lfw34-5ca40bfca5.json");
fcm.initializeApp({
  credential: fcm.credential.cert(setAccount),
});

const push = async (req, subject, msg, tokens, url) => {
  try {
    let message = {
      data: {
        subject: subject,
        message: msg,
        goUrl: url,
      },
      token: tokens,
    };
    fcm
      .messaging()
      .send(message)
      .then((result) => {})
      .catch((err) => {});
  } catch (error) {
    console.error(error);
  }
};
module.exports = push;
