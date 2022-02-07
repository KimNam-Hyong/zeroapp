const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class UserFcm extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "회원아이디", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        fcm_token: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: "토큰값",
          defaultValue: "",
        },
        deviceId: {
          type: Sequelize.TEXT,
          allowNull: false,
          comment: "디바이스 아이디",
          defaultValue: "",
        },
        push_status: {
          type: Sequelize.ENUM("Y", "N"),
          allowNull: false,
          defaultValue: "Y",
          comment: "푸시여부",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "UserFcm", //노드에서 사용할 모델명
        tableName: "user_fcm", //db에서 저장할 테이블명
        paranoid: false, //삭제여부 true를 하게 되면 deleteAt 필드가 나옴 완전 삭제를 하려면 false로 해야 함
        charset: "utf8", //캐릭터셋 설정
        collate: "utf8_general_ci", //db 캐릭터셋
        dialectOptions: {
          dateStrings: true,
          typeCast: true,
        },
      }
    );
  }
  static associate(db) {}
};
