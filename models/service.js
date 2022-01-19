const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class Service extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "회원아이디", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        ca_code: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "분류코드",
          defaultValue: "",
        },
        service_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "서비스명",
          defaultValue: "",
        },
        service_price: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          comment: "서비스가격",
          defaultValue: 0,
        },
        service_info: {
          type: Sequelize.TEXT("long"),
          allowNull: true,
          comment: "서비스 내용",
        },
        service_photo1: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "사진1",
          defaultValue: "",
        },
        service_photo2: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "사진2",
          defaultValue: "",
        },
        service_photo3: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "사진3",
          defaultValue: "",
        },
        service_photo4: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "사진4",
          defaultValue: "",
        },
        service_photo5: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "사진5",
          defaultValue: "",
        },
        service_status: {
          type: Sequelize.TINYINT,
          allowNull: false,
          comment: "서비스 상태 0: 서비스 안함 1: 서비스 함",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "Service", //노드에서 사용할 모델명
        tableName: "service", //db에서 저장할 테이블명
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
  static associate(db) {
    db.Service.hasMany(db.ServiceOption, {
      foreignKey: "service_id",
      soruceKey: "id",
    });
  }
};
