var express = require('express');
var router = express.Router();
var template = require('../lib/template.js');
var sanitizeHtml = require('sanitize-html');
var mysql_con = require('../db/db_con.js')();
var connection = mysql_con.init();
var func = require('../lib/function.js');

module.exports = function(passport){
    // 로그인페이지
    router.get('/login', function (request, response) {
      var body = "";
      queryStatus=""
      if (request.query.error === 'true') {
        queryStatus = '<h4>Login Error! Check Id or password</h4>';
      } else if (request.query.error === 'submit') {
        queryStatus =  '<h4>You must login before submit</h4>';
      } else if (request.query.error === 'mypage') {
        queryStatus =  '<h4>You must login to go to My page</h4>';
      }
      body = body + `
          <style type="text/css">
            body > .grid {
              height: 100%;
            }
            .image {
              margin-top: -100px;
            }
            .column {
              max-width: 450px;
            }
          </style>
    
          <script>
          $(document)
            .ready(function() {
              $('.ui.form')
                .form({
                  fields: {
                    email: {
                      identifier  : 'email',
                      rules: [
                        {
                          type   : 'empty',
                          prompt : 'Please enter your e-mail'
                        },
                        {
                          type   : 'email',
                          prompt : 'Please enter a valid e-mail'
                        }
                      ]
                    },
                    password: {
                      identifier  : 'password',
                      rules: [
                        {
                          type   : 'empty',
                          prompt : 'Please enter your password'
                        },
                        {
                          type   : 'length[6]',
                          prompt : 'Your password must be at least 6 characters'
                        }
                      ]
                    }
                  }
                })
              ;
            })
          ;
          </script>
    
          <body>
          <div class="ui middle aligned center aligned grid">
            <div class="column">
              <h2>
                <div class="content">
                  COCOA에 로그인하세요!
                </div>
              </h2>
              <form class="ui large form" action="/auth/login_process" method="post">
                <div class="ui stacked segment">
                  <div class="field">
                    <div class="ui left icon input">
                      <i class="user icon"></i>
                      <input type="text" name="ID" placeholder="E-mail address">
                    </div>
                  </div>
                  <div class="field">
                    <div class="ui left icon input">
                      <i class="lock icon"></i>
                      <input type="password" name="pwd" maxlength=14 placeholder="Password">
                    </div>
                  </div>
                  <div class="ui fluid large teal submit button" value=LOGIN>로그인</div>
                </div>
    
                <div class="ui error message"></div>
    
              </form>
              <div>${queryStatus}</div>
            </div>
          </div>
    
          </body>
        `;
      var html = template.HTML(body, template.topbar(request, response));
      response.send(html);
  });
  
  // 로그인처리 페이지
  // passport방법
  router.post('/login_process',     // 로그인 과정에서 session을 생성하던 것을 여기에 따로 빼내서 passport방식으로 하는 중. 해당 페이지로 들어가면
    // passport 함수를 사용합니다. 만일 아래의 함수에서 추가적인 처리가 필요한 경우에는 passportjs.org에서 authenticate 부분 들어가면 function 쓰는 방법 참고하세요
    
    passport.authenticate('local', {    // passport에서는 여러 전략이 있죠. facebook, google 등등. 그 중에서 id와 pwd로 로그인 하는 전략은 local이라고 하고, 저기에 적힌 local은 이 local을 말합니다.
      // successRedirect: '/',     // 성공했을 경우에는 메인으로
      failureRedirect: '/auth/login',    // 실패했을 경우에는 로그인 페이지로
    }),
    // passportjs 세션이용 파트 댓글에서 찾은 코드로, 세션을 강제 저장후에 넘어가는 코드인 것 같습니다.
    (req, res, next) => {
        // 변화를 주었습니다.
      req.session.save((err) => {
      if (err) {
        next(err);  
      }
      res.redirect('/');
      })
    });
    
  /* 기존 express 방법
  app.post('/login_process', function (request, response) {
    var post = request.body;
    var stmt = `select * from Member where email='${post.ID}' AND passwd=HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa')))`;
    connection.query(stmt, function (err, result) {
      result = result[0];
      if (err) {
        console.log("error!" + err);
        response.redirect(`/login`);
      } else if (typeof (result) === "undefined") {
        console.log("error!");
        response.redirect(`/login?error=true`);
      } else {
        // 여기는 express방식으로 바꿔야합니다
        response.writeHead(302, {
          'Set-Cookie': [
            `status=${result.passwd}`,
            `nickname=${result.nickname}`,
            `id=${result.numid}`
          ],
          Location: `/`
        });
        response.end("로그인 성공");
      }
    });
  })
  */

  // 로그아웃 처리 페이지
  // passport 방식
    router.get('/logout', function (request, response) {
    request.logout();   // 현재 이 함수가 제대로 작동이 안됩니다.
   /*
   댓글에서 보았습니다
   request.session.destroy() 를 사용하면 세션파일이 삭제됩니다.
 
 그런데 response.redirect('/')로 홈으로 다시 돌아올때,
 다시 요청을 보내면서 request header에는
 이미 지워진 파일이름에 해당하는 세션아이디를 쿠키값으로 여전히 가지고 있기 때문에,
 이미 지워진 파일을 다시 찾으려고 하기에 콘솔에서 파일을 찾을 수 없다고 나오는 것입니다.
 
 그러니까 로그아웃을 할 때 세션파일을 지우면 안되고,
 로그인을 하면서 저장한 데이터(is_logged)만 지우면 됩니다.
 
 로그인 할때 req.session.is_logged = true; 라고 했다면
 로그아웃할때는 delete req.session.is_logged; 만 하면 됩니다.
 
 세션파일 자체는 유저가 로그인을 하든 안하든 express-session 미들웨어를 사용하기만 하면 언제나 만들어지고 사용되는 것이니까요.
 
 */
 
   //  // 콜백 함수를 통해 destroy를 하는걸 확인하고 작업이 끝난후 돌아가는 건가봐요 (추측)
   // 불안정한 함수입니다. 웬만하면 다른 방식을 찾아 하는걸로.. 
   request.session.destroy(function(err){      // 이 함수를 사용하면 session이 사라짐. callback함수는 session이 다 사라진후에 실행되는 함수임.
       response.redirect('/');
     });
    // 현재 session의 상태를 session 스토어에 저장하고 저장 된 후에 리다이렉트
   
    // request.session.save(function(){
    //  response.redirect('/');
    // })
   });

  /* express 방식
  // 로그아웃 처리 페이지
  router.get('/logout', function (request, response) {
    // express 방식으로 바꿔야합니다
    response.writeHead(302, {
      'Set-Cookie': [
        `id=; Max-Age=0`,
        `status=; Max-Age=0`,
        `nickname=; Max-Age=0`
      ],
      Location: `/`
    });
    response.end();
  })
  */

  // 회원가입 페이지
  router.get('/join', function (request, response) {
    var check = func.checkForm(); // 더러운 코드인가..
    var html = template.HTML(`
      <script>${check}</script>
      <h3>Join Session</h3>
  
  
      <form method="post" class="ui form" action="/auth/join_process" onsubmit="return checkForm(this);">
        <div class="field">
          <label>아이디</label>
          <input type="email" name="ID" placeholder="Email">
        </div>
        <div class="field">
          <label>비밀번호</label>
          <input type="password" name="pwd" minlength=8 maxlength=14 placeholder="8~14 letters">
        </div>
        <div class="field">
          <label>비밀번호 확인</label>
          <input type="password" name="chkpwd" minlength=8 maxlength=14 placeholder="8~14 letters">
        </div>
        <div class="field">
          <label>이름</label>
          <input type="text" name="username" placeholder="name">
        </div>
        <div class="field">
          <label>별명</label>
          <input type="text" name="nickname" maxlength=10 placeholder="max 16">
        </div>
        <div class="field">
          <label>직장/학교</label>
          <input type="text" name="belong" placeholder="Belong">
        </div>
  
        <div class="field">
          <label>그룹</label>
          <div class="ui selection dropdown">
            <input type="hidden" name="group">
            <i class="dropdown icon"></i>
            <div class="default text">자신이 속한 곳을 골라주세요!</div>
            <div class="menu">
              <div class="item" data-value="2">학생</div>
              <div class="item" data-value="1">교수</div>
              <div class="item" data-value="3">일반</div>
            </div>
          </div>
          <script>
            $('.ui.selection.dropdown').dropdown();
          </script> 
        </div>
        <br>
        <button class="ui primary button" type="submit" value="JOIN">가입</button>
      </form>
      `, template.topbar(request, response));
    // 현재 아이디는 email 형식으로, 비번은 영문자, 숫자 포함 최소 8지 입력하게 해놓음
    // DB만들어지면 ID중복확인이나 닉네임 중복확인도 해야함
    response.send(html);
  });
  
  // 회원가입처리 페이지
    router.post('/join_process', function (request, response) {
    var post = request.body;
    var description = "";
    var que = `INSERT INTO Member (email, passwd, krname, belong, nickname, member_type) VALUES("${post.ID}", HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa'))), "${post.username}", "${post.belong}", "${post.nickname}", ${post.group});`;
    connection.query(que, function (err, result) {
      response.redirect(`/`);
    });
  });
  return router;
}