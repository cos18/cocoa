var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // 본문 파싱
var compression = require('compression'); // 압축해주는 서드파티
var helmet = require('helmet');   // 기본 보안관련 이래요
app.use(helmet());
var session = require('express-session');
var FileStore = require('session-file-store')(session)   // cocoa에서 쓸때는 file말고 db등등으로 옮기는 법을 알아내서 적용시켜야함.
//var FileStore = require('session-file-store')(session)   // cocoa에서 쓸때는 file말고 db등등으로 옮기는 법을 알아내서 적용시켜야함.


var template = require('./lib/template.js');
var func = require('./lib/function.js');
var mysql_con = require('./db/db_con.js')();
var auth = require('./lib/auth.js');
var passport = require('./lib/passport')(app);  // passport를 passportjs에서 가져옵니다.

var problemRouter = require('./routes/problem'); // 문제관련 페이지
var mypageRouter = require('./routes/mypage');
var authRouter = require('./routes/auth')(passport);

var connection = mysql_con.init();

app.use(express.static('public')); //public 폴더에 있는 정적인 파일이나 폴더들을 url을 통해 접근해 사용할 수 있게 해주는 미들웨어래요. 그래서 안전하게 이용가능하다고 합니다.
app.use(bodyParser.urlencoded({
  extended: false
})); // form 형식을 받을때 bodyParser라는 미들웨어가 알아서 parsing 해주고 그 결과 request에 body라는 객체?가 생긴대요
app.use(compression()); // compression이  실행되고 미들웨어가 장착됨
app.use(session({             // 세션 관련
  secure: true,       // 이러면 https에서만 세션정보를 주고 받을 수 있도록 설정해준다고 합니다.
  HttpOnly: true,     // 이러면 javascript를 통해서 세션쿠키를 사용할 수 없도록 강제할 수 있다고 합니다(http로만 접근 가능하다 이런뜻인가봐요)
  secret: 'asadlfkj!@#!@#dfgasdg',
  resave: false,
  saveUninitialized: false,
  store: new FileStore()       // Filestore에 저장하겠다는 소린감..
}))

// routing
app.use('/problem', problemRouter); // /problem으로 들어가는 경로는 problemRouter 미들웨어에서 처리
app.use('/mypage', mypageRouter);
app.use('/auth', authRouter);

// 메인페이지
app.get('/', function (request, response) {
  if (!auth.isOwner(request, response)) { // undefined면 home임.
    var html = template.HTML(
      `<h3>This is main page</h3>`, template.topbar(request, response));
    response.send(html);
  } else {
    var html = template.HTML(
      `<h3>Login success! Welcome!</h3>`, template.topbar(request, response));
    response.send(html);
  }
})

<<<<<<< HEAD
// 로그인페이지
app.get('/login', function (request, response) {
  var body = "";
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
          <form class="ui large form" action="/login_process" method="post">
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
})

// 로그인처리 페이지
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

// 로그아웃 처리 페이지
app.get('/logout', function (request, response) {
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

// 회원가입 페이지
app.get('/join', function (request, response) {
  var check = func.checkForm(); // 더러운 코드인가..
  var html = template.HTML(`
    <script>${check}</script>
    <h3>Join Session</h3>


    <form method="post" class="ui form" action="/join_process" onsubmit="return checkForm(this);">
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
})

// 회원가입처리 페이지
app.post('/join_process', function (request, response) {
  var post = request.body;
  var description = "";
  var que = `INSERT INTO Member (email, passwd, krname, belong, nickname, member_type) VALUES("${post.ID}", HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa'))), "${post.username}", "${post.belong}", "${post.nickname}", ${post.group});`;
  connection.query(que, function (err, result) {
    response.redirect(`/`);
  });
})

=======
>>>>>>> 49ec94c4a210bef02b30bac0561b5da1bbc15fc0
// 채점결과 페이지 (안쓸 예정)
app.get('/result', function (request, response) {
  var stmt = 'select * from Solve ORDER BY solve_id DESC LIMIT 10;';
  connection.query(stmt, function (err, result) {
    var list = template.result_list(result);
    var html = template.HTML(`
      <div id="mainwrap">
        <div>
          ${list}
        </div>
      </div>
      `, template.topbar(request, response), "Result");
    response.send(html);
  });
})

// 페이지 경로 없는 경우 (404)
app.use(function (req, res, next) {
  res.status(404).send('Sorry cant find that!');
});

// 강제로 err 인자를 next로 넘겼을경우
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});


app.listen(80, function () {
  console.log('app listening on port 80!')
});