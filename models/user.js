const Sequelize = require("sequelize");
const { sequelize } = require("sequelize");
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        user_id: {
          type: Sequelize.STRING(255),
          allowNull: false, //null 허용 안함
          comment: "회원아이디", //코멘트 달기
          defaultValue: "", //디폴트 값
        },
        user_password: {
          type: Sequelize.STRING(255),
          allowNull: false,
          comment: "회원비밀번호",
          defaultValue: "",
        },
        user_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "회원이름",
          defaultValue: "",
        },
        user_company: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "회원회사명",
          defaultValue: "",
        },
        user_bizno: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "사업자등록번호",
          defaultValue: "",
        },
        user_biz_cat: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "사업종류",
          defaultValue: "",
        },
        user_bank: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "은행명",
          defaultValue: "",
        },
        user_acc_info: {
          type: Sequelize.STRING(100),
          allowNull: false,
          comment: "계좌번호",
          defaultValue: "",
        },
        user_postcode: {
          type: Sequelize.STRING(10),
          allowNull: true,
          comment: "우편번호",
          defaultValue: "",
        },
        user_addr1: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "기본주소",
          defaultValue: "",
        },
        user_addr2: {
          type: Sequelize.STRING(255),
          allowNull: true,
          comment: "상세주소",
          defaultValue: "",
        },
        user_lat: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          comment: "위도",
          defaultValue: 0,
        },
        user_lng: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          comment: "경도",
          defaultValue: 0,
        },
        user_tel: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: "회원연락처",
          defaultValue: "",
        },
        user_hp: {
          type: Sequelize.STRING(20),
          allowNull: true,
          comment: "회원휴대폰",
          defaultValue: "",
        },
        user_level: {
          type: Sequelize.INTEGER.UNSIGNED,
          allowNull: true,
          comment: "회원레벨",
          defaultValue: 2,
        },
        user_email_status: {
          type: Sequelize.ENUM("Y", "N"),
          allowNull: false,
          comment: "이메일인증",
          defaultValue: "N",
        },
        removeAt: {
          type: Sequelize.DATE,
          allowNull: true,
          comment: "탈퇴일",
        },
      },
      {
        sequelize,
        timestamps: true, //등록일과 수정일 자동으로 생성이 되어지고 인서트 및 업데이트도 자동으로 되어진다.
        underscored: false, //캐멀캐이스 -> 뭔 뜻인지 모르겠음
        modelName: "User", //노드에서 사용할 모델명
        tableName: "users", //db에서 저장할 테이블명
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
