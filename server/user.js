

const User = function (sessionid, userid, name) {
    this.sessionid = sessionid;
    this.userid = userid;
    this.name = name;
};

User.prototype.toJson = function() {
    return {
        "sessionid" : this.sessionid,
        "userid"  : this.userid,
        "name" : this.name,
    }
}


module.exports = User;
