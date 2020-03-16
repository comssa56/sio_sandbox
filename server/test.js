const UserManager = require("./user_manager.js");
const User = require("./user.js");

const user = new User("1","2","3");
const user2 = new User("10","20","30");
const user3 = new User("100","200","30");

const user_manager = new UserManager();

user_manager.entry(user);
user_manager.entry(user2);
user_manager.entry(user3);

user_manager.logout(user2.sessionid);

console.log( user_manager.getLoginUserInfoList() );
console.log( user_manager.getAllUserInfoList() );
