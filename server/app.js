var fs = require('fs');
var http = require('http');
var server = http.createServer();

var io = require('socket.io').listen(server);
server.listen(8000);


server.on('request', function(req, res) {
  var stream = fs.createReadStream('front/index.html');
//  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});

var usernum = 0;
var user_table = [];

io.sockets.on('connection', function(socket) {
  console.log("login:"  + socket.id)

  /// ログイン処理を促す
  socket.emit('please login', socket.id);

  /// 切断処理
  socket.on('disconnect', (reason) => {
    console.log("logout:" + socket.id);
    for(var user of user_table) {
      console.log(user.sid)
      if(user.sid==socket.id) {
        io.sockets.emit('add text', "logouted:" + user.name)
      }
    }

  });

  /// ログイン処理メイン
  socket.on('login',  function(data) {
    var uid  = data.uid; // 全ユーザを一意に特定するやつ
    var name = data.name;
    var sid  = socket.id;
    console.log("logined uid:" + uid + ", name:" + name + ",sid:" + sid);

    //user_tableの更新処理
    var user_found = false;
    for(var user of user_table) {
      if(user.uid==uid) {
        console.log("update sid:" + user.sid + "to" + sid);
        user.sid = sid; // セッション上書き   
        user_found = true;
      }
    }
    if(!user_found) {
      user_table[usernum++] = { 'uid':uid, 'name':name, 'sid':sid };
    }

    // 返答の作成
    var user_list="current user:";
    for(const user of user_table) {
      user_list += user.name + ",";
    }

    io.sockets.emit('add text', "user logined:" + name);
    socket.emit('add text', user_list);
  });

  /// clientからのメッセージ
  socket.on('new message',  function(data) {
      console.log("got message from:" + data.name + ", content:" + data.msg);
      io.sockets.emit('add text', data.name + ":" + data.msg);
  });
  
});



