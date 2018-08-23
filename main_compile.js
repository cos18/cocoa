var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var pt = require('platform-tools');
var cp = require('child_process');
var hackerEarth = require('hackerearth-node');

var app = http.createServer(function(request,response){
  var _url = request.url;
  console.log(_url);
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
      fs.writeFile(`answer_comparing/submit_codes/${problemNumber}.c`, submitCode, 'utf8', function(err){
        response.writeHead(200);
        response.end('Success');
      });

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
    });

  } else {
    response.writeHead(200);
    response.end(fs.readFileSync(__dirname+_url));
  }
});
app.listen(4000);
