var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
//var express = require('express');
// express 사용하고, 포트를 80번으로 대체해봐야함
var path = require('path');
var template = require('./lib/template.js');

var app = http.createServer(function(request, response){
  var _url = request.url;
  var queryData = url.parse(_url, true).query;
  var pathname = url.parse(_url, true).pathname;
  if(pathname === '/'){  // 메인페이지인 경우
    if(queryData.id===undefined){// undefined면 home임.
      var html = template.HTML(`a {
        color : black;
        text-decoration : none;
      }
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
    }

    // login이 끝난경우 보여져야 할 목록이 달라져야 할겁니다. id 값을 뭘 주고 홈페이지 상에서는 보이지 않게 하던가
    // login이 된 상태라면 계속 보여져야 할 목록이 달라질거임. <- 로그인이 된 상태인지 계속 확인하는 법이 필요
    // 관리자일 경우, 교수/지도자 일 경우, 학생일 경우

  } else if(pathname ==='/login'){
    var html = template.HTML(` a {
       color : black;
       text-decoration : none;
     }`,
    '',`
    <h3>Login Session</h3>
    <form action="/login_process" method="post">
      <p>ID <input type="text" name="ID" placeholder="ID"></p>
      <p>PW <input type="password" name="password" maxlength=14 placeholder="password"></p>
      <p>
        <input type="submit">
      </p>
    </form>
    `);

    response.writeHead(200);
    response.end(html);
  } else if(pathname === '/login_process'){

    // id와 비밀번호가 일치한다면 로그인 권한을 부여하고 메인 페이지로
    // 일치하지 않을경우 에러메시지 출력하면서 다시 로그인 창으로

    response.writeHead(302, {Location : `/`});
    response.end(html);
  } else if(pathname ==='/join'){
    var html = template.HTML(`
       a {
         color : black;
         text-decoration : none;
       }
      #grid{
        display : grid;
        border : 3px solid black;
        width : 400px;
        padding : 10px;
      }`,
      '',`
    <h3>Join Session</h3>
    <form method="post" id="grid" onsubmit="return checkForm(this);">
      <p>ID <input type="email" name="ID" placeholder="Email"></p>
      <p>PW <input type="password" name="pwd" minlength=8 maxlength=14 placeholder="8~14 letters"></p>
      <p>CHKPW <input type="password" name="chkpwd" minlength=8 maxlength=14 placeholder="8~14 letters"></p>
      <p>Name <input type="text" name="username" placeholder="name"></p>
      <p>Nickname <input type="text" name="nickname" maxlength=10 placeholder="max 16"></p>
      <p>Group <input type="text" name="group" placeholder="group"></p>

      <p>
        <input type="submit">
      </p>
    </form>
    `);
    // 현재 아이디는 email 형식으로, 비번은 영문자, 숫자 포함 최소 8지 입력하게 해놓음
    // DB만들어지면 ID중복확인이나 닉네임 중복확인도 해야함
    response.writeHead(200);
    response.end(html);
  } else if(pathname === '/join_process'){

    // 가입 끝나면 가입 완료되었다는 메시지도 출력
    response.writeHead(300);
    //response.writeHead(302, {Location : `/`});
    response.end(html);
  } else if(pathname === '/board'){
    var html = template.HTML(`a {
      color : black;
      text-decoration : none;
    }
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
        <div id="menu" style="text-align:left; font-weight:bold;"><a href="/board">board</a></div>
    </div>`,
    `
    <div id="mainwrap">
      <div>
        <h3 style="padding-left:5px;">This is board page</h3>
        <input type="button" onclick="/create" value="create"></input>
      </div>
    </div>
    `
  );
    response.writeHead(300);
    response.end(html);
  }









});
app.listen(80);
