var express = require('express');
var router = express.Router();
var fs = require('fs');
var template = require('../lib/template.js');
var mysql_con = require('../db/db_con.js')();
var auth = require('../lib/auth.js');
var spawn = require('child_process').spawn;
var spawnSync = require('child_process').spawnSync;
var exec=require('child_process').exec;
var execFile=require('child_process').execFile;

var connection = mysql_con.init();
// 확인해본 결과 writefile, readfile, mkdir 등등 함수에서 파일 위치를 쓸 때는 '../', './', '/' 말고 그냥 바로 '주소'로 들어가도 되고 이게 안 헷갈릴 것 같습니다.

// 문제게시판 페이지
router.get('/', function (request, response) {
  var stmt = 'select * from Problem';
  connection.query(stmt, function (err, result) {
    var list = template.problem_list(result, request, response);
    var html = template.HTML(`
        <div id="mainwrap">
          <div class="table-list">
            ${list}
            <button class="ui button" onclick="window.location.href='/problem/create';">문제 생성</button>
          </div>
        </div>
        `, template.topbar(request, response), "Board");
    response.send(html);
  });
})

// 문제제작 페이지
router.get('/create', function (request, response) {
  var html = template.HTML(`
      <div id="writeboard">
        <h3 style="padding-left : 10px;">Create Problem</h3>
        <form method="post" action="/problem/create_process" style="padding:10px;">
          <p>Problem Title</p>
          <input type="text" name="pb_title" placeholder="Name"></input>
          <p>Problem Info</p>
          <textarea name="pb_info" style="min-width:500px; min-height:150px;" placeholder="type information about problem"></textarea>
          <p>Input</p>
          <textarea name="input" style="min-width:500px; min-height:150px;" placeholder="Input"></textarea>
          <p>Output</p>
          <textarea name="output" style="min-width:500px; min-height:150px;" placeholder="Output"></textarea>
          <p>Limit Time<input type="text" name="lim_time" style="margin-left:10px;" placeholder="ms"></input></p>
          <p>Limit Memory<input type="text" name="lim_mem" style="margin-left:10px;" placeholder="MB"></input></p>
          <p>Hint(shown in page) Number<input type="text" name="hint_num" style="margin-left:10px;" placeholder="number"></input></p>
          <input type="submit" value="create"></input>
        </form>
      </div>`, template.topbar(request, response), "Board");
  response.send(html);
})

// 문제제작 처리 페이지
router.post('/create_process', function (request, response) {
  var post = request.body; // parse를 통해 객체화 시켜서, post에 우리가 submit으로 제출한 POST의 내용이 담겨있을거다.
  var find_que = 'SELECT * FROM Problem ORDER BY pb_id DESC LIMIT 1;';
  connection.query(find_que, function (err, result) {
    var pb_id = parseInt(result[0].pb_id) + 1;
    //console.log(result);
    var que = `INSERT INTO Problem (pb_id, title, lim_time, lim_mem, hint_num) VALUES(${pb_id}, "${post.pb_title}", ${post.lim_time}, ${post.lim_mem}, ${post.hint_num});`;
    connection.query(que, function (err, result) {
      // 지금 여기 pb_title 대신에, DB에서 자동생성한 문제번호(pb_id)를 가져와야 할 것 같아요
      if (!fs.existsSync(`problem/${pb_id}`)) {
        fs.mkdirSync(`problem/${pb_id}`);
      } // 해당 id 폴더 확인
      fs.mkdirSync(`problem/${pb_id}/input`);
      fs.writeFile(`problem/${pb_id}/input/1.txt`, post.input, 'utf8', function (err) { // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
      });

      fs.mkdirSync(`problem/${pb_id}/output`);
      fs.writeFile(`problem/${pb_id}/output/1.txt`, post.output, 'utf8', function (err) {});

      fs.writeFile(`problem/${pb_id}/info.txt`, post.pb_info, 'utf8', function (err) { // 파일 저장이 잘 되면 지금 이 callback함수가 실행되겠죠?
      });

      response.redirect(`/problem/${pb_id}`);
    });
  });
})

/* 문제보기+제출페이지를 통일했습니다.
// 문제제출 페이지
router.post('/submit', function(request, response){
  var post = request.body;
  if (typeof (post.id) !== undefined) {
    var html = template.submit_page(post.id, template.topbar(request, response));
    response.send(html);
  } else {
    response.status(404).send('잘못된 접근입니다');
  }
})
*/

// 문제제출채점 페이지
router.post('/submit_code', function (request, response) {
  if (auth.isOwner(request, response)) {
    var post = request.body;
    var problemNumber = post.problemNumber;
    var submitCode = post.submitCode;
    var memberid = auth.getMemberId(request, response);
    var que = `insert into Solve (solve_member, solve_problem, result, solve_sec, solve_mem, solve_len, solve_lang) VALUES(${memberid}, ${problemNumber}, -1, 0, 0, ${submitCode.length}, 1);`;
    connection.query(que, function (err, result) {
      que = `select * FROM Solve where solve_member=${memberid} ORDER BY solve_id DESC LIMIT 1;`
      connection.query(que, function (err, result) {
        solve_id = result[0].solve_id;
        fs.writeFile(`answer_comparing/submit_codes/${solve_id}.c`, submitCode, 'utf8', function (err) {
          // 내 컴퓨터에서는 컴파일이 안되지만 저쪽 리눅스에선 잘되네...
          var compile = spawn('gcc', ['-o', `answer_comparing/convertToExe/${solve_id}.exe`, `answer_comparing/submit_codes/${solve_id}.c`], {
            shell: true
          });

          compile.stdout.on('data', function (data) {
            console.log('stdout: ' + data);
          });

          compile.stderr.on('data', function (data) {
            console.log(String(data));
          });

          compile.on('exit', function (data) {
            var files = fs.readdirSync(`problem/${problemNumber}/input`);
            var correctAnswer = 0;
            var MAX_BUFFER=1024;//1 KB
            console.log(files);
            if (data === 0) {
              que = `select * FROM Problem where pb_id=${problemNumber};`;
              connection.query(que, function (err, result) {
                let timeLimit = result[0].lim_time;
                //timeLimit /= 1000;
                //해당 문제의 테스트케이스 만큼 반복합니다.
                console.log("Time Limit : ", timeLimit);
                for (var ioNum = 1; ioNum <= files.length; ioNum++) {

                  var INPUT=fs.readFileSync(`problem/${problemNumber}/input/${ioNum}.txt`);
                  //INPUT=cutNewline(INPUT);
                  
                  var run = spawnSync( `./answer_comparing/convertToExe/${solve_id}.exe`, {
                    shell:true, timeout: timeLimit, maxBuffer: MAX_BUFFER, input: INPUT   //답 비교를 위해 컴파일한 파일 실행
                  }); //비동기 함수로 만들었을때 command 또는 File 부분을 읽지 못함
                      //무조건 비동기 함수로 만들어야 무한루프문제 해결할듯
                  
                  //for (var waitShell = 0; waitShell < 50000000; waitShell++);
                  
                  var OLE=true;
                  var TLE = true;
                  
                  if(run.error =="Error: spawnSync /bin/sh ENOBUFS"){
                    OLE = false;
                    console.log("OLE!");
                    break;
                  }

                  if(run.error =="Error: spawnSync /bin/sh ETIMEDOUT"){
                    TLE=false;
                    console.log("TLE == FALSE");
                    break;
                  }
                  
/*
                  console.log("run.error :"+ run.error);
                  console.log("run.output :"+run.output);
                  //console.log("run.pid :"+ run.pid);
                  //console.log("run.signal :"+ run.signal);
                  //console.log("run.status :"+ run.status);*/
                  console.log("run.stderr :"+ run.stderr);
                  console.log("run.stdout :"+ run.stdout);

                  //console.log("run : " + run);
                  console.log("TLE : " + TLE);
                  //console.log("timeLimitCheck : " + timeLimitCheck);

                  //정답 파일을 읽어옵니다.
                  ans = fs.readFileSync(`problem/${problemNumber}/output/${ioNum}.txt`, 'utf8')
                  console.log("ans : " + ans);
                 
                  /*
                  var cut;
                  for (cut = result.length - 1; cut > 0; cut--) {
                    console.log(cut);
                    if (result[cut] != '\n' && result[cut] != ' ') {
                      break;
                    }
                  }
                  result = result.substring(0, cut + 1);
                  console.log("rltChg : " + result);*/
                  

                  //결과 파일을 읽어옵니다.
                  
                  if(run.error === undefined){
                    fs.writeFileSync('tmp.txt',run.stdout);
                    var tmp = fs.readFileSync('tmp.txt');
                    var cut;
                    for (cut = tmp.length - 1; cut > 0; cut--) {
                      console.log("cut:",cut);
                      if (tmp[cut] === 10 || tmp[cut] === 32){ // 10이 \n 32가 공백인듯 싶네요...
                        console.log("line or space");
                        console.log(`tmp[${cut}] : `,tmp[cut]);
                        continue;
                      }
                      else {
                        console.log(`tmp[${cut}] : `,tmp[cut]);
                        console.log("not line nor space");
                        break;
                      }
                    }
                    
                    tmp = tmp.subarray(0, cut+1);
                    console.log("cutted stdout : " + tmp);

                    result = tmp;
                    

                    //result=run.stdout;
                  }

                  
                  //result=cutNewline(result);
                  
                  console.log("result : " + result);
                  
                  
                 // console.log("rltLeng : " + result.length);

                

                  if (ans == result) { //답이 맞으면 맞은 문제 수에 1씩 더합니다.
                    correctAnswer++;
                  }
                  console.log();
                } //for


                console.log("correctAnswer = ", correctAnswer);
                console.log("flies.length = ", files.length);
                //테스트케이스의 수와 맞은 케이스의 수가 같으면 정답 처리를 합니다.
                if (correctAnswer === files.length) {
                  que = `UPDATE Solve SET result=0 where solve_id=${solve_id}`;
                } else if (TLE === false) {
                  que = `UPDATE Solve SET result=3 where solve_id=${solve_id}`;
                } else if (OLE === false) {
                  que = `UPDATE Solve SET result=4 where solve_id=${solve_id}`;
                } else {
                  que = `UPDATE Solve SET result=2 where solve_id=${solve_id}`;
                }
                connection.query(que, function (err, result) {
                  response.writeHead(302, {
                    Location: `/mypage/result/${solve_id}`
                  });
                  response.end('Three different Result');
                });
              });
            } else { // 컴파일에러
              que = `UPDATE Solve SET result=1 where solve_id=${solve_id}`;
              connection.query(que, function (err, result) {
                response.writeHead(302, {
                  Location: `/mypage/result/${solve_id}`
                });
                response.end('Compile ERROR!!');
              });
            }
          });
          //response.writeHead(200);
          //response.end('Wait for grading...');

        });
      });
    });
  } else {
    console.log("login error!");
    response.writeHead(302, {
      Location: `/auth/login?error=submit`
    });
    response.end();
  }
})

// 개별문제 페이지
router.get('/:problem_id', function (request, response) {
  //console.log(request.params.problem_id);
  var pb_id = request.params.problem_id;
  if (pb_id === undefined)
    response.status(404).send('잘못된 접근입니다');
  else {
    var stmt = `select * from Problem where pb_id=${pb_id}`;
    connection.query(stmt, function (err, result) {
      if (err) {
        response.redirect(`/problem`);
      } else {
        result = result[0];
        fs.readFile(`problem/${pb_id}/info.txt`, 'utf8', function (err, info) {
          fs.readFile(`problem/${pb_id}/input/1.txt`, 'utf8', function (err, input) {
            fs.readFile(`problem/${pb_id}/output/1.txt`, 'utf8', function (err, output) {
              var html = template.show_problem(result.pb_id, result.lim_time, result.lim_mem, result.title, info, input, output, template.topbar(request, response));
              response.send(html);
            });
          });
        });
      }
    });
  }
})

// await fs.readFile(`problem/${pb_id}/info.txt`, 'utf8')

module.exports = router;