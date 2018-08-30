var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var pt = require('platform-tools');
var cp = require('child_process');
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
      c.runFile('C:\Users\User\Desktop\Project\answer_comparing\submit_codes\1004.c', { stdin:'3\n4\n'}, (err, result) => {
          if(err){
            console.log(err);
          }
          else{
            console.log(result);
          }
      });

    });
  }

  else {
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  }
});
app.listen(4000);
