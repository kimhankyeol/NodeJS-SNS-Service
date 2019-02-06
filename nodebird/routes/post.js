const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { Post, Hashtag, User } = require('../models');
const { isLoggedIn } = require('./middlewares')

//1.
/*
fs 모듈은 이미지를 업로드할 uploads 폴더가 없을떄 upload 폴더를 생성함
이렇게 노드를 통해 코드로 생성할수 있어 편리함
*/

const router = express.Router();
fs.readdir('uploads',(error)=>{
    if(error){
        console.error('uploads 폴더가 없어 uploads 폴더를 생성함');
        fs.mkdirSync('uploads');
    }
});
//2.
/*
Multer모듈에 옵션을 주어 upload 변수에 대입하였음
upload 는 미들웨어를 만드는 객체가 됨
옵션으로는 storage 속성과 limits 속성을 줌 
storage에는 파일저장방식과 경로 파일명등을 설정할수 있음
diskStorage를 사용해 이미지가 서버디스크에 저장되도록 했고 diskStorage의 destination메서드로 저장경로를 nodebird 폴더 아래 uploads폴더로 지정함
파일명은 filename 메서드로 기존 이름 (file.originalname) 에 업로드 날짜값(new Date().valueOf())과 확장자(path.extname)를 붙이도록 설정함
업로드 날짜값을 붙이는 이유는 파일명이 중복되는것을 막기 위해서임 
limits 속성은 최대 이미지 파일용량 허용치(바이트 단위)를 의미함
현재 10MB로 설정
upload 변수는 미들웨어를 만드는 여러가지 메서드를 가짐 single,array,fields,none 임 
single 은 하나의 이미지를 업로드할떄 사용하며 req.file 객체를 생성 
array와 fields 는 여러개의 이미지를 업로드할떄 사용하며 req.files로 생성 
array와 fields 의 차이점은 이미지를 업로드한 body 속성개수임
속성하나에 이미지를 여러개 업로드 했다면 array , 여러개의 속성에 이미지를 하나씩 업로드 했다면 fields 를 사용함
none 은 이미지를 올리지않고 데이터만 multipart 형식으로 전송했을떄 사용함
*/
const upload = multer({
    storage: multer.diskStorage({
      destination(req, file, cb) {
        cb(null, 'uploads/');
      },
      filename(req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, path.basename(file.originalname, ext) + new Date().valueOf() + ext);
      },
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
  });

/*
이미지업로드를 처리하는 라우터임 
이 라우터에서는 single 미들웨어를 사용하고 있음
single 메서드에 이미지가 담긴 req.body 속성의 이름을 적어줌 
현재 nodebird 앱에서 ajax 로 이미지로 보낼때 속성이름을 img 로 하고있음
이제 upload.single 미들웨어는 이 이미지를 처리하고 req.file객체에 결과를 저장함

객체안에 req.filefilename 을 클라이언트로 보내서 나중에 게시글을 동록할떄 사용할수 있게함

*/
router.post('/img', isLoggedIn, upload.single('img'), (req, res) => {
    console.log(req.file);
    res.json({ url: `/img/${req.file.filename}` });
  });


//4.
/*
게시글 업로드를 처리하는 라우터임 
이미지를 업로드 했으면 이미지 주소고 req.body.url 로 전송됨
데이터 형식이 multipart 이긴 하지만 이미지 데이터가 들어있지않으므로 none() 을 사용함
이미지 주소가 온것이지 이미지 데이터 자체가 온것이 아님
게시글을 데이터베이스에 저장한후 게시글 내용에서 해시태그를 정규 표현식으로 추출해냄
추출한 해시태그들을 데이터 베이스에 저장한후 
post.addHashtags 메서드로 게시글과 해시태그의 관계를 PostHashtag테이블에 넣음
*/
const upload2 = multer();
router.post('/', isLoggedIn, upload2.none(), async (req, res, next) => {
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id,
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    if (hashtags) {
      const result = await Promise.all(hashtags.map(tag => Hashtag.findOrCreate({
        where: { title: tag.slice(1).toLowerCase() },
      })));
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect('/');
  } catch (error) {
    console.error(error);
    next(error);
  }
});


/*
해시태그로 조회하는 /post/hashtag 라우터임 
쿼리스트링으로 해시태그 이름을 받고 해시태그가 빈 문자열인 경우 메인페이지로 돌려보냄
데이터베이스에서 해당 해시태그가 존재하는지 검색한후 있다면 시퀄라이즈에서 제공하는 getPosts 메서드로 모든 게시글을 가져옴
가져올땐 작성자 정보를 JOIN함
조회후 메인페이지를 렌더링하면서 전체 게시글 대신 조회된 게시글만 twits 에 넣어 렌더링함
*/
router.get('/hashtag', async (req, res, next) => {
    const query = req.query.hashtag;
    if (!query) {
      return res.redirect('/');
    }
    try {
      const hashtag = await Hashtag.find({ where: { title: query } });
      let posts = [];
      if (hashtag) {
        posts = await hashtag.getPosts({ include: [{ model: User }] });
      }
      return res.render('main', {
        title: `${query} | NodeBird`,
        user: req.user,
        twits: posts,
      });
    } catch (error) {
      console.error(error);
      return next(error);
    }
  });
  
module.exports = router;