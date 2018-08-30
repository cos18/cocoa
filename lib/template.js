var func = require('./function.js')

module.exports={
  HTML:function(style, control, body, topbar){
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
  }, show_problem:function(pb_id, time, memory, title, info, inputs, outputs){
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
      <div id="menu" style="text-align:left;"><a href="/board">board</a></div>
    </div>`,`
    <div id="problem">
      <p>PID ${pb_id} // Time Limit ${time}ms // Memory Limit ${memory}MB</p>
      <p>Title ${title}</p>
      <p>상세정보<br>${info}</p>
      <p>입/출력</p>
      <p>${inputs}</p>
      <p>${outputs}</p>
    </div>
    `);
  }
}
