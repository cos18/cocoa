var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');
var mysql_con = require('../db/db_con.js')();
var auth = require('../lib/auth.js');

var connection = mysql_con.init();

//전체 그룹
router.get('/', function(request, response){
    var everyGroupPage;
    if(auth.isOwner(request, response)){
        var html = template.group('전체 그룹', '전체 그룹 페이지', template.topbar(request, response), "Group"); //'전체 그룹 페이지' 항목에 그룹 목록이 들어가야함
        response.send(html);
      } else {
        console.log("login error!");
          response.writeHead(302, {
            Location: `/auth/login?error=nologin`
          });
          response.end();
      }
    
})
//내 그룹
router.get('/myGroup', function(request, response){
    var myGroupPage;
    if(auth.isOwner(request, response)){
        var html = template.group('내 그룹', '내가 속한 그룹', template.topbar(request, response), "Group"); //'내가 속한 그룹' 항목에 그룹 목록이 들어가야함
        response.send(html);
      } else {
        console.log("login error!");
          response.writeHead(302, {
            Location: `/auth/login?error=nologin`
          });
          response.end();
      }
    
})
//그룹 만들기
router.get('/createGroup', function(request, response){
  /* 그룹 양식
    그룹 이름:
    공개/비공개 여부: radiobutton 1(체크):공개 0(비체크):비공개
    그룹장:
  */  
  var createGroupTemplate=
    `
    <form method="post" class="ui form" action="/group/group_process" onsubmit="return checkForm(this);">
      <div class="field">
        <label>그룹 이름</label>
        <input type="text" name="groupname" placeholder="그룹명">
      </div>
      <div class="field">
        <label>공개 여부</label>
        <input type="checkbox" name="groupopen">
      </div>
      <div class="field">
        <label>그룹장</label>
        <input type="text" name="groupleader" placeholder="그룹장">
      </div>
        <script>
          $('.ui.selection.dropdown').dropdown();
        </script> 
      <br>
      <button class="ui primary button" type="submit" value="JOIN">가입</button>
    </form>  		
    `;
    if(auth.isOwner(request, response)){
        var html = template.group('그룹 만들기',createGroupTemplate, template.topbar(request, response), "Group"); //'그룹 만들기 양식' 항목에 만드는 양식이 들어가야함
        response.send(html);
      } else {
        console.log("login error!");
          response.writeHead(302, {
            Location: `/auth/login?error=nologin`
          });
          response.end();
      }
    
})

// 그룹 만들기 처리 페이지
router.post('/group_process', function (request, response) {
  /*
  var post = request.body;
  var description = "";
  var que = `INSERT INTO Member (email, passwd, krname, belong, nickname, member_type) VALUES("${post.ID}", HEX(AES_ENCRYPT('${post.pwd}', MD5('comeducocoa'))), "${post.username}", "${post.belong}", "${post.nickname}", ${post.group});`;
  connection.query(que, function (err, result) {
    response.redirect(`/`);
  });
  */
});

/* 세부 그룹 관련*/
// 세부 그룹 문제 페이지
router.get('/problemlist/:group_id', function(request, response){
  //console.log(request.params.group_id);
  var group_id = request.params.group_id;
  if (group_id === undefined)
      response.status(404).send('잘못된 접근입니다');
  else{
    response.send(template.part_group("문제", group_id,"문제페이지 입니다.",template.topbar(request, response), "Group"));
  }
  
  });

// 세부 그룹 Q&A 페이지
router.get('/qna/:group_id', function(request, response){
  //console.log(request.params.group_id);
  var group_id = request.params.group_id;
  if (group_id === undefined)
      response.status(404).send('잘못된 접근입니다');
  else{
    response.send(template.part_group("그룹 Q&A", group_id,"그룹 Q&A페이지 입니다.",template.topbar(request, response), "Group"));
  }
  
  });

  // 세부 그룹 코드리뷰확인 페이지
  router.get('/review/:group_id', function(request, response){
    //console.log(request.params.group_id);
    var group_id = request.params.group_id;
    if (group_id === undefined)
        response.status(404).send('잘못된 접근입니다');
    else{
      response.send(template.part_group("코드리뷰확인", group_id,"코드리뷰 확인페이지 입니다.",template.topbar(request, response), "Group"));
    }
    
    });

// 세부 그룹 강의 페이지
router.get('/lecture/:group_id', function(request, response){
  //console.log(request.params.group_id);
  var group_id = request.params.group_id;
  if (group_id === undefined)
      response.status(404).send('잘못된 접근입니다');
  else{
    response.send(template.part_group("그룹 강의", group_id,"그룹 강의페이지 입니다.",template.topbar(request, response), "Group"));
  }
  
  });

  // 세부 그룹 관리 페이지
  router.get('/admin/:group_id', function(request, response){
    //console.log(request.params.group_id);
    var group_id = request.params.group_id;
    if (group_id === undefined)
        response.status(404).send('잘못된 접근입니다');
    else{
      response.send(template.part_group("관리", group_id,"관리 페이지 입니다.",template.topbar(request, response), "Group"));
    }
    
    });

  // 세부 그룹 메인 페이지
  router.get('/:group_id', function(request, response){
    //console.log(request.params.group_id);
    var group_id = request.params.group_id;
    if (group_id === undefined)
        response.status(404).send('잘못된 접근입니다');
    else{
      response.send(template.part_group("메인", group_id,"메인페이지 입니다.",template.topbar(request, response), "Group"));
    }
    
  });
module.exports = router;