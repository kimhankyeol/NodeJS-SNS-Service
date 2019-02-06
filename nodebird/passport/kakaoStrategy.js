const KakaoStrategy = require('passport-kakao').Strategy;

const { User } = require('../models');
 //1.
    /*
    로컬 로그인과 마찬가지로 카카오 로그인에 대한 설정을 함 
    clientID는 카카오에서 발급해주는 ID 임 
    노출 x process.env 로 설정  
    callbackURL 카카오로부터 인증결과를 받을  라우터 주소 
    */
module.exports = (passport) => {
  passport.use(new KakaoStrategy({
    clientID: process.env.KAKAO_ID,
    callbackURL: '/auth/kakao/callback',
  }, 
    //2.
    /*
    먼저 기존에 카카오 로그인한 사용자가 있는지 조회 있으면 done 함수 호출
    */
  async (accessToken, refreshToken, profile, done) => {
    try {
      const exUser = await User.find({ where: { snsId: profile.id, provider: 'kakao' } });
      if (exUser) {
        done(null, exUser);
      } 
         //.3
            /* 회원이 없다면 회원가입 진행 
            카카오에서 인증후 callbackURL에 적힌 주소로 accessToken,refreshToken 과 profile 을 보내줌
            데이터는 console.log() 확인해봐야됨
            profile 객체에서 원하는 정보를 꺼내와 회원가입을 하면도미 
            사용자를 생성한뒤 done 함수를 호출함
            */
      else {
        const newUser = await User.create({
          email: profile._json && profile._json.kaccount_email,
          nick: profile.displayName,
          snsId: profile.id,
          provider: 'kakao',
        });
        done(null, newUser);
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};