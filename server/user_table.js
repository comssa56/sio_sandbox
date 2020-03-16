const User = require("./user");

const UserTable = function() {
    this.user_table = {};
}

UserTable.prototype.clear = function() {    
    this.user_table = {};
}

UserTable.prototype.getEntry = function(key) { 
    return this.user_table[key];
}   

UserTable.prototype.createEntry = function(user) {    

    let is_already_registered = false;
    for(let key in this.user_table) {
        let u = this.user_table[key];
        if(user.userid==u.userid) {
            is_already_registered = true;
            u = user;
            break;
        }
    }
    if(!is_already_registered) {
        this.user_table[user.sessionid] = user;
    }

}

UserTable.prototype.rewriteEntry = function(askFn, rewriteFn) {    
    for(let key in this.user_table) {
        let u = this.user_table[key];
        if(askFn(u)) {
            rewriteFn(u);
        }
    }
}

UserTable.prototype.forEach = function(fn) {
    for(let key in this.user_table) {
        fn(this.user_table[key]);
    }
}

UserTable.prototype.toJsonStr = function() {
    return JSON.stringify( this.user_table );
}


module.exports = UserTable;