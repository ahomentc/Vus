function iosCopyToClipboard(el) {
    var oldContentEditable = el.contentEditable,
        oldReadOnly = el.readOnly,
        range = document.createRange();

    el.contentEditable = true;
    el.readOnly = false;
    range.selectNodeContents(el);

    var s = window.getSelection();
    s.removeAllRanges();
    s.addRange(range);

    el.setSelectionRange(0, 999999); // A big number, to cover anything that could be inside the element.

    el.contentEditable = oldContentEditable;
    el.readOnly = oldReadOnly;

    document.execCommand('copy');
}

function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i <ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

function copy(){
  document.getElementById("shareURL").select();
  // document.execCommand("copy");
  iosCopyToClipboard(document.getElementById("shareURL"));
}

//document.getElementById("shareURL").value = window.location.href + "/GroupCode=" +  getCookie('group_session_room')
var url = window.location.href
var insertPt = url.indexOf('room')
document.getElementById("shareURL").value = url.slice(0,insertPt-1) + "/grouplink?groupid=" +  getCookie('group_session_room') + "&reroute=" + url.slice(insertPt-1)
