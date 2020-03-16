var fs = require('fs');
var http = require('http');
var server = http.createServer();
var io = require('socket.io').listen(server);
server.listen(8000);

const User = require('./user.js');
const UserManager = require('./user_manager.js');
const user_manager = new UserManager();

server.on('request', function(req, res) {
  var stream = fs.createReadStream('front/index.html');
//  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});


///////////////////////////////
/// ログイン
///////////////////////////////
function Login(socket, user) {

    user_manager.entryAsync(user).then ( (result) =>{
      return user_manager.getLoginUserInfoListAsync()
    }).then((list) => {  
      io.sockets.emit('add text', "user logined:" + user.name);
      socket.emit('add text', JSON.stringify( list ));    
    }).catch((reject) => {
      console.log("Login() reject:" + reject);
    });  
}


///////////////////////////////
/// ログアウト
///////////////////////////////
function Logout(socket) {
  console.log("logout:" + socket.id);
  user_manager.logoutAsync(socket.id).then((result) => {
    return user_manager.getUserAsync(socket.id);
  }).then((user) => {
    io.sockets.emit('add text', "logouted:" + user.name);
  }).catch ((reject) => {
      console.log("Logout() rejected:" + reject);
  });

}


///////////////////////////////
/// socket.io処理メイン
///////////////////////////////
io.sockets.on('connection', function(socket) {
  console.log("login:"  + socket.id)

  /// ログイン処理を促す
  socket.emit('please login', socket.id);

  /// 切断処理
  socket.on('disconnect', (reason) => {
    Logout(socket);
  });

  /// ログイン処理メイン
  socket.on('login',  function(data) {
    var uid  = data.uid; // 全ユーザを一意に特定するやつ
    var name = data.name;
    var sid  = socket.id;
    const user = new User(sid, uid, name);

    //user_tableの更新処理
    Login(socket, user);

  });

  /// clientからのメッセージ
  socket.on('new message',  function(data) {
      console.log("got message from:" + data.name + ", content:" + data.msg);
      io.sockets.emit('add text', data.name + ":" + data.msg);
  });
  
});



