const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const { User } = require('../models');

module.exports = (passport) => {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.find({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });

  local(passport);
  kakao(passport);
};
    //모듈 내부를 보면 passport.serializeUser 와 passport.deserealizeUser 가 있음
    //이 부분이 Passport 를 이해하는 핵심
    /*
    serializeUser는 req.session 객체에 어떤 데이터를 저장할지 선택함
    매개변수로 user 를 받아 done 함수의 첫번째 인자는 에러 발생시  사용하는 것이고  두번쨰 인자로 user.id 넘기고 있음 두번쨰 인자가 중요함 
    세션에 사용자 정보를 모두 저장하면세션의 용량이 커지고 데이터 일관성에 문제가 발생하므로 사용자의 아이디만 저장하라고 명령한것임
    
    deserializeUser 는 매 요청시 실행됨 
    passport.session() 미들웨어가 이 메서드를 호출함
    좀 전에 serializeUser에서 세션에 저장했던 아이디를 받아 데이터베이스에서 사용자 정보를 조회함 
    조회한 정보를 req.user에 저장하므로 앞으로 req.user를 통해 로그인한 사용자의 정보를 가져올 수 있음

    순서는 serializeUser 에 user.id 를 deserealizeUser id로 받아오고 then 에서 done의 user는 req.user 에 저장됨
    즉 serializeUser 는 사용자 정보 객체를 세션에 아이디로 저장하는것
    deserializeUser는 세션에 저장한 아이디를 통해 사용자 정보객체를 불러오는것
    세션에 불필요한 데이터를 담아두지 않기 위한 과정임
    전체과정
    1.  로그인 요청 들어옴
    2.passport.authenticate 메서드 호출
    3.로그인 전략 수행
    4. 로그인 성공시 사용자 정보 객체와 함께 req.login 호출
    5.req.login 메서드가 passport.serializeUser 호출
    6.req.session에 사용자 아이디만 저장
    7.로그인 완료

    1~4 로컬 로그인을 구현하면서 상응하는 코드를 보게 될 것임
    다음은 로그인 이후의 과정임
    1.모든 요청을 passport.session() 미들웨어가 passport.deserealizeUser 메서드호출
    2.req.session 저장된 아이디로 데이터베이스에서 사용자 조회
    3.조회된 사용자 정보를 req.user에 저장
    4.라우터에서 req.user 객체 사용 가능

    localStrategy 와 kakaoStrategy 파일은 각각 로컬 로그인과 카카오 로그인 전략에 대한 파일임
    Passport 는 로그인 시의 동작을 전략이라는 용어로 표현하고 있음
    로그인과정을 어떻게 처리할지 설명하는 파일
    */

/*
include:[
      {model:User,attributes:['id','nick'],as:'Followers'},
      {model:User,attributes:['id','nick'],as:'Followings'}
      ]

      세션에 저장된 아이디로 사용자 정보를 조회할때 팔로잉 목록과 팔로워 목록도 같이 조회함
      include에서 계속 attributes 를 지정하고 있는데 이는 실수로 비밀번호를 조회하는 것을 방지하기 위해서임
      
*/