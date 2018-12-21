module.exports = function(app){
var mysql_con = require('../db/db_con.js')();
var authData={};
var connection = mysql_con.init();
// passport.js 관련
var passport = require('passport')    // passport는 session을 이용하기 때문에 session을 사용한 이후에 코드에 추가해야합니다! (var 선언 부분 뺴고 나머지)
  , LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize()); // passport를 사용하기 위한 미들웨어 입니다.
app.use(passport.session());  // passport위에서 session을 사용하기 위한 미들웨어 입니다.

// passport의 Sessions 관련 코드
passport.serializeUser(function(user, done) {
  done(null, user.id);   // 딱 한번 실행됩니다. 이 done함수의 두번째 인자로는 식별자를 넘겨줍니다. 이게 store에 저장됩니다 (여기는 이메일을 식별자로 쓴 것 같아요)
});

passport.deserializeUser(function(id, done) { // deserializeUser를 통해 store에 있는 값에서 해당 식별자 값을 가진 유저의 정보에 접근해 가져옴.(실제로는 DB에서 하겠죠)
  console.log(authData);
    done(null, authData);   // authData에서 찾아와서 가져오겠다는 소리인데요. 나중에는 id 값을 이용해 이걸 DB에서 찾아와서 넘기겟죠
});

// 이 부분에서 아이디, 비밀번호의 일치여부를 DB에서 가져와야 합니다.
  passport.use(new LocalStrategy(
    {   // 지금 이 코드(객체)는 아래 function에 쓸 username을 ''안에 있는걸로 받는 거고, password도 마찬가지
      usernameField: 'ID',   // login 페이지에서 ID라고 받아서..?
      passwordField: 'pwd'    // login 페이지에서 pwd라고 받아서..?
    },
    function(username, password, done) {
        que = `select * from Member WHERE email='${username}' AND passwd=HEX(AES_ENCRYPT('${password}', MD5('comeducocoa')))`;
        connection.query(que, function (err, result) {
            if (err){
                return done(null, false,{
                    message:'Error!'
                });
            }
            else if(result[0]===undefined){
                console.log("error")
                return done(null, false,{
                    message: 'Incorrect Id or password.'
                });
                /*console.log("login error!");
                response.writeHead(302, {
                Location: `/auth/login?error=nologin`
                });
                response.end();
                */
            }
            authData={
                email: result[0].email,
                password: result[0].passwd,
                nickname: result[0].nickname,
                id : result[0].numid
            }
            if(authData !== {}) //  DB에서 가져와야 합니다.
            {
                console.log(1);
                return done(null, authData);  
            } 

        });  
    }
  ));
    return passport;
}