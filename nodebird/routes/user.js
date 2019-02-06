const express = require('express');

const { isLoggedIn } = require('./middlewares');
const { User } = require('../models');

const router = express.Router();

router.post('/:id/follow', isLoggedIn, async (req, res, next) => {
  try {
    const user = await User.find({ where: { id: req.user.id } });
    await user.addFollowing(parseInt(req.params.id, 10));
    res.send('success');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


module.exports = router;
/*
다른 사용자가 팔로우 할수 있는 /user/:id/follow 라우터임
:id 부분이 req.params.id 가 됨 
먼저 팔로우할 사용자를 데이터베이스에서 조회한후 시퀄라이즈에서 추가한 addFollowing 메서드로 현재 로그인한 사용자와의 관계를 지정함
팔로잉 관계가 생겼으므로 req.user에도 팔로워와 팔로잉 목록을 저장함
req.user를 바꾸려면 deserializeUser를 조작해야됨
*/