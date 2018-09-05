var cookie = require('cookie');
var mysql_con = require('../db/db_con.js')();
var dbcon_sync = mysql_con.init_sync();

module.exports = {
    isOwner: function (request, response) {
        isOwner = false;
        var cookies = {};
        if (request.headers.cookie) {
            cookies = cookie.parse(request.headers.cookie);
        }
        // cookies의 id로 DB 접속해서 pw가 cookies의 status와 일치하면 true반환
        dbcon_sync.query("USE cocoa_web");
        var stmt = `select * from Member where numid='${cookies.id}'`;
        var result = dbcon_sync.query(stmt)[0];
        if (typeof (result) !== "undefined" && cookies.status === result.passwd) {
            isOwner = true;
        }
        return isOwner;
    },
    getCookies: function(request) {
        if (request.headers.cookie){
            return cookie.parse(request.headers.cookie);
        } else {
            return {};
        }
    }
};