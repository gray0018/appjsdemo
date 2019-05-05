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

function send(){
    var canvas = document.getElementsByClassName("drawing-board-canvas")[0];
    var dataURL = canvas.toDataURL();

    var html = '<div class="row right" style="position:relative;width:100%;"><div class="msgbox z-depth-1-half" style="overflow:hidden;z-index:-1;width:200px;background-color: #ff94c2;display: inline-block;position: relative;right: 10px;border-radius: 5px;"><img src="'+dataURL+'" alt="" style="width:100%;height:auto;"></div><div class="arrow" style="z-index:1;width: 0; height: 0; border-top: 10px solid transparent;border-bottom: 10px solid transparent; border-left:10px solid #ff94c2;display: inline-block;position:absolute;top:5px;"></div></div><br>'
    $("#chatbox")[0].innerHTML += html;
}

var myBoard = new DrawingBoard.Board('draw');