function sendSocketMsg(snd, rev, msg) {
    const buf = Buffer.alloc(1024);
    buf[0] = 1; //the type of msg
    buf.write(snd, 1);
    buf.write(rev, 17);
    buf.write(msg, 33);
    client.write(buf);
}

function sendSocketGroupMsg(snd, msg) {
    const buf = Buffer.alloc(1024);
    buf[0] = 7; //the type of msg
    buf.write(snd, 1);
    buf.write(msg, 17);
    client.write(buf);
}

function sendSocketLogin(userID, pwd) {
    const buf = Buffer.alloc(1024);
    buf[0] = 2; //the type of msg
    buf.write(userID, 1);
    buf.write(pwd, 17);
    client.write(buf);
}

function rcvLoginSuccess(buf) {
    var i;
    UID = buf.readUInt32BE(1);
    var user_num = buf[5];
    var user_online_dict = {};
    var user_name_dict = {};
    var user_dict = {};
    for (i = 0; i < user_num; i++) {
        tmp_userID = getUserID(buf, 6 + i * 17);
        user_dict[tmp_userID] = buf[6 + (i + 1) * 17 - 1];
        user_name_dict[i] = tmp_userID;
        user_online_dict[i] = buf[6 + (i + 1) * 17 - 1]; //该字节表示user是否在线
    }
    loginSuccess(1, user_name_dict, user_online_dict);
    return user_dict;
}

function getUserID(buf, start) {
    userID = buf.toString(ENCODING, start, start + 16);

    tmp_index = userID.indexOf("\u0000");

    if (tmp_index == -1)
        tmp_index = 16;
    userID = userID.substr(0, tmp_index);
    return userID;
}

function getMsg(buf, start) {
    msg = buf.toString(ENCODING, start);

    tmp_index = msg.indexOf("\u0000");

    if (tmp_index == -1)
        tmp_index = 16;
    msg = msg.substr(0, tmp_index);
    return msg;
}

function updateUserStatus() {

    $('#friendListOffline')[0].innerHTML = "";
    $('#friendList')[0].innerHTML = "";
    for (key in user_status) {
        var html;
        if (user_status[key] == 1) {
            html = '<li><a class="waves-effect" href="#!" onclick="openChat(' + "'" + key + "'" + ')">' + key + '</a></li>';
            $('#friendList')[0].innerHTML = $('#friendList')[0].innerHTML + html;

        } else {
            html = '<li><a class="waves-effect" href="#!" style="color:gray">' + key + '</a></li>';
            $('#friendListOffline')[0].innerHTML = $('#friendListOffline')[0].innerHTML + html;

        }
    }
}

function sendRegister(userID, pwd) {
    const buf = Buffer.alloc(1024);
    buf[0] = 8; //the type of register
    buf.write(userID, 1);
    buf.write(pwd, 17);
    client.write(buf);
}

function sendChangePwd(userID, oldPwd, newPwd) {
    const buf = Buffer.alloc(1024);
    buf[0] = REQUEST_CHANGEPWD; //the type of register
    buf.write(userID, 1);
    buf.write(oldPwd, 17);
    buf.write(newPwd, 33);
    client.write(buf);
}

function updateFileStatus(fileName, rev) {
    fileNum++;
    fs.open(fileName, 'r', (err, fd) => {
        if (err) throw err;
        else {
            file_status[UID << 16 + fileNum] = [fd, 0, rev];
        }
    })
}

/* ********************************************
#define REQUEST_SENDFILE 16
发起请求
[16+发送者ID+接受者ID+文件标号(uint32 4bytes uid<<16+fileNum)+fileBytes(UINT32)+文件名]


   ******************************************** */
function sendFileRequest() {
    // file_status结构 key:UID Value:[receiverID, fileName, fileBytes, data, offset, blockno, maxblockno, percents]
    var filetag = UID << 16 + fileNum;
    fileNum++;
    var fileName = $("#filename")[0].value.substr(12);
    var filePath = $("#filename")[0].files[0].path;
    var fileBytes = $("#filename")[0].files[0].size;
    var data = fs.readFileSync(filePath);

    file_status[filetag] = [];
    file_status[filetag].push(chatUsername);
    file_status[filetag].push(fileName);
    file_status[filetag].push(fileBytes);
    file_status[filetag].push(data);
    file_status[filetag].push(0);// push offset
    file_status[filetag].push(0);// push blockno
    file_status[filetag].push(Math.ceil(fileBytes / 990));// push maxblockno
    file_status[filetag].push(0); // push percents

    const buf = Buffer.alloc(1024);
    buf[0] = 16; //the type of msg
    buf.write(global_userID, 1);
    buf.write(chatUsername, 17);
    buf.writeUInt32BE(filetag, 33);
    buf.writeUInt32BE(fileBytes, 37);
    buf.write(fileName, 41);
    client.write(buf);

}

function sendFileAccept() {
    // buf 结构 [16(0,1)+senderID(1,16)+receiverID(17,16)+filetag(33, 4)+fileBytes(37, 4)+filename(41,-1)]
    // rev_file_status结构 key:UID Value:[senderID, fileBytes, fileName, percents, file_written]
    var buf = tmp_buf;
    var filetag = buf.readUInt32BE(33);
    console.log(filetag);
    var sndID = getUserID(buf, 1);
    rcv_file_status[filetag] = [];//读入UID，作为Key值
    rcv_file_status[filetag].push(sndID);//读入文件发送者ID
    rcv_file_status[filetag].push(buf.readInt32BE(37));//读入文件字节数
    rcv_file_status[filetag].push(getMsg(buf, 41));//读入文件名
    rcv_file_status[filetag].push(0);//写入百分比
    rcv_file_status[filetag].push(0);//写入字节数
    try {
        fs.accessSync(rcv_file_status[filetag][2]);
        //弹窗是否覆盖
        fs.unlinkSync(rcv_file_status[filetag][2]);
        const sndbuf = Buffer.alloc(1024);
        sndbuf[0] = 17; //the type of msg
        sndbuf.write(sndID, 1);
        sndbuf.writeUInt32BE(filetag, 17);
        client.write(sndbuf);
    } catch (error) {
        const sndbuf = Buffer.alloc(1024);
        sndbuf[0] = 17; //the type of msg
        sndbuf.write(sndID, 1);
        sndbuf.writeUInt32BE(filetag, 17);
        client.write(sndbuf);
    }
    // try {
    //     fs.unlinkSync(rcv_file_status[filetag][2]);
    // } catch (error) {
    //     console.log("new file");
    // }


}

function sendFileDeny() {
    var buf = tmp_buf;
    var filetag = buf.readUInt32BE(33);
    console.log(filetag);
    var sndID = getUserID(buf, 1);
    const sndbuf = Buffer.alloc(1024);
    sndbuf[0] = 18; //FILE_DENY
    sndbuf.write(sndID, 1);
    sndbuf.writeUInt32BE(filetag, 17);
    client.write(sndbuf);
}

function sendFilePacket(filetag) {
    // file_status结构 key:UID Value:[receiverID, fileName, fileBytes, data, offset, blockno, maxblockno]
    const buf = Buffer.alloc(1024);
    buf[0] = 21; //the type of msg
    buf.write(file_status[filetag][0], 1); //receiver ID
    buf.writeUInt32BE(filetag, 17);//文件标号UID
    buf.writeUInt32BE(file_status[filetag][5], 21);//文件块数标号
    file_status[filetag][5] += 1; // 文件块数标号+1
    var bytesLeft = file_status[filetag][2] - file_status[filetag][4];
    if (bytesLeft < 990) {
        buf.writeUInt16BE(bytesLeft, 25);//写入字节长度
        file_status[filetag][3].copy(buf, 27, file_status[filetag][4], file_status[filetag][4] + bytesLeft);
        file_status[filetag][4] = file_status[filetag][2];//offset = filelength
    }
    else {
        buf.writeUInt16BE(990, 25);//写入字节长度
        file_status[filetag][3].copy(buf, 27, file_status[filetag][4], file_status[filetag][4] + 990);
        file_status[filetag][4] += 990;//offset += 990
    }
    client.write(buf);
    //update percents
    file_status[filetag][7] = file_status[filetag][4] / file_status[filetag][2];
    if (file_status[filetag][7] == 1) {
        sndSuccessRecvTheFile(file_status[filetag][1], "./");
    }
    // else
    //     sendFileIsTransmitting(Math.ceil(file_status[filetag][7] * 100));
}

function writeFilePacket(buf) {
    var filetag = buf.readUInt32BE(17);
    var fileBytes = buf.readUInt16BE(25);
    var blockno = buf.readUInt32BE(21);
    const data = buf.slice(27, 27 + fileBytes);
    fs.appendFileSync(rcv_file_status[filetag][2], data);
    rcv_file_status[filetag][4] += fileBytes;
    rcv_file_status[filetag][3] = rcv_file_status[filetag][4] / rcv_file_status[filetag][1];
    if (rcv_file_status[filetag][3] == 1) {
        youSuccessRecvTheFile(rcv_file_status[filetag][2], "./");
    }
    // else
    //     youFileIsTransmitting(Math.ceil(rcv_file_status[filetag][3] * 100));
    if ((blockno + 1) % 4 == 0) {
        const buf = Buffer.alloc(1024);
        buf[0] = 20; //the type of msg
        buf.writeUInt32BE(filetag, 1);
        buf.write(rcv_file_status[filetag][0], 5);
        client.write(buf);
    }
}