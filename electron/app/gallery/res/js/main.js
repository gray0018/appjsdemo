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

setTimeout(() => {
    $("#pic1").css("display","block")
    setTimeout(() => {
        $("#pic2").css("display","block")
        setTimeout(() => {
            $("#pic3").css("display","block")
            
        }, 1000);    
    }, 1000);
}, 1000);