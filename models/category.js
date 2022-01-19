const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class UserToken extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        ca_code: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "분류코드", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        ca_name: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "분류명",
          defaultValue: "",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "Category", //노드에서 사용할 모델명
        tableName: "category", //db에서 저장할 테이블명
        paranoid: false, //삭제여부 true를 하게 되면 deleteAt 필드가 나옴 완전 삭제를 하려면 false로 해야 함
        charset: "utf8mb4", //캐릭터셋 설정
        collate: "utf8mb4_general_ci", //db 캐릭터셋
      }
    );
  }
  static associate(db) {}
};
