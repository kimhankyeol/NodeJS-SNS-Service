const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn,isNotLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();
//1
/*
회원 가입 라우터임 
기존에 같은 이메일로 가입한 사용자가 있는지 조회한뒤 있다면 flash 메시지를 설정하고 회원가입페이지로 되돌려 보냄
없으면 비밀번호를 암호화하고 사용자 정보를 생성함
회원가입시 비밀번호는 암호화해서 저장해야함
이번에는 bcrypt모듈을 사용함 
(crypto 모둘의 pbkdf2메서드를 사용해서 암호화할 수도 있음)
bcrypt모듈의 hash 메서드를 사용하면손쉽게 비밀번호를 암호화 할수 있음
bcrypt의 두번째인자는 pbdkdf2의 반복횟수와 비슷한 기능을함
숫자가 커질수록 비밀번호를 알아내기 어려워 하지만 암호화시간도 오래걸림
12이상을 추천함
31까지 사용함
*/
router.post('/join', isNotLoggedIn, async (req, res, next) => {
    const { email, nick, password } = req.body;
    try {
      const exUser = await User.find({ where: { email } });
      if (exUser) {
        req.flash('joinError', '이미 가입된 이메일입니다.');
        return res.redirect('/join');
      }
      const hash = await bcrypt.hash(password, 12);
      await User.create({
        email,
        nick,
        password: hash,
      });
      return res.redirect('/');
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
//2
/*
로그인 라우터
passport.authenticate('local')미들웨어가 로컬 로그인 전략을 수행함
미들웨어인데 라우터 미들웨어 안에 있음 
미들웨어에 사용자 정의기능을 추가하고 싶을떄 이렇게함
이떄는 내부 미들웨어에 (req,res,next) 인자로 제공해서 호출하면됨
전략코드는 나중에 작성 
전략이 성공하거나 실패하면 authenticate 메서드의 콜백함수가 실행도미
콜백함수의 첫번째 인자 값(authError)이 있다면 실패, 두번쨰 인자값있으면 성공한것 이고 req.login 메서드를 호출함
Passport 는 req 객체에 login과 logout 메서드를 추가함 req.login은 passport.serializeUser를 호출함
req.login에 제공하는 user 객체가 serializeUser로 넘어가게됨
*/
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (authError, user, info) => {
      if (authError) {
        console.error(authError);
        return next(authError);
      }
      if (!user) {
        req.flash('loginError', info.message);
        return res.redirect('/');
      }
      return req.login(user, (loginError) => {
        if (loginError) {
          console.error(loginError);
          return next(loginError);
        }
        return res.redirect('/');
      });
    })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
  });

//3
/*
로그아웃 라우터 
req.logout 메서드는 req.user객체를 제거하고, req.session.destroy는 req.session객체의 내용을 제거함 
*/
router.get('/logout', isLoggedIn, (req, res) => {
    req.logout();
    req.session.destroy();
    res.redirect('/');
  });
  


//나중에 app.js 와 연결할떄 /auth 접두사를 붙일것이므로 라우터의 주소는 각각 /auth/join,/auth/login,/auth/logout 이 됨

//카카오 로그인 라우터
router.get('/kakao',passport.authenticate('kakao'));
router.get('/kakao/callback',passport.authenticate('kakao',{
    failureRedirect:'/'
}),(req,res)=>{
    res.redirect('/');
});
/*
GET /auth/kakao 로 접근하면 카카오 로그인 과정이 시작됨
layout.pug 카카오톡 버튼에 /auth/kakao 링크 붙어있음  카카오로그인창으로 리다이렉트를 하고 
GET /auth/kakao/callback 으로 받음  
이 라우터에서는 카카오 로그인 전략을 수행함
로컬 로그인과는 다른 점은 passport.authenticate 메서드에 콜백함수를 제공하지 않는점
콜백함수대신 로그인 실패했을떄 어디로 이동할지를 객체 안 failureRedirect 속성에 적어주고 성공시에도 어디로 이동할지 다음 미들웨어에 적어줌
*/


module.exports = router;