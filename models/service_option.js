const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class ServiceOption extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        option_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "옵션명",
          defaultValue: "",
        },
        option_price: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          comment: "옵션가격",
          defaultValue: 0,
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "ServiceOption", //노드에서 사용할 모델명
        tableName: "service_option", //db에서 저장할 테이블명
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
    db.ServiceOption.belongsTo(db.Service, {
      foreignKey: "service_id",
      targetKey: "id",
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
};
