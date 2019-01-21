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
var groupRouter = require('./routes/group');

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
app.use('/group',groupRouter);

// 메인페이지
app.get('/', function (request, response) {
  let main = `
  <div class="ui vertical masthead center aligned segment">
    <div class="ui text container" style="margin-top:140px; margin-bottom:100px;">
      <h1 class="ui header" style="font-size: 55px">
        COmputer COding Artist
      </h1>
      <h3>이곳에서 여러분의 꿈을 시작해보세요!</h2>
      <br>
      <div class="ui big primary button">시작하기 <i class="right arrow icon"></i></div>
    </div>
  </div>
  <div class="coblock ui vertical stripe segment">
    <div class="ui middle aligned stackable grid container">
      <div class="row">
        <div class="eight wide column">
          <h2 class="ui header">시작이 반인데, 어디서 시작하지?</h2>
          <p>기존 저지 사이트(Judge Site - 프로그래밍 문제를 풀 수 있는 사이트)에서는 입문자들을 위한 문제, 기능들이 부족합니다. 주로 실력자들도 어려워하는 올림피아드나 대회 문제들이 수록되어있기 때문이죠.</p>
          <h2 class="ui header">여러분의 첫 코딩 경험을 도와드립니다</h2>
          <p>기초를 다질 수 있는 문제가 많이 준비될 예정이고, 학생별 맞춤 문제 추천 시스템을 도입할 예정입니다. 첫 코딩 경험은 코코아에서!</p>
        </div>
        <div class="six wide right floated column">
          <img src="image/main_screen.png" class="ui large image">
        </div>
      </div>
      <div class="row">
        <div class="center aligned column">
          <a class="ui large button">문제 보러가기</a>
        </div>
      </div>
    </div>
  </div>
  <div class="ui vertical stripe quote segment">
    <div class="ui equal width stackable internally celled grid">
      <div class="center aligned row">
        <div class="column">
          <h3>"What a Company"</h3>
          <p>That is what they all say about us</p>
        </div>
        <div class="column">
          <h3>"I shouldn't have gone with their competitor."</h3>
          <p>
            <img src="assets/images/avatar/nan.jpg" class="ui avatar image"> <b>Nan</b> Chief Fun Officer Acme Toys
          </p>
        </div>
      </div>
    </div>
  </div>
  <div class="ui vertical stripe segment">
    <div class="ui text container">
      <h3 class="ui header">Breaking The Grid, Grabs Your Attention</h3>
      <p>Instead of focusing on content creation and hard work, we have learned how to master the art of doing nothing by providing massive amounts of whitespace and generic content that can seem massive, monolithic and worth your attention.</p>
      <a class="ui large button">Read More</a>
      <h4 class="ui horizontal header divider">
        <a href="#">Case Studies</a>
      </h4>
      <h3 class="ui header">Did We Tell You About Our Bananas?</h3>
      <p>Yes I know you probably disregarded the earlier boasts as non-sequitur filler content, but its really true. It took years of gene splicing and combinatory DNA research, but our bananas can really dance.</p>
      <a class="ui large button">I'm Still Quite Interested</a>
    </div>
  </div>
  <div class="ui inverted vertical footer segment">
    <div class="ui container">
      <div class="ui stackable inverted divided equal height stackable grid">
        <div class="three wide column">
          <h4 class="ui inverted header">About</h4>
          <div class="ui inverted link list">
            <a href="#" class="item">Sitemap</a>
            <a href="#" class="item">Contact Us</a>
            <a href="#" class="item">Religious Ceremonies</a>
            <a href="#" class="item">Gazebo Plans</a>
          </div>
        </div>
        <div class="three wide column">
          <h4 class="ui inverted header">Services</h4>
          <div class="ui inverted link list">
            <a href="#" class="item">Banana Pre-Order</a>
            <a href="#" class="item">DNA FAQ</a>
            <a href="#" class="item">How To Access</a>
            <a href="#" class="item">Favorite X-Men</a>
          </div>
        </div>
        <div class="seven wide column">
          <h4 class="ui inverted header">Footer Header</h4>
          <p>Extra space for a call to action inside the footer that could help re-engage users.</p>
        </div>
      </div>
    </div>
  </div>
  `;
  const html = template.HTML(main, template.topbar(request, response));
  response.send(html);
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