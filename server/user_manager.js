const await_semaphore = require('await-semaphore');
const UserTable = require('./user_table.js');

const UserManager = function() {
    this.mutex = new await_semaphore.Mutex();
    this.user_table = new UserTable();
}

UserManager.prototype.entryAsync = async function(user) {
    const release = await this.mutex.acquire();
    try {
        return this.entry(user);
    } finally {
      release();
    }
}

UserManager.prototype.entry = function(user) {
    user.login = true;
    this.user_table.createEntry(user);
    return true;
}

UserManager.prototype.logoutAsync = async function(user) {
    const release = await this.mutex.acquire();
    try {
        return this.logout(user);
    } finally {
      release();
    }
}

UserManager.prototype.logout = function(sessionid) {
    this.user_table.getEntry(sessionid).login = false;
    return true;
}

UserManager.prototype.getUserAsync = async function(sessionid) {
    const release = await this.mutex.acquire();
    try {
        return this.getUser(sessionid);
    } finally {
      release();
    }
}

UserManager.prototype.getUser = function(sessionid) {
    return this.user_table.getEntry(sessionid);
}

UserManager.prototype.getLoginUserInfoListAsync = async function() {
    const release = await this.mutex.acquire();
    try {
        return this.getLoginUserInfoList();
    } finally {
      release();
    }
}

UserManager.prototype.getLoginUserInfoList = function() {
    return this.getUserInfoList( (user)=>{return user.login;} );
}

UserManager.prototype.getAllUserInfoListAsync = async function() {
    const release = await this.mutex.acquire();
    try {
        return this.getAllUserInfoList();
    } finally {
      release();
    }
}

UserManager.prototype.getAllUserInfoList = function() {
    return this.getUserInfoList( (user)=>{return true;} );
}

UserManager.prototype.getUserInfoList = function( pred ) {
    let list = [];
    this.user_table.forEach(
        (user)=>{
            if(pred(user)) {
                list.push(user);
            }
        }
    );
    return list;
}


module.exports = UserManager;