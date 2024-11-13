document.addEventListener("DOMContentLoaded", init_sidenav_mobile)
function init_sidenav_mobile() {
    var elems = document.querySelectorAll(".sidenav");
    M.Sidenav.init(elems);
}
