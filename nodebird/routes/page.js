const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { Post, User } = require('../models');

const router = express.Router();

router.get('/profile', isLoggedIn, (req, res) => {
  res.render('profile', { title: '내 정보 - NodeBird', user: req.user });
});

router.get('/join', isNotLoggedIn, (req, res) => {
  res.render('join', {
    title: '회원가입 - NodeBird',
    user: req.user,
    joinError: req.flash('joinError'),
  });
});

router.get('/', (req, res, next) => {
  Post.findAll({
    include: {
      model: User,
      attributes: ['id', 'nick'],
    },
    order: [['createdAt', 'DESC']],
  })
    .then((posts) => {
      res.render('main', {
        title: 'NodeBird',
        twits: posts,
        user: req.user,
        loginError: req.flash('loginError'),
      });
    })
    .catch((error) => {
      console.error(error);
      next(error);
    });
});

module.exports = router;

//  /profile /join  /  까지 세개의 페이지로 구성 회원 가입과 로그인 시 에러 메시지를 보여주기 위해 /join 과 / 에는 flash 메시지가 연결되어 있음
//render 메서드안의 twits와 user 는 각각 빈 배열 null 이지만 나중에 넣을것임


/*
자신의 프로필은 로그인을 해야 볼 수 있으므로 isLoggedIn 미들웨어를 사용함
req.isAuthenticated() 가 true 여야 next() 호출되어 res.render 가 있는 미들웨어로 넘어갈수있음
false 라면로그인창이 있는 메인 페이지로 리다이렉트 됨

회원가입 페이지는 로그인을 하지 않은 사람에게만 보여야함 
따라서 isNotLoggedIn미들웨어로 req.isAuthenticated() 가 false 일떄만 next() 호출 하도록 함
로그인 여부로만 미들웨어를 만들수 있는것이 아니라 팔로잉 여부 관리자 여부등의 미들웨어를 만들수 있으므로 다양하게 활용할 수 있음
res.render 메서드에서 user속성에 req.user를 넣은 것을 주목함
pug에서 user 객체를 통해  사용자 정보에 접근할 수 있게 됨
*/

/*
먼저 데이터베이스에서 게시글을 조회한뒤 결과를 twits 에 넣어 렌더링함
조회할떄 게시글 작성자의 아이디와 닉네임을 Join해서 제공하고 게시글의 순서는 최신순으로 정렬함
*/

