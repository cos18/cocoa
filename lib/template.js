var func = require('./function.js')

module.exports={
  HTML:function(style, control, body){
    return `
    <!doctype html>
    <html>
    <head>
      <title>COCOA</title>
      <meta charset = "utf-8">
      <style>
        #domain{
          color : black;
          text-decoration : none;
        }
        body{
            align-content : center;
            //border-left:1px solid black;
            //border-right:1px solid black;
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
      <div id="login" style="text-align:right;"><a href="/login" style="padding:5px;">login</a><a href="/join" style="padding:5px;">join </a></div>
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
      list = list + `<li style="padding : 3px; border-bottom : 1px solid;"><a href="/board/${filelist[i]}">Problem Title : ${filelist[i]}</a></li>`
      i=i+1;                    // filelist[i]에 해당하는 부분을 문제번호로 바꾸면 좋을것 같아요
    }
    list = list + '</ul>';
    return list;
  }
}
