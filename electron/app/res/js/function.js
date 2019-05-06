function hide_all() {
    $(".modal").modal('close');
}

function showLogin() {

    $("#loginWindow").modal('open');
    $('.button-collapse').sideNav('hide');
}

function stopPropagation(e) {
    e.stopPropagation();
}