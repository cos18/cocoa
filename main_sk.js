var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var pt = require('platform-tools');
var cp = require('child_process');
var shell = require('shelljs');
var spawn = require('child_process').spawn;
const {c, cpp, node, python, java} = require('compile-run');

var app = http.createServer(function(request,response){
  var _url = request.url;
  if(_url === '/'){
    _url = '/index.html';
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  }

  else if(_url === '/submit_code'){
    var body = '';
    request.on('data', function(data){
      body = body + data;
    });
    request.on('end', function(data){
      var post = qs.parse(body);
      var problemNumber = post.problemNumber;
      var submitCode = post.submitCode;
      fs.writeFile(`answer_comparing/submit_codes/${problemNumber}.c`, submitCode, 'utf8',function(err){
        response.writeHead(200);
        response.end('Wait for grading...');
      });


      var run = spawn('./answer_comparing/convertCfiletoExe/a.exe', []);//됨
      run.stdout.on('data', function (output) {
          console.log(String(output));
      });


      c.runFile('C:\\Users\\User\\Desktop\\Project\\answer_comparing\\submit_codes\\1000.c', { stdin:'3\n4\n'}, (err, result) => {
          if(err){
            console.log(err);
          }
          else{
            console.log(result);
          }
      });
      console.log(c);

      var compile = spawn('gcc',['-o', 'C:\\Users\\User\\Desktop\\Project\\answer_comparing\\convertCfiletoExe\\test.exe','C:\\Users\\User\\Desktop\\Project\\answer_comparing\\submit_codes\\1000.c']);
      console.log(' ');
      //console.log(compile);

      //shell.exec('gcc',`submit_codes/${problemNumber}.c`,'-o',`/convertCfiletoExe/${problemNumber}`);

/*

      var compile = spawn('gcc', ['1000.c']);
      compile.stdout.on('data', function (data) {
        console.log('stdout: ' + data);
      });
      compile.stderr.on('data', function (data) {
        console.log(String(data));
      });
      compile.on('close', function (data) {
          if (data === 0) {
              var run = spawn('./a.exe', []);
              run.stdout.on('data', function (output) {
                  console.log(String(output));
              });
              run.stderr.on('data', function (output) {
                  console.log(String(output));
              });
              run.on('close', function (output) {
                  console.log('stdout: ' + output);
              });
          }
      });
*/

      /*

      c.runFile('C:\\Users\\User\\Desktop\\Project\\answer_comparing\\submit_codes\\1000.c', { stdin:'3\n4\n'}, (err, result) => {
          if(err){
            console.log(err);
          }
          else{
            console.log(result);
          }
      });
*/
    });
  }

  else {
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  }
});
app.listen(4000);
