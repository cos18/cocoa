var express = require('express');
var app = express();

var bodyParser = require('body-parser');
var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');


var path = require('path');
var template = require('./lib/template.js');
var func = require('./lib/function.js');
var mysql_con = require('./db/db_con.js')();
var spawn = require('child_process').spawn;
var auth = require('./lib/auth.js');

var connection = mysql_con.init();

app.get('*', function(request, response, next){
  if (request.url.indexOf(".css") !== -1) {
    fs.readFile(`${request.url.substring(1, )}`, 'utf8', function (err, file) {
      response.writeHead(200, {
        'Content-Type': 'text/css'
      });
      response.write(file);
      response.end();
    });
  } else if (request.url.indexOf(".js") !== -1) {
    fs.readFile(`${request.url.substring(1, )}`, 'utf8', function (err, file) {
      response.writeHead(200, {
        'Content-Type': 'text/javascript'
      });
      response.write(file);
      response.end();
    });
  }
});

app.use(bodyParser.urlencoded({ extended: false })); // form 형식을 받을때 bodyParser라는 미들웨어가 알아서 parsing 해주고 그 결과 request에 body라는 객체?가 생긴대요
app.use(compression()); // compression이  실행되고 미들웨어가 장착됨


// 메인페이지
app.get('/', function(request, response){
  if (!auth.isOwner(request, response)) { // undefined면 home임.
    var html = template.HTML(`
      #menuwrap
      {
        //width : 600px;
        border-top : 3px solid black;
        border-bottom : 3px solid black;
        padding : 5px;
      }`,
      `<div id="menuwrap">
        <div id="menu" style="text-align:left;"><a href="/board">board</a> <a href="/result">result</a></div>
      </div>`,
      `<h3>This is main page</h3>`, template.topbar(request, response));
    response.send(html);
  } else {
    var html = template.HTML(`
      #menuwrap
      {
        //width : 600px;
        border-top : 3px solid black;
        border-bottom : 3px solid black;
        padding : 5px;
      }`,
      `<div id="menuwrap">
        <div id="menu" style="text-align:left;"><a href="/board">board</a> <a href="/result">result</a></div>
      </div>`,
      `<h3>Login success! Welcome!</h3>`, template.topbar(request, response));
    response.send(html);
  }
})

// 로그인페이지
app.get('/login', function(request, response){
  var body = "";
    if (queryData.error === 'true') {
      body = body + '<h4>Login Error! Check Id or password</h4>';
    } else if (queryData.error === 'nologin') {
      body = body + '<h4>You must login before submit</h4>';
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
    var html = template.HTML('',
      '', body, template.topbar(request, response));
    response.send(html);
})

// 로그인처리 페이지
app.post('/login_process', function(request, response){
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
app.post('/logout_process', function(request, response){
  var post = request.body;
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
app.get('/join', function(request, response){
  var check = func.checkForm(); // 더러운 코드인가..
  var html = template.HTML(`
    #join{
      display : grid;
      border : 3px solid black;
      width : 400px;
      padding : 10px;
    }`,
    `<script>${check}</script>`, `
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
app.post('/join_process', function(request, response){
  var post = request.body;
  var description = "";
  var que = `INSERT INTO Member (email, passwd, krname, belong, nickname, member_type) VALUES("${post.ID}", HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa'))), "${post.username}", "${post.belong}", "${post.nickname}", ${post.group});`;
  connection.query(que, function (err, result) {
    response.redirect(`/`);
  });
})


// 문제게시판 페이지
app.get('/problem', function(request, response){
  var stmt = 'select * from Problem';
  connection.query(stmt, function (err, result) {
    var list = template.problem_list(result, request, response);
    var html = template.HTML(`
      #menuwrap{
        border-top : 3px solid black;
        border-bottom : 3px solid black;
        padding : 5px;
      }
      `,
      `<div id="menuwrap">
          <div id="menu" style="text-align:left; font-weight:bold;">
            <a href="/problem">board</a> <a href="/result">result</a>
          </div>
      </div>`,
      `
      <div id="mainwrap">
        <div class="table-list">
          ${list}
          <input type="button" onclick="window.location.href='/problem/create';" value="create" />
        </div>
      </div>
      `, template.topbar(request, response));
    response.send(html);
  });
})

// 문제제작 페이지
app.get('/problem/create', function(request, response){
  var html = template.HTML(`
    #writeboard{
      border : 3px solid;
      margin-bottom : 200px;
      min-width : 600px;
    }`, '', `
    <div id="writeboard">
      <h3 style="padding-left : 10px;">Create Problem</h3>
      <form method="post" action="/problem/create_process" style="padding:10px;">
        <p>Problem Title</p>
        <input type="text" name="pb_title" placeholder="Name"></input>
        <p>Problem Info</p>
        <textarea name="pb_info" style="min-width:500px; min-height:150px;" placeholder="type information about problem"></textarea>
        <p>Input</p>
        <textarea name="input" style="min-width:500px; min-height:150px;" placeholder="Input"></textarea>
        <p>Output</p>
        <textarea name="output" style="min-width:500px; min-height:150px;" placeholder="Output"></textarea>
        <p>Limit Time<input type="text" name="lim_time" style="margin-left:10px;" placeholder="ms"></input></p>
        <p>Limit Memory<input type="text" name="lim_mem" style="margin-left:10px;" placeholder="MB"></input></p>
        <p>Hint(shown in page) Number<input type="text" name="hint_num" style="margin-left:10px;" placeholder="number"></input></p>
        <input type="submit" value="create"></input>
      </form>
    </div>`, template.topbar(request, response));
    response.send(html);
})

// 문제제작 처리 페이지
app.post('/problem/create_process', function(request, response){
  var post = request.body; // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
  var find_que = 'SELECT * FROM Problem ORDER BY pb_id DESC LIMIT 1;';
  connection.query(find_que, function (err, result) {
    console.log(result);
    var pb_id = parseInt(result[0].pb_id) + 1;
    var que = `INSERT INTO Problem (pb_id, title, lim_time, lim_mem, hint_num) VALUES(${pb_id}, "${post.pb_title}", ${post.lim_time}, ${post.lim_mem}, ${post.hint_num});`;
    connection.query(que, function (err, result) {
      // 지금 여기 pb_title 대신에, DB에서 자동생성한 문제번호(pb_id)를 가져와야 할 것 같아요
      if (!fs.existsSync(`./problem/${pb_id}`)) {
        fs.mkdirSync(`./problem/${pb_id}`);
      } // 해당 id 폴더 확인
      fs.mkdirSync(`./problem/${pb_id}/input`);
      fs.writeFile(`problem/${pb_id}/input/1.txt`, post.input, 'utf8', function (err) { // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
      });

      fs.mkdirSync(`./problem/${pb_id}/output`);
      fs.writeFile(`problem/${pb_id}/output/1.txt`, post.output, 'utf8', function (err) {});

      fs.writeFile(`problem/${pb_id}/info.txt`, post.pb_info, 'utf8', function (err) { // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
      });

      response.redirect(`/problem/${pb_id}`);
    });
  });
})

// 문제제출 페이지
app.post('/problem/submit', function(request, response){
  var post = request.body;
  if (typeof (post.id) !== undefined) {
    var html = template.submit_page(post.id, template.topbar(request, response));
    response.send(html);
  } else {
    response.status(404).send('잘못된 접근입니다');
  }
})

// 문제제출채점 페이지
app.post('/problem/submit_code', function(request, response){
  if (auth.isOwner(request, response)){
    var post = request.body;
    var problemNumber = post.problemNumber;
    var submitCode = post.submitCode;

    var cookies = auth.getCookies(request);

    var que = `insert into Solve (solve_member, solve_problem, result, solve_sec, solve_mem, solve_len, solve_lang) VALUES(${cookies.id}, ${problemNumber}, -1, 0, 0, ${submitCode.length}, 1);`;
    connection.query(que, function (err, result) {
      que = `select * FROM Solve where solve_member=${cookies.id} ORDER BY solve_id DESC LIMIT 1;`
      connection.query(que, function (err, result) {
        solve_id = result[0].solve_id;
        fs.writeFile(`answer_comparing/submit_codes/${solve_id}.c`, submitCode, 'utf8', function (err) {
          var compile = spawn('gcc', ['-o', `./answer_comparing/convertToExe/${solve_id}.exe`, `./answer_comparing/submit_codes/${solve_id}.c`], {
            shell: true
          });
    
          compile.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
          });
    
          compile.stderr.on('data', function (data) {
            console.log(String(data));
          });
    
          compile.on('exit', function (data) {
            if (data === 0) {
              var run = spawn(`./answer_comparing/convertToExe/${solve_id}.exe`, ['<', `./problem/${problemNumber}/input/1.txt`, '>', './tmp.txt'], {
                shell: true
              });
    
              run.on('exit', function (output) {
                console.log('stdout: ' + output + "!");
                fs.readFile(`problem/${problemNumber}/output/1.txt`, 'utf8', function (err, ans) {
                  console.log("ans:" + ans);
                  fs.readFile(`./tmp.txt`, 'utf8', function (err, result) {
                    console.log("result" + result);
                    if (ans === result) {
                      que = `UPDATE Solve SET result=0 where solve_id=${solve_id}`;
                      connection.query(que, function (err, result){
                        response.writeHead(302, {Location : `/result`});
                        response.end('Correct!');
                      });
                    } else {
                      que = `UPDATE Solve SET result=2 where solve_id=${solve_id}`;
                      connection.query(que, function (err, result){
                        response.writeHead(302, {Location : `/result`});
                        response.end('NO? SINGO');
                      });
                    }
                    
                  });
                });
              });
            } else { // 컴파일에러
              que = `UPDATE Solve SET result=1 where solve_id=${solve_id}`;
              connection.query(que, function (err, result){
                response.writeHead(302, {Location : `/result`});
                response.end('Compile ERROR!!');
              });
            }
          });
          //response.writeHead(200);
          //response.end('Wait for grading...');

        });
      });
    });
  } else {
    console.log("login error!");
    response.writeHead(302, {
      Location: `/login?error=nologin`
    });
    response.end();
  }
})

// 개별문제 페이지
app.get('/problem/:problem_id', function(request, response){
  var pb_id = request.params.problem_id;
  if(pb_id === undefined)
    response.status(404).send('잘못된 접근입니다');
  else{
    var stmt = `select * from Problem where pb_id=${pb_id}`;
    connection.query(stmt, function (err, result) {
      if (err) {
        response.redirect(`/problem`);
      } else {
        result = result[0];
        fs.readFile(`problem/${pb_id}/info.txt`, 'utf8', function (err, info) {
          fs.readFile(`problem/${pb_id}/input/1.txt`, 'utf8', function (err, input) {
            fs.readFile(`problem/${pb_id}/output/1.txt`, 'utf8', function (err, output) {
              var html = template.show_problem(result.pb_id, result.lim_time, result.lim_mem, result.title, info, input, output, template.topbar(request, response));
              response.redirect(html);
            });
          });
        });
      }
    });
  }
})


// 채점결과 페이지
app.get('/result', function(request, response){
  var stmt = 'select * from Solve ORDER BY solve_id DESC';
  connection.query(stmt, function (err, result) {
    var list = template.result_list(result);
    var html = template.HTML(`
      #menuwrap{
        //width : auto;
        border-top : 3px solid black;
        border-bottom : 3px solid black;
        padding : 5px;
      }
      #boardwrap{
        //display : grid;
        //grid-template : auto / 140px auto;
        //grid-gap : 3px;
      }`,
      `<div id="menuwrap">
          <div id="menu" style="text-align:left; font-weight:bold;">
            <a href="/board">board</a> <a href="/result">result</a>
          </div>
      </div>`,
      `
      <div id="mainwrap">
        <div>
          ${list}
        </div>
      </div>
      `, template.topbar(request, response));
    response.send(html);
  });
})


// 페이지 경로 없는 경우 (404)
app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});
 
// 강제로 err 인자를 next로 넘겼을경우
app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('Something broke!')
});


app.listen(80, function() {
  console.log('app listening on port 80!')
});


/*
var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  
  } else if (pathname === '/') { // 메인페이지인 경우
    

    // login이 끝난경우 보여져야 할 목록이 달라져야 할겁니다. id 값을 뭘 주고 홈페이지 상에서는 보이지 않게 하던가
    // login이 된 상태라면 계속 보여져야 할 목록이 달라질거임. <- 로그인이 된 상태인지 계속 확인하는 법이 필요
    // 관리자일 경우, 교수/지도자 일 경우, 학생일 경우

  } else if (pathname === '/login') {
    
  } else if (pathname === '/login_process') {
    
    
  } else if (pathname === '/logout_process') {
    
  } else if (pathname === '/join') {
    
  } else if (pathname === '/join_process') {
    
  } else if (pathname === '/board') {

    
  } else if (pathname.substr(0, 7) === "/board/" && pathname.substring(7, ) !== "") {
    
  } else if (pathname === '/create') {
    
  } else if (pathname === '/create_process') {
    
  } else if (pathname === '/submit') {
    
  } else if (pathname === '/submit_code') {
    
  } else if(pathname === '/result'){
    
  } 
});

app.listen(80);
*/