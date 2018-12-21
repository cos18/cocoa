var express = require('express');
var app = express();
var bodyParser = require('body-parser'); // 본문 파싱
var compression = require('compression'); // 압축해주는 서드파티
var helmet = require('helmet');   // 기본 보안관련 이래요
app.use(helmet());
var session = require('express-session');
var FileStore = require('session-file-store')(session)   // cocoa에서 쓸때는 file말고 db등등으로 옮기는 법을 알아내서 적용시켜야함.
//var FileStore = require('session-file-store')(session)   // cocoa에서 쓸때는 file말고 db등등으로 옮기는 법을 알아내서 적용시켜야함.

var http = require('http');
var qs = require('querystring');
var path = require('path');

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