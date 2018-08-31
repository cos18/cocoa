var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
//var express = require('express');
// express 사용하고, 포트를 80번으로 대체해봐야함
var path = require('path');
var template = require('./lib/template.js');
var func = require('./lib/function.js');
var mysql_con = require('./db/db_con.js')();
var cookie = require('cookie');

var connection = mysql_con.init();
var dbcon_sync = mysql_con.init_sync();

function authIsOwner(request,response){
  isOwner = false;
  var cookies = {}
  if(request.headers.cookie){
    cookies = cookie.parse(request.headers.cookie);
  }
  // cookies의 id로 DB 접속해서 pw가 cookies의 status와 일치하면 true반환
  dbcon_sync.query("USE cocoa_web");
  var stmt = `select * from Member where numid='${cookies.id}'`;
  var result = dbcon_sync.query(stmt)[0];
  if(typeof(result) !== "undefined" && cookies.status === result.passwd){
    isOwner = true;
  }
  return isOwner;
}

function topbar(request, response){
  var authStatusUI = `<div id="login" style="text-align:right;"><a href="/login" style="padding:5px;">login</a><a href="/join" style="padding:5px;">join </a></div>`;
  //console.log(authIsOwner(request, response));
   if(authIsOwner(request, response)){
     authStatusUI = `<div id="logout" style="text-align:right;"><a href="/logout_process" style="padding:5px;">logout</a></div>`;
   }
return authStatusUI;
}


var app = http.createServer(function (request, response) {
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if (request.url.indexOf(".css") !== -1){
    fs.readFile(`${request.url.substring(1, )}`, 'utf8', function(err, file){
      response.writeHead(200, {'Content-Type' : 'text/css'});
      response.write(file);
      response.end();
    }); 
  } else if (request.url.indexOf(".js") !== -1){
    fs.readFile(`${request.url.substring(1, )}`, 'utf8', function(err, file){
      response.writeHead(200, {'Content-Type' : 'text/javascript'});
      response.write(file);
      response.end();
    }); 
  } else if (pathname === '/') { // 메인페이지인 경우
    if (!authIsOwner(request, response)) { // undefined면 home임.
      var html = template.HTML(`
        #menuwrap
        {
          //width : 600px;
          border-top : 3px solid black;
          border-bottom : 3px solid black;
          padding : 5px;
        }`,
        `<div id="menuwrap">
          <div id="menu" style="text-align:left;"><a href="/board">board</a></div>
        </div>`,
        `<h3>This is main page</h3>`, topbar(request, response));
      response.writeHead(200);
      response.end(html);
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
          <div id="menu" style="text-align:left;"><a href="/board">board</a></div>
        </div>`,
        `<h3>Login success! Welcome!</h3>`,  topbar(request, response));
      response.writeHead(200);
      response.end(html);
    }

    // login이 끝난경우 보여져야 할 목록이 달라져야 할겁니다. id 값을 뭘 주고 홈페이지 상에서는 보이지 않게 하던가
    // login이 된 상태라면 계속 보여져야 할 목록이 달라질거임. <- 로그인이 된 상태인지 계속 확인하는 법이 필요
    // 관리자일 경우, 교수/지도자 일 경우, 학생일 경우

  } else if (pathname === '/login') {
    var body = "";
    if (queryData.error === 'true'){
      body = body + '<h4>Login Error! Check Id or password</h4>';
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
      '', body, topbar(request, response));
    response.writeHead(200);
    response.end(html);
  } else if (pathname === '/login_process') {
    /*
    현재 DB가 완성되어있지 않아 임시로 member에서 불러와 로그인을 진행하고 있습니다
    */
    var body = '';
    request.on('data', function (data) { // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
      body = body + data; // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
    });
    request.on('end', function () { // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
      var post = qs.parse(body);

      var stmt = `select * from Member where email='${post.ID}' AND passwd=HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa')))`;
      connection.query(stmt, function (err, result) {
        result = result[0];
        if (err) {
          console.log("error!"+err);
          response.writeHead(302, {
            Location: `/login`
          });
          response.end();
        } else if (typeof(result) === "undefined"){
          console.log("error!");
          response.writeHead(302, {
            Location: `/login?error=true`
          });
          response.end();
        } else {
          console.log(result);
          response.writeHead(302,{
            'Set-Cookie' : [
              `status=${result.passwd}`,
              `nickname=${result.nickname}`,
              `id=${result.numid}`
            ],
            Location : `/`});
          response.end("로그인 성공");
        }
      });
    });
  } else if (pathname === '/logout_process') {
    var body = '';
    request.on('data', function (data) {
      body = body + data;
    });
    request.on('end', function () {
      var post = qs.parse(body);
      response.writeHead(302, {
        'Set-Cookie': [
          `id=; Max-Age=0`,
          `status=; Max-Age=0`,
          `nickname=; Max-Age=0`
        ],
        Location: `/`
      });
      response.end();
    });
  } else if (pathname === '/join') {
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
      `, topbar(request, response));
    // 현재 아이디는 email 형식으로, 비번은 영문자, 숫자 포함 최소 8지 입력하게 해놓음
    // DB만들어지면 ID중복확인이나 닉네임 중복확인도 해야함
    response.writeHead(200);
    response.end(html);
  } else if (pathname === '/join_process') {
    /*
    현재 임시로 member 폴더를 만들어서 새로 파일을 만들어 저장했습니다
    */
    var body = '';
    request.on('data', function (data) { // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
      body = body + data; // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
    });
    request.on('end', function () { // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
      var post = qs.parse(body); // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
      var description = "";
      var que = `INSERT INTO Member (email, passwd, krname, belong, nickname, member_type) VALUES("${post.ID}", HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa'))), "${post.username}", "${post.belong}", "${post.nickname}", ${post.group});`;
      connection.query(que, function (err, result) {
        response.writeHead(302, {
          Location: `/`
        }); // 302는 리다이렉션 하겠다는 뜻이라고 합니다.
        response.end();
      });
    });

  } else if (pathname === '/board') {

    var stmt = 'select * from Problem';
    connection.query(stmt, function (err, result) {
      //console.log(result);
      var list = template.problem_list(result);
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
              <a href="/board">board</a>
            </div>
        </div>`,
            `
        <div id="mainwrap">
          <div>
            ${list}
            <input type="button" onclick="window.location.href='/create';" value="create" />
          </div>
        </div>
        `, topbar(request, response));
      response.writeHead(200);
      response.end(html);
    });
  } else if (pathname.substr(0, 7) === "/board/" && pathname.substring(7, ) !== "") {
    var pb_id = pathname.substring(7, );
    var stmt = `select * from Problem where pb_id=${pb_id}`;
    connection.query(stmt, function (err, result) {
      if (err) {
        response.writeHead(302, {
          Location: `/board`
        });
        response.end();
      } else {
        result = result[0];
        fs.readFile(`problem/${pb_id}/info.txt`, 'utf8', function (err, info) {
          fs.readFile(`problem/${pb_id}/input/1.txt`, 'utf8', function (err, input) {
            fs.readFile(`problem/${pb_id}/output/1.txt`, 'utf8', function (err, output) {
              var html = template.show_problem(result.pb_id, result.lim_time, result.lim_mem, result.title, info, input, output, topbar(request, response));
              // 이 위의 부분에 표시할 html코드를 만들어야합니다.
              response.writeHead(200);
              response.end(html);
            });
          });
        });
      }
    });
  } else if (pathname === '/create') {
    var html = template.HTML(`
      #writeboard{
        border : 3px solid;
        margin-bottom : 200px;
        min-width : 600px;
      }`, '',`
      <div id="writeboard">
        <h3 style="padding-left : 10px;">Create Problem</h3>
        <form method="post" action="/create_process" style="padding:10px;">
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
      </div>`, topbar(request, response));
    response.writeHead(200);
    response.end(html);
  } else if (pathname === '/create_process') {
    /*
    파일들로 다 저장해봅시다
    */
    var body = '';
    request.on('data', function (data) { // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
      body = body + data; // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
    });
    request.on('end', function () { // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
      var post = qs.parse(body); // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
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

          response.writeHead(302, {
            Location: `/board/${pb_id}`
          }); // 302는 리다이렉션 하겠다는 뜻이라고 합니다.
          response.end();
        });
      });
    });
  } else if (pathname === '/submit') {
    var body = '';
    request.on('data', function (data) { 
      body = body + data; 
    });
    request.on('end', function () { 
      var post = qs.parse(body);
      if(typeof(post.id) !== undefined){
        var html = template.submit_page(post.id);
        response.writeHead(200);
        response.end(html);
      } else {
        response.writeHead(404);
        response.end("잘못된 접근입니다.");
      }
    });
  }
});

app.listen(80);
