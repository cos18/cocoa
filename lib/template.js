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
        ${style}
      </style>

    </head>
    <body>
    <div id="topbar">
      <div id="login" style="text-align:right;"><a href="/login" style="padding:5px;">login</a><a href="/join" style="padding:5px;">join </a></div>
    </div>
      <h1><a href="/" id="domain">Cocoa</a></h1>
      <script>
      //  아이디 중복확인하는 코드도 필요함.
      function checkForm(form)
        {
          if(form.ID.value == "") {
            alert("Error: ID cannot be blank!");
            form.ID.focus();
            return false;
          }
          var re = /^[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*@[0-9a-zA-Z]([-_.]?[0-9a-zA-Z])*.[a-zA-Z]{2,3}$/;
          if(!re.test(form.ID.value)) {
            alert("Error: ID must be Email");
            form.ID.focus();
            return false;
          }
          /*if(CheckID(this)){
            alert("Error: ID has already exist!");
            form.ID.focus();
            return false;
          }*/

          if(form.pwd.value != "" && form.pwd.value == form.chkpwd.value) {
            if(form.pwd.value.length < 8) {
              alert("Error: Password must contain at least six characters!");
              form.pwd.focus();
              return false;
            }
            if(form.pwd.value == form.username.value) {
              alert("Error: Password must be different from Username!");
              form.pwd.focus();
              return false;
            }
            re = /[0-9]/;
            if(!re.test(form.pwd.value)) {
              alert("Error: password must contain at least one number (0-9)!");
              form.pwd.focus();
              return false;
            }
            re = /[a-zA-Z]/;
            if(!re.test(form.pwd.value)) {
              alert("Error: password must contain at least one letter (A-z)!");
              form.pwd.focus();
              return false;
            }
          } else {
            alert("Error: Please check that you've entered and confirmed your password!");
            form.pwd.focus();
            return false;
          }
          re = /[0-9]/;
          if(re.test(form.username.value)){
            alert("Error: username can't be number");
            form.username.focus();
            return false;
          }
          GroupValue(this);
          return true;
        }

        function GroupValue(obj){
          var radios = document.getElementsByName('group');

          for (var i = 0, length = radios.length; i < length; i++) {
            if (radios[i].checked) {
                obj.group=radios[i].value;
                break;
            }
          }
        }
        /*
        function CheckID(form){
            fs.readdir('../member', function(error,filelist){
              var id = form.ID;
              alert(id);
              var i = 0;
              while(i<filelist.length){
                alert(filelist[i]);
                  if(id === filelist[i])
                    return true;
              }
              return false;
            });
          }
          */

      </script>
      ${control}
      ${body}
    </body>

    </html>
    `;
  }

}
