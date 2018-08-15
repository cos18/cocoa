module.exports={
  HTML:function(style, control, body){
    return `
    <!doctype html>
    <html>
    <head>
      <title>COCOA</title>
      <meta charset = "utf-8">
      <style>
        ${style}
      </style>

    </head>
    <body>
      <h1>Cocoa</h1>
      <script>
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
          alert("Join Success!!");
          return true;
        }
      </script>
      ${control}
      ${body}
    </body>

    </html>
    `;
  }

}
