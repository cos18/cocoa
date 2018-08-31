var mysql = require('mysql');
var smysql = require('sync-mysql');

module.exports = function() {
    return {
        init: function () {
          return mysql.createConnection({
            host     : 'cocoa-db.clggldx1p8di.ap-northeast-2.rds.amazonaws.com',
            user     : 'cocoaroot',
            password : 'skkucomedu',
            port     : '3306',
            database : 'cocoa_web'
          })
        },
        test_open: function (con) {
          con.connect(function (err) {
            if (err) {
              console.error('mysql connection error :' + err);
            } else {
              console.info('mysql is connected successfully.');
            }
          })
        },
        init_sync: function() {
          return new smysql({
            host: 'cocoa-db.clggldx1p8di.ap-northeast-2.rds.amazonaws.com',
            user: 'cocoaroot',
            password: 'skkucomedu'
          });
        }
      }
}