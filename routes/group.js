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
        var html = template.group('전체 그룹', '전체 그룹 페이지', template.topbar(request, response, "Group")); //'전체 그룹 페이지' 항목에 그룹 목록이 들어가야함
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
        var html = template.group('내 그룹', '내가 속한 그룹', template.topbar(request, response, "Group")); //'내가 속한 그룹' 항목에 그룹 목록이 들어가야함
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
    var createGroupTemplate;
    if(auth.isOwner(request, response)){
        var html = template.group('그룹 만들기', '그룹 만들기 양식', template.topbar(request, response, "Group")); //'그룹 만들기 양식' 항목에 만드는 양식이 들어가야함
        response.send(html);
      } else {
        console.log("login error!");
          response.writeHead(302, {
            Location: `/auth/login?error=nologin`
          });
          response.end();
      }
    
})



module.exports = router;