const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class ServiceOrder extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        order_no: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "예약번호",
          defaultValue: "",
        },
        service_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          comment: "서비스상품아이디",
          defaultValue: 0,
        },
        service_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "서비스명",
          defaultValue: "",
        },
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "서비스예약자 아이디",
          defaultValue: "",
        },
        user_name: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "서비스예약자 이름",
          defaultValue: "",
        },
        user_tel: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "서비스예약자 연락처",
          defaultValue: "",
        },
        user_email: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "서비스예약자 이메일",
          defaultValue: "",
        },
        user_addr1: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "서비스예약자 기본주소",
          defaultValue: "",
        },
        user_addr2: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "서비스예약자 상세주소",
          defaultValue: "",
        },
        service_size: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "청소및방역 평수",
          defaultValue: "",
        },
        service_price: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: false,
          comment: "청소및방역 가격",
          defaultValue: 0,
        },
        service_date: {
          type: Sequelize.STRING(20),
          allowNull: false,
          comment: "예약시간",
          defaultValue: "",
        },
        service_status: {
          type: Sequelize.ENUM("확인전", "확인완료", "서비스완료", "취소"),
          allowNull: true,
          comment: "서비스상태",
          defaultValue: "확인전",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "ServiceOrder", //노드에서 사용할 모델명
        tableName: "service_order", //db에서 저장할 테이블명
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
    db.ServiceOrder.hasMany(db.ServiceOrderOption, {
      foreignKey: "order_id",
      soruceKey: "id",
    });
  }
};
