var func = require('./function.js')
var mysql_con = require('../db/db_con.js')();
var connection = mysql_con.init();
var dbcon_sync = mysql_con.init_sync();
var auth = require('./auth.js');

// readfile 등등의 함수와 달리 href, src 등등은 '/'를 앞에 쓰고 주소를 이어서 쓰면 인식합니다.
// css, js, plugin등의 정적인 파일들은 앞으로 public폴더에 담아주시고, 여기서 사용해주시면 되는데 코드를 보면 알 수 있듯이, 따로 '/public' 을 안붙여주어도 제대로 인식합니다

module.exports = {
  // 기본 홈페이지
  HTML: function (body, topbar, menu = "") {
    const mainMenu = [{
        name: "Board",
        link: "/problem"
      },
      {
        name: "Result",
        link: "/result"
      },
      {
        name: "Group",
        link: "/group"
      }
    ];
    const pointingMenu = mainMenu.reduce(function (pre, value) {
      return pre + `<a class="item` +
        (menu === value.name ? " active" : "") +
        `" href=${value.link}>${value.name}</a>`;
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
      <script src="/js/semanticmenu.js"></script>
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
  topbar: function (request, response, select = "") {
    let sideMenu = [{
        name: "My page",
        link: "/mypage"
      },
      {
        name: "Log out",
        link: "/auth/logout"
      }
    ];
    if (!auth.isOwner(request, response)) {
      sideMenu = [{
          name: "Join",
          link: "/auth/join"
        },
        {
          name: "Log in",
          link: "/auth/login"
        }
      ];
    }
    return sideMenu.reduce(function (pre, value) {
      return pre + `<a class="item` +
        (select === value.name ? " active" : "") +
        `" href=${value.link}>${value.name}</a>`;
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
        // id부여를 제대로 구현 안해놨어요..
        var que = `SELECT result FROM Solve WHERE solve_member=${auth.getMemberId(request, response)} AND solve_problem=${filelist[i].pb_id}`;
        dbcon_sync.query("USE cocoa_web");
        var result = dbcon_sync.query(que);
        if (result[0] !== undefined) {
          ox = "오답";
          for (var j = 0; j < result.length; j++) {
            if (result[j].result === 0) {
              ox = "정답";
              break;
            }
          }
        }
      }
      list = list + "<tr";
      if (ox === "정답") {
        list = list + ` class="positive"`;
      } else if (ox === "오답") {
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
    <div class="ui segment">

      <p><h2>${title}</h2></p>

      <div class="ui teal label">
        <i class="code icon"></i> 
        ${pb_id}
        <a class="detail">문제번호</a>
      </div>
      <div class="ui red label">
        <i class="stopwatch icon"></i> 
        ${time}
        <a class="detail">시간제한</a>
      </div>
      <br><br>

      <p><h4>무얼 하면 될까요?</h4>${info}</p>
      <p><h4>입력 예시</h4></p>
      <div class="ui segment">
        <pre>${inputs}</pre>
      </div>
      <p><h4>출력 예시</h4></p>
      <div class="ui segment">
        <pre>${outputs}</pre>
      </div>
      <br>
      <p><h4 class="ui dividing header">코드를 작성해봅시다!</h4></p>
      <form class="ui form" action="/problem/submit_code" method="post">
        <input type="hidden" name="problemNumber" value="${pb_id}">
        
        <div class="field">
          <textarea class="codemirror-textarea" name="submitCode"></textarea>
        </div>        

        <button class="ui primary button" type="submit">결과를 확인해볼까요?</button>
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
  result_list: function (filelist) {
    var list = `
    <table class="ui celled padded table">
        <thead>
            <tr>
                <th style="width:10%;"> <h5 class="ui center aligned header">SID</h5></th>
                <th style="width:10%;"> <h5 class="ui center aligned header">PID</h5></th>
                <th style="width:25%;">결과</th>
                <th style="width:10%;">시간</th>
                <th style="width:10%;">언어</th>
                <th style="width:10%;">코드길이</th>
                <th style="width:25%;">제출시각</th>
            </tr>
        </thead>
        <tbody>
    `;
    var i = 0;
    let resultVal = ["채점중", "정답", "컴파일에러", "오답", "시간초과", "출력초과"];
    let resultLang = ["C++", "C"];
    while (i < filelist.length) {
      var nresultCode = parseInt(filelist[i].result);
      var sresult = resultVal[nresultCode + 1];
      var slang = resultLang[parseInt(filelist[i].solve_lang)];
      console.log(filelist[i])
      list = list + `
      <tr>
        <td><h5 class="ui center aligned header">${filelist[i].solve_id}</h5></td>
        <td class><h5 class="ui center aligned header"><a href="/problem/${filelist[i].solve_problem}">${filelist[i].solve_problem}</a></h5></td>
        <td class="selectable ${(!nresultCode)?'positive':((nresultCode===2)?"negative":((nresultCode==-1)?"":"warning"))}">
        <a href="/mypage/result/${filelist[i].solve_id}">${sresult}</a></td>
        <td>${filelist[i].solve_sec}</td>
        <td>${slang}</td>
        <td>${filelist[i].solve_len}KB</td>
        <td>${filelist[i].solve_time.format('yyyy-MM-dd a/p hh:mm:ss')}</td>
      </tr>
      `
      i = i + 1; // 위에 해당하는 부분 바꾸세요
    }
    list = list + '</tbody></table>';
    return list;
  },
  // 마이페이지
  mypage: function (menustr, content, topbar) {
    const menu = [{
        name: "프로필",
        link: "/mypage"
      },
      {
        name: "채점 결과",
        link: "/mypage/result"
      },
      {
        name: "문제 추천",
        link: "/mypage/recommend"
      },
      {
        name: "알림",
        link: "/mypage/notification"
      },
      {
        name: "개인정보 수정",
        link: "/mypage/info"
      }
    ];
    const pointingMenu = menu.reduce(function (pre, value) {
      return pre + `<a class="item` +
        (menustr === value.name ? " active" : "") +
        `" href=${value.link}>${value.name}</a>`;
    }, "");
    return this.HTML(`
          <div class="ui grid">
            <div class="two wide column">
              <div class="ui fluid secondary vertical pointing menu">
                ${pointingMenu}
              </div>
            </div>
            <div class="fourteen wide column" style="padding-left:10px;">
              <div class="ui segment" >		
                ${content}		
              </div>
            </div>
          </div>
        `, topbar)
  },
  // 그룹페이지
group: function (menustr, content, topbar, mainmenustr) {
  const menu = [
    {name: "전체 그룹", link: "/group"},
    {name: "내 그룹", link: "/group/myGroup"},
    {name: "그룹 만들기", link: "/group/createGroup"}
  ];
  const pointingMenu = menu.reduce(function (pre, value){
    return pre + `<a class="item`
    + (menustr===value.name?" active":"")
    + `" href=${value.link}>${value.name}</a>`;
  }, "");
  return this.HTML(`
        <div class="ui grid">
          <div class="two wide column">
            <div class="ui fluid secondary vertical pointing menu">
              ${pointingMenu}
            </div>
          </div>
            <div class="fourteen wide column" style="padding-left:10px;">
              <div class="ui segment" >		
                ${content}
              </div>
            </div>
          </div>
        </div>
      `, topbar, mainmenustr
    )
  },
   // 세부 그룹페이지
   part_group: function(menustr, group_id, content, topbar, mainmenustr){
    const menu = [
        {name: "메인", link: `/group/${group_id}`},
        {name: "문제", link: `/group/problemlist/${group_id}`},
        {name: "그룹 Q&A", link: `/group/qna/${group_id}`},
        {name: "코드리뷰확인", link: `/group/review/${group_id}`},
        {name: "그룹 강의", link: `/group/lecture/${group_id}`},
        {name: "관리", link: `/group/admin/${group_id}`}
      ];
      const pointingMenu = menu.reduce(function (pre, value){
        return pre + `<a class="item`
        + (menustr===value.name?" active":"")
        + `" href=${value.link}>${value.name}</a>`;
      }, "");

      return this.HTML(`
      <div class="ui grid">
        <div class="two wide column">
          <div class="ui fluid secondary vertical pointing menu">
            ${pointingMenu}
          </div>
        </div>
        <div class="fourteen wide column" style="padding-left:10px;">
          <div class="ui segment" >		
            ${content}
          </div>
        </div>
      </div>
        `, topbar, mainmenustr
      )
   },
  result_page: function(result,topbar){
    let resultCode =[
      {title: "채점중...", icon: "question circle outline", content: "여길 찾아오기 쉽지 않았을탠데 🤔"},
      {title: "성공!", icon: "check circle outline", content: "잘 맞추셨습니다 :)"},
      {title: "컴파일 에러", icon: "exclamation circle", content: "코드의 문법적인 에러를 찾아보세요!"},
      {title: "오답!", icon: "times circle outline", content:"의도한 답과는 다른 결과나 나왔습니다."},
      {title: "시간 초과", icon: "clock outline", content: "더 쉬운 길을 두고 돌아가는건 아닐까요? 쉬운 길을 찾아보세요!"},
      {title: "출력 초과", icon: "exclamation circle", content:"주로 무한루프가 걸렸을 때 일어납니다. 무한루프를 찾아보세요!"},
    ]
    result.result = resultCode[parseInt(result.result) + 1]

    let resultHTML = `
      <h1 class="ui center aligned icon header">
        <i class="${result.result.icon} icon"></i>
        ${result.result.title}
        <div class="sub header">
          ${result.result.content}
          <br><br>`
    if (result.result.title !== "성공!") {
      resultHTML += `
      <button class="ui button" onclick="location.href='/problem/${result.solve_problem}'">
        문제 다시 풀어보기
      </button>
      `
    }
    resultHTML += `
          <button class="ui button" onclick="location.href='/mypage/result'">
            채점 목록으로 돌아가기
          </button>
        </div>
      </h1>
    `;
    return this.mypage("채점 결과", resultHTML, topbar)
  },
  group_list: function (dblist, request, response) {
    var list = `
    <table class="ui celled padded table">
        <thead>
            <tr>
                <th style="width:10%;"> <h5 class="ui center aligned header">GID</h5></th>
                <th style="width:70%;">그룹명</th>
                <th style="width:20%;">정보</th>
            </tr>
        </thead>
        <tbody>`;
    var i = 0;
    while (i < dblist.length) {
      var status = "";
      if (auth.isOwner(request, response)) {
        var que = `SELECT attend_status FROM GroupAttend WHERE attend_member=${auth.getMemberId(request, response)} AND attend_group=${dblist[i].group_id}`;
        dbcon_sync.query("USE cocoa_web");
        var result = dbcon_sync.query(que);
        if (result[0] !== undefined) {
          status = "승인대기중";
          for (var j = 0; j < result.length; j++) {
            if (result[j].attend_status === 1) {
              status = "소속중";
            } else if (result[j].attend_status === 2) {
              status = "그룹관리자";
            } else if (result[j].attend_status === -1) {
              status = "가입거부";
            }
          }
        }
        if(status === ""){
          status = `
            <button class="ui secondary basic button" onclick="location.href='/group/attend/${dblist[i].group_id}'">
            가입신청
            </button>
          `
        }
      }
      list = list + "<tr";
      list = list + `
      >
          <td><h5 class="ui center aligned header">${dblist[i].group_id}</h5></td>
          <td><a href="/group/${dblist[i].group_id}">${dblist[i].group_name}</a></td>
          <td>${status}</td>
      </tr>
      `;
      i = i + 1; // filelist[i]에 해당하는 부분을 문제번호로 바꾸면 좋을것 같아요
    }
    list = list + "</tbody></table>";
    return list;
  }
}

Date.prototype.format = function (f) {
  if (!this.valueOf()) return " ";

  var weekKorName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
  var weekKorShortName = ["일", "월", "화", "수", "목", "금", "토"];
  var weekEngName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  var weekEngShortName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var d = this;

  return f.replace(/(yyyy|yy|MM|dd|KS|KL|ES|EL|HH|hh|mm|ss|a\/p)/gi, function ($1) {
    switch ($1) {
      case "yyyy":
        return d.getFullYear(); // 년 (4자리)
      case "yy":
        return (d.getFullYear() % 1000).zf(2); // 년 (2자리)
      case "MM":
        return (d.getMonth() + 1).zf(2); // 월 (2자리)
      case "dd":
        return d.getDate().zf(2); // 일 (2자리)
      case "KS":
        return weekKorShortName[d.getDay()]; // 요일 (짧은 한글)
      case "KL":
        return weekKorName[d.getDay()]; // 요일 (긴 한글)
      case "ES":
        return weekEngShortName[d.getDay()]; // 요일 (짧은 영어)
      case "EL":
        return weekEngName[d.getDay()]; // 요일 (긴 영어)
      case "HH":
        return d.getHours().zf(2); // 시간 (24시간 기준, 2자리)
      case "hh":
        return ((h = d.getHours() % 12) ? h : 12).zf(2); // 시간 (12시간 기준, 2자리)
      case "mm":
        return d.getMinutes().zf(2); // 분 (2자리)
      case "ss":
        return d.getSeconds().zf(2); // 초 (2자리)
      case "a/p":
        return d.getHours() < 12 ? "오전" : "오후"; // 오전/오후 구분
      default:
        return $1;
    }
  });
};

String.prototype.string = function (len) {
  var s = '',
    i = 0;
  while (i++ < len) {
    s += this;
  }
  return s;
};
String.prototype.zf = function (len) {
  return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
  return this.toString().zf(len);
};