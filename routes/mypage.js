var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');
var mysql_con = require('../db/db_con.js')();
var auth = require('../lib/auth.js');

var connection = mysql_con.init();

// 마이페이지
router.get('/', function(request, response){
    if (auth.isOwner(request, response)){
      // 이부분을 수정하던, 템플릿을 수정하던 해서 왼쪽에 세부 메뉴를 띄우고 가운데 창에 다른 정보 표시하기
      var html = template.HTML(`
            <div class="ui secondary vertical pointing menu">
              <a class="item active">프로필</a>
              <a class="item">채점 결과</a>
              <a class="item">문제 추천</a>
              <a class="item">알림</a>
              <a class="item">개인정보 수정</a>
            </div>
          <div class="ui segment">
            This is an stretched grid column. This segment will always match the tab height
          </div>
      `,
      template.topbar(request, response)
      );
      response.send(html);
    }
    /*
    <div class=wrapper>
        <aside id=side_menu>
          <p><a href="/mypage/login_update">개인정보 수정</a></p>
          <p><a href="/mypage/result">채점결과</a></p>
          <p><a href="/mypage/problem_rcmd">문제 추천</a></p>
          <p><a href="/mypage/announce">알림</a></p>
        </aside>
        <div id=con></kklddiv>
      </div>
    */
    else {
      console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
    }
})

router.post('/result', function(request, response){
  if(auth.isOwner(request, response)){
    
  } else {
    console.log("login error!");
      response.writeHead(302, {
        Location: `/login?error=nologin`
      });
      response.end();
  }
})
module.exports = router;