// Include Nodejs' net module.
var global_userID = "";
var user_status = {};
var file_status = {};
var rcv_file_status = {};
var chatLog = {};
var recordpath = "";
var fileNum = 0;
var left_buf = [];
var tmp_buf;
const Net = require('net');
// const fs = require('fs');
if (Net == undefined)
    Materialize.toast('require net = undefined', 2000);

const fs = require('fs');
if (fs == undefined)
    Materialize.toast('require fs = undefined', 2000);

// const port = 8080;
// const host = '139.199.5.162';
const port = 28888;
const host = '10.60.102.252';
const ENCODING = 'utf8';
var UID = 0;

const GROUPCHAT = 0;

const ROGER_MSG = 1;
const REPLY_VERIFIED = 3;
const REPLY_UNVERIFIED = 4;
const INFORM_LOGIN = 5;
const INFORM_LOGOUT = 6;
const REPLY_GROUP = 7;
const REPLY_REGISTER = 9;
const INFORM_KICKOUT = 10;

const REQUEST_CHANGEPWD = 11;
const REPLY_CHANGEPWD = 12;
const REQUEST_SENDFILE = 16;
const FILE_ACCEPT = 17;
const FILE_DENY = 18;

const REPLY_ACK = 20;
const TRANSPORT_FILE = 21;

// Create a new TCP client.
const client = new Net.Socket();
// Send a connection request to the server.

client.connect({
    port: port,
    host: host
}, function () {
    // If there is no error, the server has accepted the request and created a new 
    // socket dedicated to us.
    console.log('TCP connection established with the server.');
    // The client can now send data to the server by writing to its socket.
    // client.write('Hello, server.');
});

client.on('error', function (e) {
    Materialize.toast("连接服务器失败", 2000);
    Materialize.toast(e, 2000);
})

client.on('data', function (buf) {
    //报文设计 第一个字节3表示登录成功 第二个字节表示人数 之后每17个字节表示一个用户第十七个字节是在线flag 0不在线 1在线
    var len = buf.length
    if (len == 1024 && left_buf.length == 0) {
        if (buf[0] == ROGER_MSG) {
            user_snd = getUserID(buf, 1);
            user_rcv = getUserID(buf, 17);
            // recordpath = `C:/Users/32714/Documents/groupchat/${global_userID}/${user_snd}`;
            msg = getMsg(buf, 33);
            t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            chatLog[user_snd].push([t, user_snd, msg]);
            if (user_snd == chatUsername) {
                addMessageToScreen("you", msg, t, user_snd);
            } else {
                //加入新消息提示，不需要预览消息，显示 来自username的新消息 即可
                youGotNewMsg(user_snd, msg);
            }

        } else if (buf[0] == REQUEST_SENDFILE) {
            //这个地方设计选择接收或拒绝的按钮
            //选择accept调用该函数
            tmp_buf = buf;
            youGotNewFile(getMsg(buf, 41), getUserID(buf, 1));
            //sendFileAccept(buf);
            //选择deny调用该函数
            //sendFileDeny(buf);
        } else if (buf[0] == REPLY_GROUP) {
            user_snd = getUserID(buf, 1);
            msg = getMsg(buf, 17);
            t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
            chatLog[GROUPCHAT].push([t, user_snd, msg]);
            if (chatUsername == GROUPCHAT) {
                addMessageToScreen("you", msg, t, user_snd);
            } else {
                //加入新消息提示，不需要预览消息，显示 来自username的新消息 即可
                youGotNewMsg("群聊:", msg);
            }
        } else if (buf[0] == FILE_ACCEPT) {
            var uuid = buf.readInt32BE(17);
            for (var i = 0; i < 4; i++) {
                if (file_status[uuid][5] >= file_status[uuid][6])
                    break;
                else
                    sendFilePacket(uuid);
            }
        } else if (buf[0] == FILE_DENY) {
            fileBeRejected();
        } else if (buf[0] == REPLY_ACK) {
            var uuid = buf.readInt32BE(1);
            for (var i = 0; i < 4; i++) {
                if (file_status[uuid][5] >= file_status[uuid][6])
                    break;
                else
                    sendFilePacket(uuid);
            }
        } else if (buf[0] == TRANSPORT_FILE) {
            writeFilePacket(buf);
        } else if (buf[0] == FILE_DENY) {
            ;
        } else if (buf[0] == INFORM_LOGIN) {
            user_status[getUserID(buf, 1)] = 1;
            updateUserStatus();
        } else if (buf[0] == INFORM_LOGOUT) { //3表示登录成功，并更新联系人列表
            user_status[getUserID(buf, 1)] = 0;
            updateUserStatus();
        } else if (buf[0] == REPLY_VERIFIED) {
            user_status = rcvLoginSuccess(buf);
            for (username in user_status) { //将在线的用户 本地聊天记录从文件中导入
                chatLog[username] = [];
            }
            chatLog[GROUPCHAT] = [];//保存群聊的聊天记录
        } else if (buf[0] == REPLY_UNVERIFIED) {
            if (buf[1] == 1) {
                console.log("ID不存在");
                Materialize.toast("ID不存在", 2000);
                closeLoading();
            } else if (buf[1] == 2) {
                console.log("密码错误");
                Materialize.toast("密码错误", 2000);
                closeLoading();
            } else if (buf[1] == 3) {
                console.log("系统预留账户，需要改密码");
                Materialize.toast("系统预留账户，需要改密码", 2000);
                closeLoading();
            } else if (buf[1] == 4) {
                console.log("系统错误");
                Materialize.toast("系统错误", 2000);
                closeLoading();
            }
        } else if (buf[0] == INFORM_KICKOUT) {
            //console.log("kick out");
            youAreOffline();
        } else if (buf[0] == REPLY_REGISTER) {
            if (buf[1] == 0) {
                signinSucess(0);
            } else if (buf[1] == 1) {
                signinSucess(1);
            } else if (buf[1] == 2) {
                signinSucess(2);
            }
        } else if (buf[0] == REPLY_CHANGEPWD) {
            if (buf[1] == 0) {
                onChangePasswdSuccess();
            } else if (buf[1] == 1) {
                onChangePasswdFail(1);
            } else if (buf[1] == 2) {
                onChangePasswdFail(2);
            } else if (buf[1] == 3) {
                onChangePasswdFail(3);
            }
        }
    }
    else {
        if (left_buf.length)
            var newbuf = Buffer.concat([left_buf, buf]);
        else
            var newbuf = buf;
        while (newbuf.length >= 1024) {
            buf = newbuf.slice(0, 1024);
            if (buf[0] == ROGER_MSG) {
                user_snd = getUserID(buf, 1);
                user_rcv = getUserID(buf, 17);
                // recordpath = `C:/Users/32714/Documents/groupchat/${global_userID}/${user_snd}`;
                msg = getMsg(buf, 33);
                t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                chatLog[user_snd].push([t, user_snd, msg]);
                if (user_snd == chatUsername) {
                    addMessageToScreen("you", msg, t, user_snd);
                } else {
                    //加入新消息提示，不需要预览消息，显示 来自username的新消息 即可
                    youGotNewMsg(user_snd, msg);
                }

            } else if (buf[0] == REQUEST_SENDFILE) {
            //这个地方设计选择接收或拒绝的按钮
            //选择accept调用该函数
            tmp_buf = buf;
            youGotNewFile(getMsg(buf, 41), getUserID(buf, 1));
            //sendFileAccept(buf);
            //选择deny调用该函数
            //sendFileDeny(buf);
            } else if (buf[0] == REPLY_GROUP) {
                user_snd = getUserID(buf, 1);
                msg = getMsg(buf, 17);
                t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
                chatLog[GROUPCHAT].push([t, user_snd, msg]);
                if (chatUsername == GROUPCHAT) {
                    addMessageToScreen("you", msg, t, user_snd);
                } else {
                    //加入新消息提示，不需要预览消息，显示 来自username的新消息 即可
                    youGotNewMsg("群聊:", msg);
                }
            } else if (buf[0] == FILE_ACCEPT) {
                var uuid = buf.readInt32BE(17);
                for (var i = 0; i < 4; i++) {
                    if (file_status[uuid][5] >= file_status[uuid][6])
                        break;
                    else
                        sendFilePacket(uuid);
                }
            } else if (buf[0] == FILE_DENY) {
                fileBeRejected();
            } else if (buf[0] == REPLY_ACK) {
                var uuid = buf.readInt32BE(1);
                for (var i = 0; i < 4; i++) {
                    if (file_status[uuid][5] >= file_status[uuid][6])
                        break;
                    else
                        sendFilePacket(uuid);
                }
            } else if (buf[0] == TRANSPORT_FILE) {
                writeFilePacket(buf);
            } else if (buf[0] == FILE_DENY) {
                ;
            } else if (buf[0] == INFORM_LOGIN) {
                user_status[getUserID(buf, 1)] = 1;
                updateUserStatus();
            } else if (buf[0] == INFORM_LOGOUT) { //3表示登录成功，并更新联系人列表
                user_status[getUserID(buf, 1)] = 0;
                updateUserStatus();
            } else if (buf[0] == REPLY_VERIFIED) {
                user_status = rcvLoginSuccess(buf);
                for (username in user_status) { //将在线的用户 本地聊天记录从文件中导入
                    chatLog[username] = [];
                }
                chatLog[GROUPCHAT] = [];//保存群聊的聊天记录
            } else if (buf[0] == REPLY_UNVERIFIED) {
                if (buf[1] == 1) {
                    console.log("ID不存在");
                    Materialize.toast("ID不存在", 2000);
                    closeLoading();
                } else if (buf[1] == 2) {
                    console.log("密码错误");
                    Materialize.toast("密码错误", 2000);
                    closeLoading();
                } else if (buf[1] == 3) {
                    console.log("系统预留账户，需要改密码");
                    Materialize.toast("系统预留账户，需要改密码", 2000);
                    closeLoading();
                } else if (buf[1] == 4) {
                    console.log("系统错误");
                    Materialize.toast("系统错误", 2000);
                    closeLoading();
                }
            } else if (buf[0] == INFORM_KICKOUT) {
                //console.log("kick out");
                youAreOffline();
            } else if (buf[0] == REPLY_REGISTER) {
                if (buf[1] == 0) {
                    signinSucess(0);
                } else if (buf[1] == 1) {
                    signinSucess(1);
                } else if (buf[1] == 2) {
                    signinSucess(2);
                }
            } else if (buf[0] == REPLY_CHANGEPWD) {
                if (buf[1] == 0) {
                    onChangePasswdSuccess();
                } else if (buf[1] == 1) {
                    onChangePasswdFail(1);
                } else if (buf[1] == 2) {
                    onChangePasswdFail(2);
                } else if (buf[1] == 3) {
                    onChangePasswdFail(3);
                }
            }
            newbuf = newbuf.slice(1024);
        }
        left_buf = newbuf;
    }
});
