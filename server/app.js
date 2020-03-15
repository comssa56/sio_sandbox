var await_semaphore = require('await-semaphore');

var fs = require('fs');
var http = require('http');
var server = http.createServer();

const mutex = new await_semaphore.Mutex();

var io = require('socket.io').listen(server);
server.listen(8000);


server.on('request', function(req, res) {
  var stream = fs.createReadStream('front/index.html');
//  res.writeHead(200, {'Content-Type': 'text/html'});
  stream.pipe(res);
});

var usernum = 0;
var user_table = [];

// 指定ミリ秒間だけループさせる（CPUは常にビジー状態）
function sleep(waitMsec) {
  var startMsec = new Date();
   while (new Date() - startMsec < waitMsec);
}

///////////////////////////////
/// ユーザ登録
///////////////////////////////
async function CreateEntry(user) 
{
  const release = await mutex.acquire();
  try {
    var user_found = false;
    for(var u of user_table) {
      if(u.uid==user.uid) {
        console.log("update sid:" + u.sid + "to" + user.sid);
        u.sid = user.sid; // セッション上書き   
        u.login = "true";
        user_found = true;
      }
    }
    if(!user_found) {
      console.log("add sid:" + user.sid + ", name:" + user.name + ", uid:" + user.uid );
      user.login = "true";
      user_table[usernum++] = user;
    }

    var user_list="current user:";
    for(const u of user_table) {
      if(u.name!=user.name) {
        user_list += u.name + ",";
      }
    }
    return user_list;
  } finally {
    release();
  }
}

///////////////////////////////
/// ログイン
///////////////////////////////
function Login(socket, user) {
  CreateEntry(user).then (
    (result) =>{
      io.sockets.emit('add text', "user logined:" + user.name);
      socket.emit('add text', result);
    },
    (reject) =>{
      console.log("login reject:" + reject);
    },
  );  
}

///////////////////////////////
/// ユーザのエントリーを消す
///////////////////////////////
async function　DeleteEntry(sid) {
  const release = await mutex.acquire();
  try {
    for(var user of user_table) {
      if(user.sid==sid) {
        user.login = "false";
        return user.name;
      }
    } 
  } finally {
    release();
  }
}

///////////////////////////////
/// ログアウト
///////////////////////////////
function Logout(socket) {
  console.log("logout:" + socket.id);
  DeleteEntry(socket.id).then(
    (result) => {
      io.sockets.emit('add text', "logouted:" + result)
    },
    (reject) => {
      console.log("logout rejected:" + reject);
    }
  );
}


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
    var user = { 'uid':uid, 'name':name, 'sid':sid };

    //user_tableの更新処理
    Login(socket, user);

  });

  /// clientからのメッセージ
  socket.on('new message',  function(data) {
      console.log("got message from:" + data.name + ", content:" + data.msg);
      io.sockets.emit('add text', data.name + ":" + data.msg);
  });
  
});



