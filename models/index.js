const Sequelize = require("sequelize");
const env = process.env.NODE_ENV || "development";
const config = require("../config/config")[env];
const User = require("./user");
const UserToken = require("./user_token");
const AppConfig = require("./appconfig");
const Category = require("./category");
const Service = require("./service");
const ServiceOption = require("./service_option");
const ServiceOrder = require("./service_order");
const ServiceOrderOption = require("./service_order_option");
const BoardSetting = require("./board_settings"); //게시판설정 관련 db
const Board = require("./board"); //게시판 관련 db
const BoardComment = require("./board_comment"); //게시판 댓글 관련 db
const BoardFile = require("./board_file"); //게시판 파일 관련 db

const db = {};

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

db.sequelize = sequelize;
db.User = User; //db 모델명 설정
db.UserToken = UserToken;
db.AppConfig = AppConfig;
db.Category = Category;
db.Service = Service;
db.ServiceOption = ServiceOption;
db.ServiceOrder = ServiceOrder;
db.ServiceOrderOption = ServiceOrderOption;
db.BoardSetting = BoardSetting;
db.Board = Board;
db.BoardComment = BoardComment;
db.BoardFile = BoardFile;

User.init(sequelize); //회원 테이블 생성할 수 있게
UserToken.init(sequelize);
AppConfig.init(sequelize);
Category.init(sequelize);
Service.init(sequelize);
ServiceOption.init(sequelize);
ServiceOrder.init(sequelize);
ServiceOrderOption.init(sequelize);
BoardSetting.init(sequelize);
Board.init(sequelize);
BoardComment.init(sequelize);
BoardFile.init(sequelize);

User.associate(db); //회원테이블을 다른 테이블 연결할 수 있게
UserToken.associate(db);
AppConfig.associate(db);
Category.associate(db);
Service.associate(db);
ServiceOption.associate(db);
ServiceOrder.associate(db);
ServiceOrderOption.associate(db);
BoardSetting.associate(db);
Board.associate(db);
BoardComment.associate(db);
BoardFile.associate(db);

module.exports = db;
