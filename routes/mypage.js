var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');
var mysql_con = require('../db/db_con.js')();
var auth = require('../lib/auth.js');

var connection = mysql_con.init();

// 마이페이지 - 프로필
router.get('/', function(request, response){
    if (auth.isOwner(request, response)){
      // 이부분을 수정하던, 템플릿을 수정하던 해서 왼쪽에 세부 메뉴를 띄우고 가운데 창에 다른 정보 표시하기
      var html = template.mypage("프로필", '프로필 페이지', template.topbar(request, response));
      response.send(html);
    }
    else {
      console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
    }
})

// 채점 결과 메인 페이지 
router.get('/result', function(request, response){
  if(auth.isOwner(request, response)){

    var html = template.mypage("채점 결과", '채점 결과 페이지', template.topbar(request, response));
    response.send(html);
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

// 체점 결과 세부 페이지 (체점결과별 결과 확인페이지)
router.post('/result', function(request, response){
  if(auth.isOwner(request, response)){
    var html = template.mypage("채점 결과", '채점 결과 페이지(post)', template.topbar(request, response));
    response.send(html);
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

// 문제 추천 페이지
router.get('/recommend', function(request, response){
  if(auth.isOwner(request, response)){
    var html = template.mypage("문제 추천", '문제 추천 페이지', template.topbar(request, response));
    response.send(html);
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

// 알림 페이지
router.get('/notification', function(request, response){
  if(auth.isOwner(request, response)){
    var html = template.mypage("알림", '알림 페이지', template.topbar(request, response));
    response.send(html);
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

// 개인정보 수정 페이지
router.get('/info', function(request, response){
  if(auth.isOwner(request, response)){
    var html = template.mypage("개인정보 수정", '개인정보 수정 페이지', template.topbar(request, response));
    response.send(html);
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

module.exports = router;