var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var pt = require('platform-tools');
var cp = require('child_process');
var shell = require('shelljs');
var spawn = require('child_process').spawn;
const {
    c,
    cpp,
    node,
    python,
    java
} = require('compile-run');

//happy

var app = http.createServer(function (request, response) {
    var _url = request.url;
    if (_url === '/') {
        _url = '/index.html';
        response.writeHead(200);
        response.end(fs.readFileSync(__dirname + _url));
    } else if (_url === '/submit_code') {
        var body = '';
        request.on('data', function (data) {
            body = body + data;
        });
        request.on('end', function (data) {
            var post = qs.parse(body);
            var problemNumber = post.problemNumber;
            var submitCode = post.submitCode;
            fs.writeFile(`answer_comparing/submit_codes/${problemNumber}.c`, submitCode, 'utf8', function (err) {
                response.writeHead(200);
                response.end('Wait for grading...');
            });

            /*
                  var run = spawn('./answer_comparing/convertCfiletoExe/a.exe', []);//됨
                  run.stdout.on('data', function (output) {
                      console.log(String(output));
                  });
            */

            var compile = spawn('gcc', ['-o', `./answer_comparing/convertToExe/${problemNumber}.exe`, `./answer_comparing/submit_codes/${problemNumber}.c`], {
                shell: true
            });

            compile.stdout.on('data', function (data) {
                console.log('stdout: ' + data);
                
            });

            compile.stderr.on('data', function (data) {
                console.log(String(data));
            });

            compile.on('exit', function (data) {
                if (data === 0) {
                    var run = spawn(`./answer_comparing/convertToExe/${problemNumber}.exe`, ['<', `./problem/${problemNumber}/input/1.txt`, '>', './tmp.txt'], {
                        shell: true
                    });
/*
                    run.stdout.on('data', function (output) {
                        console.log(String(output));
                    });
                    run.stderr.on('data', function (output) {
                        console.log(String(output));
                    });
*/
                    run.on('exit', function (output) {
                        console.log('stdout: ' + output+"!");
                        fs.readFile(`problem/${problemNumber}/output/1.txt`, 'utf8', function (err, ans) {
                          console.log(ans);
                          fs.readFile(`./tmp.txt`, 'utf8', function (err, result) {
                              console.log(result);
                              if(ans===result){
                                console.log('CORRECT!');
                              }
                              else{
                                console.log('NO? SINGO');
                              }
                          });
  
                      });
                    });
                    

                }
            });
            /*
            	fs.readFile(`problem/${problemNumber}/output/1.txt`,'utf8',function(err,description){
            		console.log(description);
            	});
            */
            /*
            	fs.readFile(`./tmp.txt`,'utf8',function(err,description){
                            console.log(description);
                    });
            */
            //	console.log(compile);

            //	var compile2 = spawn(`./answer_comparing/convertToExe/${problemNumber}.exe`,['<',`./problem/${problemNumber}/input/1.txt`,'>','./tmp.txt']);	
            //	console.log(compile2);

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


        });
    } else {
        response.writeHead(200);
        response.end(fs.readFileSync(__dirname + _url));
    }
});
app.listen(4000);