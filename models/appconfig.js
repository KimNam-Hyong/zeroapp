const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class UserToken extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        company: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "회사명", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        com_ceo: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "회사명", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        post_code: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "우편번호",
          defaultValue: "",
        },
        address: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "주소",
          defaultValue: "",
        },
        address2: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "상세주소",
          defaultValue: "",
        },
        com_tel: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "회사전화번호",
          defaultValue: "",
        },
        com_fax: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "회사팩스번호",
          defaultValue: "",
        },
        com_email: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "이메일주소",
          defaultValue: "",
        },
        com_info: {
          type: Sequelize.TEXT("long"),
          allowNull: true,
          comment: "회사팩스번호",
        },
        com_bizno: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "사업자등록번호",
          defaultValue: "",
        },
        com_networkno: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "통신판매업번호",
          defaultValue: "",
        },
        com_private: {
          type: Sequelize.TEXT("long"),
          allowNull: true,
          comment: "개인정보처리방침",
        },
        com_use_terms: {
          type: Sequelize.TEXT("long"),
          allowNull: true,
          comment: "이용약관",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "AppConfig", //노드에서 사용할 모델명
        tableName: "app_config", //db에서 저장할 테이블명
        paranoid: false, //삭제여부 true를 하게 되면 deleteAt 필드가 나옴 완전 삭제를 하려면 false로 해야 함
        charset: "utf8mb4", //캐릭터셋 설정
        collate: "utf8mb4_general_ci", //db 캐릭터셋
      }
    );
  }
  static associate(db) {}
};
