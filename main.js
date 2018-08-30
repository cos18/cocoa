var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
//var express = require('express');
// express 사용하고, 포트를 80번으로 대체해봐야함
var path = require('path');
var template = require('./lib/template.js');
var func = require('./lib/function.js');
var mysql_con = require('./db/db_con')();

var connection = mysql_con.init();

var app = http.createServer(function(request, response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){  // 메인페이지인 경우
    if(queryData.id===undefined){// undefined면 home임.
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
      `<h3>This is main page</h3>`);
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
      `<h3>Login success! Welcome!</h3>`);

      response.writeHead(200);
      response.end(html);
    }

    // login이 끝난경우 보여져야 할 목록이 달라져야 할겁니다. id 값을 뭘 주고 홈페이지 상에서는 보이지 않게 하던가
    // login이 된 상태라면 계속 보여져야 할 목록이 달라질거임. <- 로그인이 된 상태인지 계속 확인하는 법이 필요
    // 관리자일 경우, 교수/지도자 일 경우, 학생일 경우

  } else if(pathname ==='/login'){
    var html = template.HTML('',
    '',`
    <h3>Login Session</h3>
    <form action="/login_process" method="post">
      <p>ID <input type="text" name="ID" placeholder="ID"></p>
      <p>PW <input type="password" name="pwd" maxlength=14 placeholder="password"></p>
      <p>
        <input type="submit" value=LOGIN>
      </p>
    </form>
    `);

    response.writeHead(200);
    response.end(html);
  } else if(pathname === '/login_process'){
      /*
      현재 DB가 완성되어있지 않아 임시로 member에서 불러와 로그인을 진행하고 있습니다
      */
      var body = '';
      request.on('data', function(data){    // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
          body = body + data;   // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
      });
      request.on('end', function(){   // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
          var post = qs.parse(body);
          fs.readdir('./member', function(error,filelist){
            var id = post.ID;
            fs.readFile(`member/${id}`, 'utf8', function(err, data){
              var state = qs.parse(data);
              if(state.pw == post.pwd){
                response.writeHead(302, {Location : `/?id=${state.group}`});   // 로그인 권한부여를 어떻게 해야할지 생각해야합니다
                response.end();
              } else {
                console.log("Check your ID and Password");
                response.writeHead(302, {Location : `/login`});
                response.end();
              }
              // id와 비밀번호가 일치한다면 그룹에 맞게 로그인 권한을 부여하고 메인 페이지로
              // 일치하지 않을경우 에러메시지 출력하면서 다시 로그인 창으로
            });
          });
        });
  } else if(pathname ==='/join'){
    var check = func.checkForm(); // 더러운 코드인가..
    var html = template.HTML(`
      #join{
        display : grid;
        border : 3px solid black;
        width : 400px;
        padding : 10px;
      }`,
      `<script>${check}</script>`,`
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
          <span><input type="radio" name="group" value="student" checked/>Student</span>
          <span><input type="radio" name="group" value="professor" />Professor</span>
          <span><input type="radio" name="group" value="other" />Other</span>
        </fieldset>
      <p>
        <input type="submit" value="JOIN">
      </p>
    </form>
    `);
    // 현재 아이디는 email 형식으로, 비번은 영문자, 숫자 포함 최소 8지 입력하게 해놓음
    // DB만들어지면 ID중복확인이나 닉네임 중복확인도 해야함
    response.writeHead(200);
    response.end(html);
  } else if(pathname === '/join_process'){
    /*
    현재 임시로 member 폴더를 만들어서 새로 파일을 만들어 저장했습니다
    */
    var body = '';
        request.on('data', function(data){    // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
            body = body + data;   // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
        });
        request.on('end', function(){   // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
            var post = qs.parse(body);    // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
            var description="";
            var id = post.ID;
            description = description + "id=" + id + "&"+ "pw=" + post.pwd + "&" + "name=" + post.username + "&" + "nickname=" + post.nickname + "&" + "belong=" + post.belong + "&" + "group=" + post.group;
            // 이 아래는 파일로 저장하는 법
            // 가입시에 이미 있는 아이디는 못가입하게 확인하는 것도 필요
            fs.writeFile(`member/${id}`, description, 'utf8', function(err){ // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
              // 파일 생성이 끝난후에 이동하는 페이지를 다시 설정해주는 리다이렉션 작업을 실행하는 코드가 아래에 있습니다.
              response.writeHead(302, {Location : `/`});    // 302는 리다이렉션 하겠다는 뜻이라고 합니다.
              response.end();
            });
        });


    //response.writeHead(302, {Location : `/`});
    //response.end(html);
  } else if(pathname === '/board'){
    
    var stmt = 'select * from Problem';
    connection.query(stmt, function (err, result) {
      //console.log(result);
      var list = template.problem_list(result);
      console.log("success");
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
        `
      );
      response.writeHead(200);
      response.end(html);
    });
  } else if(pathname === '/board/'){
    // 현재 이부분에 board/{문제번호} 주소인 경우 그 문제에 해당하는 정보를 출력하는 페이지를 만들면 될 것 같습니다

    console.log('success');

    response.writeHead(300);
    response.end();
  } else if(pathname==='/create'){
      var html = template.HTML(`
        #writeboard{
          border : 3px solid;
          margin-bottom : 200px;
          min-width : 600px;
        }
        `,
      '',
      `
      <div id="writeboard">
       <h3 style="padding-left : 10px;">Create Problem</h3>
        <form method="post" action="/create_process" style="padding:10px;">
          <p>Problem Title</p>
          <input type="text" name="pb_title" placeholder="Name"></input>
          <p>Problem Info</p>
          <textarea name="pb_info" style="min-width:500px; min-height:150px;" placeholder="type information about problem"></textarea>
          <p>Input Testcase</p>
          <textarea name="input_test" style="min-width:500px; min-height:100px;" placeholder="Input Testcase"></textarea>
          <p>Output Testcase</p>
          <textarea name="output_test" style="min-width:500px; min-height:100px;" placeholder="Output Testcase"></textarea>
          <p>Input</p>
          <textarea name="input" style="min-width:500px; min-height:150px;" placeholder="Input"></textarea>
          <p>Output</p>
          <textarea name="output" style="min-width:500px; min-height:150px;" placeholder="Output"></textarea>
          <p>Limit Time<input type="text" name="lim_time" style="margin-left:10px;" placeholder="ms"></input></p>
          <p>Limit Memory<input type="text" name="lim_mem" style="margin-left:10px;" placeholder="MB"></input></p>
          <p>Hint(shown in page) Number<input type="text" name="hint_num" style="margin-left:10px;" placeholder="number"></input></p>
          <input type="submit" value="create"></input>
        </form>
      </div>
        `);

      response.writeHead(300);
      response.end(html);
  } else if(pathname==='/create_process'){
    /*
    파일들로 다 저장해봅시다
    */
    var body = '';
    request.on('data', function(data){    // 웹브라우저가 host방식으로 data 전송할때 data가 많으면 그 데이터를 한번에 처리하기에 힘들 수 있기에, 이런 경우에 사용하는 방법인데, data방식은 callback에 들어가있잖아요. 서버에서 조각을 받을때마다 callback함수 호출하기로 했고, 할때마다 data인자를 통해 수신한 정보를 주기로 약속했다.
        body = body + data;   // callback이 실행될때 마다 인자로 넘겨진 data를 추가하는데. 이게 너무 많아버리면 끊어버리는 코드가 따로 있습니다만 여기에는 포함 안했습니다.
    });
    request.on('end', function(){   // 들어올 정보가 없다면 end 다음에 있는 callback이 실행되도록 함.
        var post = qs.parse(body);    // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
        var find_que = 'SELECT * FROM Problem ORDER BY pb_id DESC LIMIT 1;';
        connection.query(find_que, function (err, result) {
          console.log(result);
          var pb_id = parseInt(result[0].pb_id);
          var que = `INSERT INTO Problem (pb_id, title, lim_time, lim_mem, hint_num) VALUES(${pb_id+1}, "${post.pb_title}", ${post.lim_time}, ${post.lim_mem}, ${post.hint_num});`;
          connection.query(que, function (err, result) {
            console.log(result);
            response.writeHead(302, {Location : `/board`});    // 302는 리다이렉션 하겠다는 뜻이라고 합니다.
            response.end();
          });
        });
        /*
        description = description + "title=" + pb_title + "&"+ "info=" + post.pb_info + "&" + "input_test=" + post.input_test + "&" + "output_test=" + post.output_test + "&" + "input=" + post.input + "&" + "output=" + post.output;
        description = description + "&"+ "limit_time=" + post.lim_time + "&" + "limit_memory=" + post.lim_mem;
        // 이 아래는 파일로 저장하는 법
        // 가입시에 이미 있는 아이디는 못가입하게 확인하는 것도 필요
        fs.writeFile(`problem/${pb_title}`, description, 'utf8', function(err){ // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
          // 파일 생성이 끝난후에 이동하는 페이지를 다시 설정해주는 리다이렉션 작업을 실행하는 코드가 아래에 있습니다.
          response.writeHead(302, {Location : `/board`});    // 302는 리다이렉션 하겠다는 뜻이라고 합니다.
          response.end();
        });
        */
    });
  }









});
app.listen(80);
