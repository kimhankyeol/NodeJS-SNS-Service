exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
      next();
    } else {
      res.status(403).send('로그인 필요');
    }
  };
  
  exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
      next();
    } else {
      res.redirect('/');
    }
  };
/*
Passport는 req 객체에 isAuthenticated 메서드를 추가함 
로그인 중이면 req.isAuthenticated()   true고 아니면 false 임
따라서 로그인 여부를 이 메서드를 파악할 수 있음
라우터 중에 로그아웃 라우터나 이미지 업로드 라우터 등은 로그인한 사람만 접근할 수 있게 해야 하고
회원가입 라우터나 로그인 라우터는 로그인하지 않은 사람만 접근할 수 있게 해야함
라우터에 로그인 여부를 검사하는 미들웨어를 넣어 걸러낼수 있음

isLoggedIn 과 isNotLoggedIn 미들웨어를 만들었음 
이 미들웨어가 page 라우터에 어떻게 사용되는지 봄
*/