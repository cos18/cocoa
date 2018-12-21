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
      var html = template.mypage("프로필", '프로필 페이지', template.topbar(request, response, "My page"));
      response.send(html);
    }
    else {
      console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=mypage`
      });
      response.end();
    }
})

// 채점 결과 메인 페이지 
router.get('/result', function(request, response){
  if(auth.isOwner(request, response)){
    let stmt = `select * from Solve where solve_member=${auth.getMemberId(request, response)} ORDER BY solve_id DESC LIMIT 10;`;
    connection.query(stmt, function (err, result) {
      var html = template.mypage("채점 결과", template.result_list(result), template.topbar(request, response, "My page"));
      response.send(html);
    });
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})

// 체점 결과 세부 페이지 (체점결과별 결과 확인페이지)
router.get('/result/:solve_id', function(request, response){
  if(auth.isOwner(request, response)){
    let html = "";
    let errorHtml = `
    <h3 class="ui center aligned icon header">
      <i class="exclamation triangle icon"></i>
      이런! 문제가 발생했습니다!
    </h3>
    <button class="ui button" onclick="location.href='/mypage/result'">
      목록으로 돌아가기
    </button>
    `;
    let solve_id = request.params.solve_id;
    let stmt = `select * from Solve where solve_id=${solve_id}`;
    connection.query(stmt, function (err, result) {
      if (err) {
        console.log("DB error!" + err);
        response.send(template.mypage("채점 결과", errorHtml, template.topbar(request, response, "My page")));
      } else {
        if(result[0].solve_member!=auth.getMemberId(request, response)){
          html = template.mypage("채점 결과", errorHtml, template.topbar(request, response, "My page"));
        } else {
          html = template.result_page(result[0], template.topbar(request, response, "My page"));
        }
      }
      response.send(html);
    });
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
    var html = template.mypage("문제 추천", '문제 추천 페이지', template.topbar(request, response, "My page"));
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
    var html = template.mypage("알림", '알림 페이지', template.topbar(request, response, "My page"));
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
    var html = template.mypage("개인정보 수정", '개인정보 수정 페이지', template.topbar(request, response, "My page"));
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