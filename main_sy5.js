var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var pt = require('platform-tools');
var cp = require('child_process');
//var shell = require('shelljs');
//const {c, cpp, node, python, java} = require('compile-run');
//var hackerEarth = require('commpilex');

var app = http.createServer(function(request,response){
  var _url = request.url;
  //console.log(_url);
  if(_url === '/'){
    _url = '/index.html';
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  } else if(_url === '/submit_code'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(data){
      var post = qs.parse(body);
      var problemNumber = post.problemNumber;
      var submitCode = post.submitCode;
      //console.log('123123123123  '+problemNumber);
      if(problemNumber === ''){ // 코드 번호가 없을 시 입력 후 제출하라는 코드 작성해야 함 .. DB연결 후 오토로 돌리는 방향 모색
        alert('!!!');
      }
      else{
        fs.writeFileSync(`answer_comparing/submit_codes/${problemNumber}.c`, submitCode, 'utf8');

        //cp.spawn("./answer_comparing/compile_c",[]);
        //cp.spawn("./answer_comparing/convertToExe/compileComplete",[]);
        /*cp.fork(`gcc ./answer_comparing/submit_codes/${problemNumber}.c -o ./answer_comparing/convertCfiletoExe/${problemNumber}`, function(err, stdout, stderr){
          console.log(stdout);
          console.log(stderr);
          console.log(err);
        });
        cp.fork(`./answer_comparing/convertCfiletoExe/${problemNumber} < ./answer_comparing/convertCfiletoExe/${problemNumber}_input.txt > ./answer_comparing/answer_codes/${problemNumber}_output.txt`, function(err, stdout, stderr){
          console.log(stdout);
          console.log(stderr);
          console.log(err);
        });*/
        response.writeHead(200);
        response.end('Success');
        //cp.exec('sleep 10s', function(err, stdin, stderr){});
        /*// gcc compile code
        var source = `answer_comparing/submit_codes/${problemNumber}.c`;
        var object = `answer_comparing/submit_codes/${problemNumber}.o`;
        var destination = `answer_comparing/convertCfiletoExe/${problemNumber}`;
        var hackerEarth = new hackerEarth(
          //'14743082f39f6bac075a5762d1ee3151389bfd85';
          //async = 0;
        );
        var config={};
        config.time_limit = 1;
        config.memory_limit = 262144;
        config.source = ``;
        config.input="";
        config.language="C";
        fs.readFile(source, 'utf8', function(err, res){
          console.log(res);
        });*/
      }
    });
  } else {
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  }
});
app.listen(4000);
