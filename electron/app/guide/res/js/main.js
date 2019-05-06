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
    $("#welcome").addClass("fadeOut")
    $("#welcome").addClass("animated")
    setTimeout(() => {
        $("#welcome").css("display","none")
        $("#text1").css("display","block")
        setTimeout(() => {
            $("#text1").addClass("fadeOut")
            $("#text1").addClass("animated")
            setTimeout(() => {
                $("#text1").css("display","none")
                $("#text2").css("display","block")
                setTimeout(() => {
                    $("#text2").addClass("fadeOut")
                    $("#text2").addClass("animated")
                    setTimeout(() => {
                        $("#text2").css("display","none");
                        $("#text3").css("display","block");
                        setTimeout(() => {
                            $("#nextbtn").css("display","block")
                            
                        }, 1000);
                    }, 1000);
                }, 3000);
            }, 1000);
        },3000)
    }, 1000);
}, 1000);