var func = require('./function.js')
var mysql_con = require('../db/db_con.js')();
var connection = mysql_con.init();
var dbcon_sync = mysql_con.init_sync();
var auth = require('./auth.js');

// readfile 등등의 함수와 달리 href, src 등등은 '/'를 앞에 쓰고 주소를 이어서 쓰면 인식합니다.
// css, js, plugin등의 정적인 파일들은 앞으로 public폴더에 담아주시고, 여기서 사용해주시면 되는데 코드를 보면 알 수 있듯이, 따로 '/public' 을 안붙여주어도 제대로 인식합니다

module.exports = {
  // 기본 홈페이지
  HTML: function (body, topbar, menu="") {
    const mainMenu = [
      {name : "Board", link :"/problem"},
      {name : "Result", link :"/result"}
    ];
    const pointingMenu = mainMenu.reduce(function(pre,value){
      return pre + `<a class="item`
      + (menu===value.name?" active":"")
      + `" href=${value.link}>${value.name}</a>`;
    }, "");
    return `
    <!doctype html>
    <html>
    <head>
      <title>COCOA</title>
      <meta charset = "utf-8">
      <link rel="stylesheet" type="text/css" href="/plugin/codemirror/lib/codemirror.css">
      <link rel="stylesheet" type="text/css" href="/css/template.css">
      <link rel="stylesheet" type="text/css" href="/plugin/codemirror/theme/neo.css">
      <link rel="stylesheet" href="/plugin/codemirror/addon/hint/show-hint.css">
      <link rel="stylesheet" type="text/css" href="/semantic/dist/semantic.min.css">
      <script
        src="https://code.jquery.com/jquery-3.1.1.min.js"
        integrity="sha256-hVVnYaiADRTO2PzUGmuLJr8BLUSjGIZsDYGmIJLv2b8="
        crossorigin="anonymous"></script>
      <script src="/semantic/dist/semantic.min.js"></script>
      <script scr="/js/semanticmenu.js"></script>
    </head>
    <body>
      <div id="main">
        <h1><a href="/" id="domain">Cocoa</a></h1>
          <div class="ui large menu">
          ${pointingMenu}
          <div class="right menu">
            ${topbar}
          </div>
         </div>    
        <div id="mainbody">
          ${body}
        </div>
      </div>
    </body>

    </html>
    `;
  },
  // 오른쪽 상단에 로그인, 회원가입, 로그아웃 표시
  topbar: function (request, response, select="") {
    let sideMenu = [
      {name : "My page", link :"/mypage"},
      {name : "Log out", link :"/logout"}
    ];
    if (!auth.isOwner(request, response)) {
      sideMenu = [
        {name : "Join", link :"/join"},
        {name : "Log in", link :"/login"}
      ];
    }
    return sideMenu.reduce(function(pre,value){
      return pre + `<a class="item`
      + (select===value.name?" active":"")
      + `" href=${value.link}>${value.name}</a>`;
    }, "");
  },
  // 문제 목록
  problem_list: function (filelist, request, response) {
    var list = `
    <table class="ui celled padded table">
        <thead>
            <tr>
                <th style="width:10%;"> <h5 class="ui center aligned header">PID</h5></th>
                <th style="width:80%;">제목</th>
                <th style="width:10%;">정보</th>
            </tr>
        </thead>
        <tbody>`;
    var i = 0;
    while (i < filelist.length) {
      var ox = "";
      if (auth.isOwner(request, response)) {
        var cookies = auth.getCookies(request);
        var que = `SELECT result FROM Solve WHERE solve_member=${cookies.id} AND solve_problem=${filelist[i].pb_id}`;
        dbcon_sync.query("USE cocoa_web");
        var result = dbcon_sync.query(que);
        if (result[0] !== undefined) {
          ox = "오답";
          for (var j = 0; j < result.length; j++) {
            if (result[j].result === 0) {
              ox = "정답";
            }
          }
        }
      }
      list = list + "<tr";
      if(ox == "정답"){
        list = list + ` class="positive"`;
      } else if (ox == "오답"){
        list = list + ` class="negative"`;
      }
      list = list + `
      >
          <td><h5 class="ui center aligned header">${filelist[i].pb_id}</h5></td>
          <td><a href="/problem/${filelist[i].pb_id}">${filelist[i].title}</a></td>
          <td>${ox}</td>
      </tr>
      `;
      // list = list + `<li style="padding : 3px; border-bottom : 1px solid;"><a href="/board/${filelist[i].pb_id}">Problem ID : ${filelist[i].pb_id}, Title : ${filelist[i].title} </a></li>`
      i = i + 1; // filelist[i]에 해당하는 부분을 문제번호로 바꾸면 좋을것 같아요
    }
    list = list + "</tbody></table>";
    return list;
  },
  // 문제 보여주는 페이지
  show_problem: function (pb_id, time, memory, title, info, inputs, outputs, topbar) {
    return this.HTML(`
    <div id="problem">
      <p>PID ${pb_id} // Time Limit ${time}ms // Memory Limit ${memory}MB</p>
      <p>Title ${title}</p>
      <p>상세정보<br>${info}</p>
      <p>입/출력</p>
      <p>${inputs}</p>
      <p>${outputs}</p>
      <br>
      <p>코드 작성</p>
      <form action="/problem/submit_code" method="post">
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
      <script type="text/javascript" src="/plugin/codemirror/lib/codemirror.js"></script>
      <script type="text/javascript" src="/js/default.js"></script>
      <script src="/plugin/codemirror/mode/clike/clike.js"></script>
      <script src="/plugin/codemirror/addon/hint/show-hint.js"></script>
      <script src="/plugin/codemirror/addon/hint/css-hint.js"></script>
      <script src="/plugin/codemirror/addon/edit/closebrackets.js"></script>
    </div>
    `, topbar, "Board");
  },
  /* 제출 페이지 - 통합되어 사용X
  submit_page:function(pb_id, topbar){
    return this.HTML(`
      <form action="/problem/submit_code" method="post">
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
      <script type="text/javascript" src="/plugin/codemirror/lib/codemirror.js"></script>
      <script type="text/javascript" src="/js/default.js"></script>
      <script src="/plugin/codemirror/mode/clike/clike.js"></script>
      <script src="/plugin/codemirror/addon/hint/show-hint.js"></script>
      <script src="/plugin/codemirror/addon/hint/css-hint.js"></script>
      <script src="/plugin/codemirror/addon/edit/closebrackets.js"></script>
    `, topbar);
  },
  */
  result_list: function (filelist) {
    var list = '<ul style="padding-left : 0; list-style-type : none;">';
    var i = 0;
    while (i < filelist.length) {
      var sresult = "";
      switch (parseInt(filelist[i].result)) {
        case -1:
          sresult = "채점중";
          break;
        case 0:
          sresult = "정답";
          break;
        case 1:
          sresult = "컴파일에러";
          break;
        case 2:
          sresult = "오답";
          break;
        case 3:
          sresult = "시간초과";
      }
      var que = `SELECT * FROM Member WHERE numid=${filelist[i].solve_member}`;
      dbcon_sync.query("USE cocoa_web");
      var result = dbcon_sync.query(que)[0];
      list = list + `<li style="padding : 3px; border-bottom : 1px solid;">제출번호 : ${filelist[i].solve_id} // 닉네임 : ${result.nickname} // <a href="/problem/${filelist[i].solve_problem}">Problem ID : ${filelist[i].solve_problem}</a> // 결과 : ${sresult} // 코드길이 : ${filelist[i].solve_len}</li>`;
      /*
      connection.query(que, function(err, result){
        console.log(filelist[i]);
        list = list + `<li style="padding : 3px; border-bottom : 1px solid;">제출번호 : ${filelist[i].solve_id} // 닉네임 : ${result.nickname}<a href="/problem/${filelist[i].solve_problem}">Problem ID : ${filelist[i].solve_problem}</a> // 결과 : ${result} // 코드길이 : ${filelist[i].solve_len}</li>`;
      });
      */
      i = i + 1; // 위에 해당하는 부분 바꾸세요
    }
    list = list + '</ul>';
    return list;
  },
  // 마이페이지
  mypage: function (menustr, content, topbar) {
    const menu = [
      {name: "프로필", link: "/mypage"},
      {name: "채점 결과", link: "/mypage/result"},
      {name: "문제 추천", link: "/mypage/recommend"},
      {name: "알림", link: "/mypage/notification"},
      {name: "개인정보 수정", link: "/mypage/info"}
    ];
    const pointingMenu = menu.reduce(function (pre, value){
      return pre + `<a class="item`
      + (menustr===value.name?" active":"")
      + `" href=${value.link}>${value.name}</a>`;
    }, "");
    return this.HTML(`
          <div class="ui grid">
            <div class="two wide column">
              <div class="ui secondary vertical pointing menu">
                ${pointingMenu}
              </div>
            </div>
            <div class="fourteen wide column">
              <div class="ui segment" style="margin-left:10px;">
                ${content}
              </div>
            </div>
          </div>
      `, topbar
    )
  }
}