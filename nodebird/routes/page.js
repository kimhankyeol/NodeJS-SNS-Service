const express = require('express');

const router = express.Router();

router.get('/profile',(req,res)=>{
    res.render('profile',{title:'내 정보 - NodeBird',user:null});
});

router.get('/join',(req,res)=>{
    res.render('join',{
        title:'회원가입-nodebird',
        user:null,
        joinError:req.flash('joinError')
    });
});

router.get('/',(req,res,next)=>{
    res.render('main',{
        title:'NodeBird Main',
        twits:[],
        user:null,
        loginError:req.flash('loginError')
    });
});


module.exports = router;

//  /profile /join  /  까지 세개의 페이지로 구성 회원 가입과 로그인 시 에러 메시지를 보여주기 위해 /join 과 / 에는 flash 메시지가 연결되어 있음
//render 메서드안의 twits와 user 는 각각 빈 배열 null 이지만 나중에 넣을것임