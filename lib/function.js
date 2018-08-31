var fs = require("fs");

module.exports={
  checkForm:function()
    {
      return ` function checkForm(form){
      console.log("working");
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
      //GroupValue(this);
      return true;
    }`
    },
  GroupValue:function()
    {return `function GroupValue(obj){
      var radios = document.getElementsByName('group');

      for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            obj.group=radios[i].value;
            break;
        }
      }
    }`
  }
  // 아이디 중복체크 하는 함수도 필요

}
