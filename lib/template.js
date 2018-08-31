var func = require('./function.js')
var mysql_con = require('../db/db_con.js')();
var connection = mysql_con.init();
var dbcon_sync = mysql_con.init_sync();

module.exports={
  HTML:function(style, control, body, topbar){
    return `
    <!doctype html>
    <html>
    <head>
      <title>COCOA</title>
      <meta charset = "utf-8">
      <link rel="stylesheet" type="text/css" href="/plugin/codemirror/lib/codemirror.css">
    <link rel="stylesheet" type="text/css" href="/plugin/codemirror/theme/neo.css">
    <link rel="stylesheet" href="/plugin/codemirror/addon/hint/show-hint.css">
      <style>
        #domain{
          color : black;
          text-decoration : none;
        }
        body{
            align-content : center;
            margin-left : 100px;
            margin-right : 100px;
            padding : 10px;
            height : 1000px;
        }
        a {
          color : black;
          text-decoration : none;
        }
        ${style}
      </style>
    </head>
    <body>
    <div id="topbar">
      ${topbar}
    </div>
      <h1><a href="/" id="domain">Cocoa</a></h1>
      ${control}
      ${body}
    </body>

    </html>
    `;
  }, problem_list:function(filelist){
    var list='<ul style="padding-left : 0; list-style-type : none;">';
    var i=0;
    while(i < filelist.length){
      list = list + `<li style="padding : 3px; border-bottom : 1px solid;"><a href="/board/${filelist[i].pb_id}">Problem ID : ${filelist[i].pb_id}, Title : ${filelist[i].title} </a></li>`
      i=i+1;                    // filelist[i]에 해당하는 부분을 문제번호로 바꾸면 좋을것 같아요
    }
    list = list + '</ul>';
    return list;
  }, show_problem:function(pb_id, time, memory, title, info, inputs, outputs, topbar){
    return this.HTML(`
    #menuwrap
    {
      //width : 600px;
      border-top : 3px solid black;
      border-bottom : 3px solid black;
      padding : 5px;
    }
    #problem{
      padding : 10px;
      margin-top : 10px;
      border : 3px solid;
    }
    `,
    `<div id="menuwrap">
      <div id="menu" style="text-align:left;"><a href="/board">board</a> <a href="/result">result</a></div>
    </div>`,`
    <div id="problem">
      <p>PID ${pb_id} // Time Limit ${time}ms // Memory Limit ${memory}MB</p>
      <p>Title ${title}</p>
      <p>상세정보<br>${info}</p>
      <p>입/출력</p>
      <p>${inputs}</p>
      <p>${outputs}</p>
      <form method="post" id="submit" action="/submit">
        <input type="hidden" value="${pb_id}" name="id">
        <input type="submit" value="코드 작성하기">
      </form>
    </div>
    `, topbar);
  }, submit_page:function(pb_id, topbar){
    return this.HTML(`#menuwrap
      {
        border-top : 3px solid black;
        border-bottom : 3px solid black;
        padding : 5px;
      }`,
      `<div id="menuwrap">
        <div id="menu" style="text-align:left;"><a href="/board">board</a></div>
      </div>`,
      `
      <form action="/submit_code" method="post">
        <input type="hidden" name="problemNumber" value="${pb_id}">
        <!--
        <p><input type="text" name="problemNumber" placeholder="Problem Number"></p>
        -->
        <p>
          <textarea class="codemirror-textarea" name="submitCode"></textarea>
        </p>
        <p><input type="submit"></p>
      </form>
      <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
      <script type="text/javascript" src="../plugin/codemirror/lib/codemirror.js"></script>
      <script type="text/javascript" src="../js/default.js"></script>
      <script src="../plugin/codemirror/mode/clike/clike.js"></script>
      <script src="../plugin/codemirror/addon/hint/show-hint.js"></script>
      <script src="../plugin/codemirror/addon/hint/css-hint.js"></script>
      <script src="../plugin/codemirror/addon/edit/closebrackets.js"></script>
    `, topbar);
  }, result_list:function(filelist){
    var list='<ul style="padding-left : 0; list-style-type : none;">';
    var i=0;
    while(i < filelist.length){
      var sresult = "";
      switch (parseInt(filelist[i].result)) {
        case -1:
        sresult = "채점중"; break;
        case 0:
        sresult = "정답"; break;
        case 1:
        sresult = "컴파일에러"; break;
        case 2:
        sresult = "오답"; break;
      }
      var que = `SELECT * FROM Member WHERE numid=${filelist[i].solve_member}`;
      dbcon_sync.query("USE cocoa_web");
      var result = dbcon_sync.query(que)[0];
      list = list + `<li style="padding : 3px; border-bottom : 1px solid;">제출번호 : ${filelist[i].solve_id} // 닉네임 : ${result.nickname} // <a href="/board/${filelist[i].solve_problem}">Problem ID : ${filelist[i].solve_problem}</a> // 결과 : ${sresult} // 코드길이 : ${filelist[i].solve_len}</li>`;
      /*
      connection.query(que, function(err, result){
        console.log(filelist[i]);
        list = list + `<li style="padding : 3px; border-bottom : 1px solid;">제출번호 : ${filelist[i].solve_id} // 닉네임 : ${result.nickname}<a href="/board/${filelist[i].solve_problem}">Problem ID : ${filelist[i].solve_problem}</a> // 결과 : ${result} // 코드길이 : ${filelist[i].solve_len}</li>`;
      });
      */
      i=i+1;                    // 위에 해당하는 부분 바꾸세요
    }
    list = list + '</ul>';
    return list;
  }
}
