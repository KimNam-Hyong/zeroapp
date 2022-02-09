const schedule = require("node-schedule");
const fcm_push = require("./fcm_push");
let scheduler = async (req, data, date, token) => {
  try {
    console.log(date);
    schedule.scheduleJob(date, () => {
      fcm_push(
        req,
        "제로브이 서비스 예약",
        `${data.subject}.`,
        token,
        `${data.url}`
      );
      console.log("스케줄러");
    });
  } catch (error) {
    console.error(error);
  }
};

module.exports = scheduler;
