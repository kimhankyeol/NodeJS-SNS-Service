module.exports = (sequelize, DataTypes) => (
    sequelize.define('user', {
      email: {
        type: DataTypes.STRING(40),
        allowNull: true,
        unique: true,
      },
      nick: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      provider: {
        type: DataTypes.STRING(10),
        allowNull: false,
        defaultValue: 'local',
      },
      snsId: {
        type: DataTypes.STRING(30),
        allowNull: true,
      },
    }, {
      timestamps: true,
      paranoid: true,
    })
  );
//사용자 정보를 저장 하는 모델임
// 이메일 닉네임 비밀번호를 저장하고 SNS 로그인을 하였을 경우에는 provider와 snsId를 저장함
// provide 가 local 이면 로컬 로그인을 한것 kakao 이면 카카오 로그인 을 한것임 