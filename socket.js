const SocketIO = require("socket.io");
module.exports = (server, app, sessionMiddleware) => {
  const io = SocketIO(server, { path: "/socket.io" });
  app.set("io", io);
  const service = io.of("/service");
  //서비스 예약시 실시간으로 알림이 가게
  service.on("service", (socket) => {
    //관리자 소켓 연결시키기
    let adminId = "";
    socket.on("adminJoin", (data) => {
      console.log(`socket : 소켓연결`);
      adminId = data.user_id;
      socket.join(adminId);
    });
    //고객이 서비스 신청을 하면 관리자모드에서 확인할 수 있게
    socket.on("serviceSend", (data) => {
      socket.to(adminId).emit(data);
    });
  });
};
