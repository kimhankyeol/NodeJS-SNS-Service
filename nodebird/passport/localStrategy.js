const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const { User } = require('../models');

module.exports = (passport) => {
    //1.
    /*
    LocalStrategy 의 첫번쨰 인자로 주어진 객체는 전략에 관한 설정을 하는곳 
     usernameField,passwordField에는 일치하는 req.body의 속성명을 적어주면됨
     req.body의 속성명을 적어주면 됨
     req.body.email,req.body.password 로 들어오므로 각각 email , password    
    */
   passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
  },
    //2.
    /*
    실제 전략을 수행하는 async 함수 임
    LocalStrategy 두번쨰 인자로 들어감
    위에서 넣어준 email , password 는 1,2 번쨰 매개변수가 됨 세번쨰 매개변수인 done 함수는 passport.authenticate 의 콜백함수임
    */
   async (email, password, done) => {
    try {
      const exUser = await User.find({ where: { email } });
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password);
        if (result) {
          done(null, exUser);
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};
/*
먼저 사용자 데이터베이스에서 일치하는 이메일이 있는지 찾은후 있다면 bcrypt 의 compare 함수로 비밀번호를 비교함 
비밀번호까지 일치했다면 done 함수의 두번째 인자로 사용자 정보를 넣어 보냄 .
두번쨰 인자를 사용하지 않는 경우는 로그인에 실패했을경우임 
done 함수는 첫번쨰 인자를 사용하는 경우는 서버쪽에서 에러가 났을경우
세번쨰 인자는 로그인 처리과정에서 비밀번호가 일치하지 않거나 존재하지 않는 회원일떄 같은 사용자 정의 에러가 발생하였을떄

done 이 호출된 후에는 다시 passport.authenticate의 콜백함수에서 나머지 로직이 실행도미
로그인 성공했으면 메인페이지로 리다이렉트 되면서 로그인 폼 대신 회원정보가 뜰것 
아직 auth 라우터를 연결하지 않았으므로 코드가 동작하지 않음 
카카오 로그인 까지 구현 한후 연결

*/