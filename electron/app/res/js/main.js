var chatUsername = "";
var SIDE_NAV_WIDTH = 992;
// Initialize collapse button
$(".button-collapse").sideNav();
// Initialize collapsible (uncomment the line below if you use the dropdown variation)
//$('.collapsible').collapsible();

$(document).ready(function () {
    // the "href" attribute of .modal-trigger must specify the modal ID that wants to be triggered
    $('.modal').modal();
    $('.modal').modal('close');
    $('.tooltipped').tooltip({
        delay: 50
    });

    setTimeout(() => {
        $("#planeBOMBWindow").modal("open");

    }, 500);
    // $('#loginWindow').modal('close');
    // $('#sendFileWindow').modal('close');
    // $("#loadWindow").modal('close');
    // $("#changePasswdWindow").modal('close');
});


function addMessageToScreen(messageType, message, time, name) {
    if (messageType == "me") {
        var html = '<div class="row"><div class="col s12" style="width:100%;"><div class="row right-align"><div class="row chatLineName right "><label class="chatTime" for="">' + time + '</label><label class="chatName">' + name + '</label><img src="res/img/defaultAvatar.png" alt="" class="avatar z-depth-1"></div><div class="row chatLineMessage right"><p class="chatText z-depth-1">' + message + '</p></div></div></div></div>'
        $("#chatWindow").append(html);
    } else if (messageType == "you") {
        var html = '<div class="row"><div class="col s12"><div class="row chatLine"><div class="row chatLineName"><img src="res/img/defaultAvatar.png" alt="" class="avatar z-depth-1"><label class="chatName">' + name + ' </label><label class="chatTime" for="">' + time + '</label></div><div class="row chatLineMessage"><p class="chatText z-depth-1" >' + message + '</p></div></div></div></div>'
        $("#chatWindow").append(html);
    } else if (messageType = "meOffline") {
        var html = '<div class="row"><div class="col s12"><div class="row chatLine"><div class="row chatLineName"><img src="res/img/defaultAvatar.png" alt="" class="avatar z-depth-1"><label class="chatName">' + name + ' </label><label class="chatTime" for="">' + "未发送" + '</label></div><div class="row chatLineMessage"><p class="chatText z-depth-1" >' + message + '</p></div></div></div></div>'
        $("#chatWindow").append(html);
    }
    // $(".chatWindowFrame")[0].scrollTop = $(".chatWindowFrame")[0].scrollHeight;
    $('.chatWindowFrame').animate({
        scrollTop: $(".chatWindowFrame")[0].scrollHeight
    }, 500);

}

function sendNewMessage() {
    var message = $("#textarea1")[0].value;
    $("#textarea1")[0].value = "";
    t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
    if (user_status[chatUsername] == 0) {
        //user offline
        addMessageToScreen("meOffline", message, t, global_userID);
    } else {
        //user online
        addMessageToScreen("me", message, t, global_userID);
    }

    if (chatUsername == "0") {
        sendSocketGroupMsg(global_userID, message);

    } else {
        sendSocketMsg(global_userID, chatUsername, message);

    }
    chatLog[chatUsername].push([t, global_userID, message]);
}

// function sendNewGroupMessage() {
//     var message = $("#textarea1")[0].value;
//     $("#textarea1")[0].value = "";
//     t = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
//     if(user_status[chatUsername] == 0)
//     {
//         //user offline
//         addMessageToScreen("meOffline", message, t, global_userID);
//     }
//     else
//     {
//         //user online
//         addMessageToScreen("me", message, t, global_userID);
//     }
//     chatLog[chatUsername].push([t, global_userID, message]);
// }


function login() {
    var username = $("#login-name").val();
    var password = $("#login-pass").val();
    if (username.length < 8 || username.length > 16) {
        Materialize.toast('用户名长度应该在8到16位之间！', 2000);
        return;
    }
    if (password.length < 8 || password.length > 16) {
        Materialize.toast('密码长度应该在8到16位之间！', 2000);
        return;
    }
    global_userID = username;
    // MD5password = hexMD5(password);
    // console.log(hexMD5(password));
    // console.log(hexMD5(password).length);
    showLoading("登录中...");
    // sendSocketLogin(username, MD5password);
    sendSocketLogin(username, password);
}

function loginSuccess(success, user_name_dict, user_online_dict) {
    $('#loadWindow').modal('close');
    if (!success) {
        Materialize.toast('登录失败，请重试', 2000);
        $("#login-pass").val("");
    } else {
        Materialize.toast('登录成功！', 2000);
        $("#login-pass").val("");
        $('#loginWindow').modal('close');
        $('#nickName')[0].innerHTML = $("#login-name").val();
        // console.log(user_online_dict);
        $('#friendList')[0].innerHTML = "";
        $('#friendListOffline')[0].innerHTML = "";
        // console.log(user_online_dict);
        for (item in user_online_dict) {
            var html;
            if (user_online_dict[item] == 1) {
                html = '<li><a class="waves-effect" href="#!" onclick="openChat(' + "'" + user_name_dict[item] + "'" + ')">' + user_name_dict[item] + '</a></li>';
                $('#friendList')[0].innerHTML = $('#friendList')[0].innerHTML + html;

            } else {
                html = '<li><a class="waves-effect" href="#!" style="color:gray">' + user_name_dict[item] + '</a></li>';
                $('#friendListOffline')[0].innerHTML = $('#friendListOffline')[0].innerHTML + html;

            }

        }
        $("#btnLogin")[0].style.display = "none";
        $("#btnLogout")[0].style.display = "block";
        if ($("body")[0].offsetWidth <= SIDE_NAV_WIDTH)
            $('.button-collapse').sideNav('show');
    }

}

function openChat(username) {
    chatUsername = username;
    if (username == "0") {
        $(".page-title.brand-logo")[0].innerHTML = $("#groupName")[0].innerHTML;

    } else if (user_status[username] == 0) {
        $(".page-title.brand-logo")[0].innerHTML = username + "（已离线）";

    } else {
        $(".page-title.brand-logo")[0].innerHTML = username;
    }
    if ($("body")[0].offsetWidth <= SIDE_NAV_WIDTH)
        $('.button-collapse').sideNav('hide');
    $('#chatWindow')[0].innerHTML = "";
    showChatLog(username);
}

function showLoading(msg) {
    $("#loadMsg")[0].innerHTML = msg;
    $('#loadWindow').modal('open');

}

function closeLoading() {
    $('#loadWindow').modal('close');

}

function signin() {
    var username = $("#login-name").val();
    var password = $("#login-pass").val();
    if (username.length < 8 || username.length > 16) {
        Materialize.toast('用户名长度应该在8到16位之间！', 2000);
        return;
    }
    if (password.length < 8 || password.length > 16) {
        Materialize.toast('密码长度应该在8到16位之间！', 2000);
        return;
    }
    if (password == "123456789") {
        Materialize.toast('密码不能为123456789！', 2000);
        return;
    }
    global_userID = username;
    // MD5password = hexMD5(password);
    // console.log(hexMD5(password));
    // console.log(hexMD5(password).length);
    showLoading("注册中...");
    // sendSocketLogin(username, MD5password);
    sendRegister(username, password);
}

function signinSucess(success) {
    $('#loadWindow').modal('close');
    if (success == 1) {
        Materialize.toast('用户重复，请更换', 2000);
        $("#login-pass").val("");
    } else if (success == 2) {
        Materialize.toast('系统错误，请稍后重试', 2000);
        $("#login-pass").val("");
    } else {
        Materialize.toast('注册成功！', 2000);
        $("#login-pass").val("");

    }
}

function showChatLog(chatUser) {
    console.log(chatLog);
    clearChatWindow();

    //item 就是用户名

    for (i in chatLog[chatUser]) {
        if (chatLog[chatUser][i][1] == chatUser) {
            addMessageToScreen("you", chatLog[chatUser][i][2], chatLog[chatUser][i][0], chatUser);
        } else {
            addMessageToScreen("me", chatLog[chatUser][i][2], chatLog[chatUser][i][0], chatLog[chatUser][i][1]);
        }
    }

}

function showWelcome() {
    $("#chatWindow")[0].innerHTML = '<div id="welcome" class="welcomeWindow"><img src="res/img/welcome.png" alt=""><label for="">Welcome to Dollars, please login.</label></div>';
}

function clearChatWindow() {
    $("#chatWindow")[0].innerHTML = '';

}

function showChangePasswd() {
    if ($("body")[0].offsetWidth <= SIDE_NAV_WIDTH)
        $('.button-collapse').sideNav('hide');
    $("#changePasswdWindow").modal('open');
}

function changePasswd() {
    passwd_old = $("#passwordOld").val();
    passwd = $("#passwordChanged").val();
    passwd2 = $("#passwordAgain").val();
    $("#passwordOld").val("");
    $("#passwordChanged").val("");
    $("#passwordAgain").val("");

    if (passwd != passwd2) {
        Materialize.toast("两次输入的密码不一致", 2000);
        return;
    }

    if (passwd.length < 8 || passwd.length > 16) {
        Materialize.toast("请输入8到16位密码", 2000);
        return;
    }

    myUsername = $("#nickName")[0].innerHTML;

    if (myUsername == "未登录") {
        Materialize.toast("请先登录", 2000);
        return;
    }

    sendChangePwd(myUsername, passwd_old, passwd);
    //put your change passwd function here;
}

function onChangePasswdSuccess() {
    Materialize.toast("修改密码成功！", 2000);
    $("#changePasswdWindow").modal('close');
}

function onChangePasswdFail(error) {
    if (error == 1) {
        Materialize.toast("修改失败，用户名不存在", 2000);
    } else if (error == 2) {
        Materialize.toast("修改失败，原始密码错误", 2000);
    } else if (error == 3) {
        Materialize.toast("修改失败，系统错误", 2000);
    }
}

function youAreOffline() {
    Materialize.toast("账户已在别处登录，您已离线", 2000);
    $("#nickName")[0].innerHTML = "未登录";
    $(".friendList li").css("color", "gray");
}

function youGotNewMsg(user, msg) {
    Materialize.toast(user + ": " + msg, 1000);
}

function showSendFileWindow() {
    sendToWho = $(".page-title.brand-logo")[0].innerHTML;
    $("#whoAreYouGoingToSend")[0].innerHTML = sendToWho;
    $('#sendFileWindow').modal('open');
}

//有新的文件传入请求时请调用此函数
function youGotNewFile(filename, senderName) {
    // if(chatUsername == 0)
    //     //群聊
    //     senderName = "Dollars Chat"
    $("#recvFileName")[0].innerHTML = filename;
    $("#recvFileSender")[0].innerHTML = senderName;
    $("#recvFileWindow").modal('open');
}

//更新文件传输的百分比请调用此函数
function youFileIsTransmitting(persent) {

    $("#recvFilePersent")[0].style.width = persent + "%";
    $("#recvFilePersentText")[0].innerHTML = persent + "%";
    $("#progressFileWindow").modal("open");
}

function sendFileIsTransmitting(persent) {

    $("#sndFilePersent")[0].style.width = persent + "%";
    $("#sndFilePersentText")[0].innerHTML = persent + "%";
    $("#sndprogressFileWindow").modal("open");
}


function youChooseToRecvFile() {
    $("#recvFileWindow").modal('close');
    Materialize.toast("开始接收文件", 2000);
    //在此放入你的确认接受文件函数
    sendFileAccept();
}

function youChooseNotToRecvFile() {
    $("#recvFileWindow").modal('close');
    Materialize.toast("拒绝接受文件", 2000);
    sendFileDeny();
}

function fileBeRejected() {
    $("#recvFileWindow").modal('close');
    Materialize.toast(chatUsername + "拒绝接受文件", 2000);
}

//当文件传输完成时，调用此函数
function youSuccessRecvTheFile(filename, path) {
    const shell = require('electron').shell
    $("#successFilePath")[0].onclick = function () {
        shell.showItemInFolder(path);
    };
    $("#successFilePath")[0].innerHTML = path;
    $("#successFileName")[0].innerHTML = filename;
    $("#successFileWindow").modal('open');
}

function sndSuccessRecvTheFile(filename, path) {
    const shell = require('electron').shell
    $("#sndsuccessFilePath")[0].onclick = function () {
        shell.showItemInFolder(path);
    };
    $("#sndsuccessFilePath")[0].innerHTML = path;
    $("#sndsuccessFileName")[0].innerHTML = filename;
    $("#sndsuccessFileWindow").modal('open');
}

function showPlaneBOMB() {
    $("#planeBOMBWindow").modal("open");

}

var chess = [];
var pattern = [
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0]
]
var pattern_type = "up"
var pattern_up = [
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 1, 1, 1, 0],
    [0, 0, 0, 0, 0]
]
var pattern_left = [
    [0, 1, 0, 0, 0],
    [0, 1, 0, 1, 0],
    [1, 1, 1, 1, 0],
    [0, 1, 0, 1, 0],
    [0, 1, 0, 0, 0]
]
var pattern_down = [
    [0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0],
    [1, 1, 1, 1, 1],
    [0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0]
]
var pattern_right = [
    [0, 0, 1, 0, 0],
    [1, 0, 1, 0, 0],
    [1, 1, 1, 1, 0],
    [1, 0, 1, 0, 0],
    [0, 0, 1, 0, 0]
]


var defaultcolor = "white"
var previewcolor = "grey"
var nextColor = "red"
var nextColors = ["red", "yellow", "green", "blue", "purple"]
var nextColori = 0;
for (i = 0; i < 10; i++) {
    chess[i] = [];
    for (j = 0; j < 10; j++) {
        chess[i][j] = defaultcolor;
    }
}

var enable_plane_review = 1;
var enable_plane_deploy = 1

function checkPlanePosition(i, j) {
    if (pattern_type == "up") {
        if (i > 6 || j > 5)
            return false
        for (tmp_i = i; tmp_i < i + 4; tmp_i++) {
            for (tmp_j = j; tmp_j < j + 5; tmp_j++) {
                if (pattern_up[tmp_i - i][tmp_j - j]) {
                    if (chess[tmp_i][tmp_j] != "white")
                        return false
                }
            }
        }
        return true
    }
    if (pattern_type == "left") {
        if (i > 5 || j > 6)
            return false
        for (tmp_i = i; tmp_i < i + 5; tmp_i++) {
            for (tmp_j = j; tmp_j < j + 4; tmp_j++) {
                if (pattern_left[tmp_i - i][tmp_j - j]) {
                    if (chess[tmp_i][tmp_j] != "white")
                        return false
                }
            }
        }
        return true
    }
    if (pattern_type == "down") {
        if (i > 6 || j > 5)
            return false
        for (tmp_i = i; tmp_i < i + 4; tmp_i++) {
            for (tmp_j = j; tmp_j < j + 5; tmp_j++) {
                if (pattern_down[tmp_i - i][tmp_j - j]) {
                    if (chess[tmp_i][tmp_j] != "white")
                        return false
                }
            }
        }
        return true
    }
    if (pattern_type == "right") {
        if (i > 5 || j > 6)
            return false
        for (tmp_i = i; tmp_i < i + 5; tmp_i++) {
            for (tmp_j = j; tmp_j < j + 4; tmp_j++) {
                if (pattern_right[tmp_i - i][tmp_j - j]) {
                    if (chess[tmp_i][tmp_j] != "white")
                        return false
                }
            }
        }
        return true
    }
}


function drawChessboard(board) {
    $('.grid-container')[0].innerHTML = "";
    for (i = 0; i < 10; i++) {
        var row = document.createElement('div');
        row.classList = "grid-row";
        for (j = 0; j < 10; j++) {
            var cell = document.createElement("div");
            if (board[i][j] == "grey" && chess[i][j] != "grey" && chess[i][j] != "white")
                //preview cell
                cell.classList = "grid-cell darken-1 " + chess[i][j];
            else
                //normal cell
                cell.classList = "grid-cell " + board[i][j];
            cell.title = i * 10 + j;
            cell.onmouseover = function () {
                if (!enable_plane_review)
                    return
                var chess_tmp = [];
                for (i = 0; i < 10; i++) {
                    chess_tmp[i] = [];
                    for (j = 0; j < 10; j++) {
                        chess_tmp[i][j] = chess[i][j];
                    }
                }
                j = this.title % 10;
                i = (this.title - j) / 10;
                //check pattern
                for (tmp_i = i; tmp_i < i + 5; tmp_i++) {
                    if (tmp_i >= 10)
                        continue
                    for (tmp_j = j; tmp_j < j + 5; tmp_j++) {
                        if (tmp_j >= 10)
                            continue
                        if (pattern[tmp_i - i][tmp_j - j])
                            chess_tmp[tmp_i][tmp_j] = previewcolor
                    }
                }

                drawChessboard(chess_tmp)
            }
            cell.onmouseout = function () {
                if (!enable_plane_review)
                    return
                drawChessboard(chess)
            }
            cell.onmousedown = function (e) {
                if (e.which == 1) {
                    //left click
                    if (enable_plane_deploy) {
                        j = this.title % 10;
                        i = (this.title - j) / 10;
                        if (checkPlanePosition(i, j)) {
                            for (tmp_i = i; tmp_i < i + 5; tmp_i++) {
                                for (tmp_j = j; tmp_j < j + 5; tmp_j++) {
                                    if (pattern[tmp_i - i][tmp_j - j])
                                        chess[tmp_i][tmp_j] = nextColors[nextColori];
                                }
                            }
                            nextColori = (nextColori + 1) % 5
                        }
                    }

                }
                if (e.which == 3 || e.which == 2) {
                    //right click

                    if (!enable_plane_review)
                        return
                    if (pattern_type == "up") {
                        pattern = pattern_left
                        pattern_type = "left";
                    } else if (pattern_type == "left") {
                        pattern = pattern_down
                        pattern_type = "down"
                    } else if (pattern_type == "down") {
                        pattern = pattern_right
                        pattern_type = "right"
                    } else if (pattern_type == "right") {
                        pattern = pattern_up
                        pattern_type = "up"
                    }


                    var chess_tmp = [];
                    for (i = 0; i < 10; i++) {
                        chess_tmp[i] = [];
                        for (j = 0; j < 10; j++) {
                            chess_tmp[i][j] = chess[i][j];
                        }
                    }
                    j = this.title % 10;
                    i = (this.title - j) / 10;
                    //check pattern
                    for (tmp_i = i; tmp_i < i + 5; tmp_i++) {
                        if (tmp_i >= 10)
                            continue
                        for (tmp_j = j; tmp_j < j + 5; tmp_j++) {
                            if (tmp_j >= 10)
                                continue
                            if (pattern[tmp_i - i][tmp_j - j])
                                chess_tmp[tmp_i][tmp_j] = previewcolor
                        }
                    }
                }


            }
            row.append(cell);
        }
        $(".grid-container").append(row);
    }

}

drawChessboard(chess)

window.oncontextmenu = function () {
    return false; // cancel default menu
}

function ready() {
    $(".ready").css("display", "block");
    $(".startgame").css("display", "none")
}

function notready() {
    $(".ready").css("display", "none");
    $(".startgame").css("display", "block")
}