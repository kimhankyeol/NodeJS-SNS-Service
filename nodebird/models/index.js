const Sequelize = require('sequelize');
const env  = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

const sequelize = new Sequelize(
  config.database, config.username, config.password,config
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;
db.User = require('./user')(sequelize,Sequelize);
db.Post = require('./post')(sequelize,Sequelize);
db.Hashtag  =  require('./hashtag')(sequelize,Sequelize);
//User 모델과 Post 모델은 1:N 관계에 있으므로 hasMany 와 belongsTo 로 연결되어 있음 , 시퀄라이즈  Post 모델에 userId 컬럼을 추가함
db.User.hasMany(db.Post);
db.Post.belongsTo(db.User);

//Post 와 Hashtag 모델에서 N:M 다대다 관계가 나옴 
/*
게시글 하나는 해시태그는 여러개 가질수 있고 해시태그 하나도 게시글을 여러개 가질수 있음
시퀄라이즈에서는 N:M 관계를 belongsToMany 메서드로 정의합니다.
N:M 관계에서는 중간에 관계 테이블이 생성됨
시퀄라이즈가 관계를 분석하여 PostHashtag 라는 이름으로 테이블을 자동 생성함 
컬럼이름 postId 와 hashTagId 임
Post 와 Hashtag 모델의 관계에서는 시퀄라이즈는 post  데이터에는  getHashtags ,addHashtags 등의 메서드를 추가하고 hashtag데이터에는 getPosts,addPosts 등의 메서드를 추가함
*/
db.Post.belongsToMany(db.Hashtag,{through:'PostHashtag'});
db.Hashtag.belongsToMany(db.Post,{through:'PostHashtag'});

//같은 테이블끼리도 N:M 관계를 가질 수 있음 
//팔로잉 기능도 N:M 관계임
//사용자 한 명이 팔로워를 여러명 가질수도 있고 여러명을 팔로잉할 수도 있음
//User모델과 User모델 간에 N:M 관계가 있는 것임
db.User.belongsToMany(db.User,{
  foreignKey:'followingId',
  as:'Followers',
  through:'Follow'
});
db.User.belongsToMany(db.User,{
  foreignKey:'followerId',
  as:'Followings',
  through:'Follow'
});
module.exports=db;
/*
같은 테이블 간 N:M 관계에서는 모델이름과 컬럼이름을 따로 정해줘야함 
모델이름이 UserUser 일수는 없음
through 옵션으로 생성할 모델 이름을 Follow 로  정함
Follow 모델에서 사용자 아이디를 저장하는 컬럼 이름이 둘 다 UserId 누가 팔로워고 누가 팔로잉 중인지 구분이 되지 않으므로 따로 설정해주어야 함
foreignKey 옵션에 각각 followerId, followingId 를 넣어주어 두 사용자 아이디를 구별했음

as옵션은 시퀄라이즈가 JOIN 작업시 사용하는 이름임 
as에 등록한 이름을 바탕으로 시퀄라이즈는 getFollowings, getFollowers,addFollowing,addFollower 등의 메서드를 자동으로 추가함
NodeBird 에 모델은 총 5개 즉 , 직접 생성한 User , Hashtag,Post와 시퀄라이즈가 관계를 파악하여 생성한 PostHashtag,Follow
생성한 모델을 데이터 베이스 및 서버와 연결함 

*/