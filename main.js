var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // 본문 파싱
var compression = require('compression'); // 압축해주는 서드파티


var http = require('http');
var qs = require('querystring');
var path = require('path');

var template = require('./lib/template.js');
var func = require('./lib/function.js');
var mysql_con = require('./db/db_con.js')();
var auth = require('./lib/auth.js');

var problemRouter = require('./routes/problem'); // 문제관련 페이지
var mypageRouter = require('./routes/mypage');

var connection = mysql_con.init();

app.use(express.static('public')); //public 폴더에 있는 정적인 파일이나 폴더들을 url을 통해 접근해 사용할 수 있게 해주는 미들웨어래요. 그래서 안전하게 이용가능하다고 합니다.
app.use(bodyParser.urlencoded({
  extended: false
})); // form 형식을 받을때 bodyParser라는 미들웨어가 알아서 parsing 해주고 그 결과 request에 body라는 객체?가 생긴대요
app.use(compression()); // compression이  실행되고 미들웨어가 장착됨

// routing
app.use('/problem', problemRouter); // /problem으로 들어가는 경로는 problemRouter 미들웨어에서 처리
app.use('/mypage', mypageRouter);

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

// 로그인페이지
app.get('/login', function (request, response) {
  var body = "";
  if (request.query.error === 'true') {
    body = body + '<h4>Login Error! Check Id or password</h4>';
  } else if (request.query.error === 'submit') {
    body = body + '<h4>You must login before submit</h4>';
  } else if (request.query.error === 'mypage') {
    body = body + '<h4>You must login to go to My page</h4>';
  }
  body = body + `
      <h3>Login Session</h3>
      <form action="/login_process" method="post">
        <p>ID <input type="text" name="ID" placeholder="ID"></p>
        <p>PW <input type="password" name="pwd" maxlength=14 placeholder="password"></p>
        <p>
          <input type="submit" value=LOGIN>
        </p>
      </form>
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
    <form method="post" id="join" action="/join_process" onsubmit="return checkForm(this);">
      <p>ID <input type="email" name="ID" placeholder="Email"></p>
      <p>PW <input type="password" name="pwd" minlength=8 maxlength=14 placeholder="8~14 letters"></p>
      <p>CHKPW <input type="password" name="chkpwd" minlength=8 maxlength=14 placeholder="8~14 letters"></p>
      <p>Name <input type="text" name="username" placeholder="name"></p>
      <p>Nickname <input type="text" name="nickname" maxlength=10 placeholder="max 16"></p>
      <p>Work at <input type="text" name="belong" placeholder="Belong"></p>
      <p>Group</p>
        <fieldset>
          <span><input type="radio" name="group" value="2" checked/>Student</span>
          <span><input type="radio" name="group" value="1" />Professor</span>
          <span><input type="radio" name="group" value="3" />Other</span>
        </fieldset>
      <p>
        <input type="submit" value="JOIN">
      </p>
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