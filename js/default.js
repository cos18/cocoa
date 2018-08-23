$(document).ready(function(){
  //code here...
  var code = $(".codemirror-textarea")[0];
  var editor = CodeMirror.fromTextArea(code, {
    lineNumbers : true,
    mode : "text/x-csrc",
    extraKeys : {"Ctrl-Space" : "autocomplete"},
    indentUnit : 0,
    autoCloseBrackets : true
  });
});
