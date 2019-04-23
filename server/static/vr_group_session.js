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

function setCookie(name,value,days) {
    var expires = "";
    if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days*24*60*60*1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

// set that we visited this room

if(getCookie('vr_rooms_visited')){
    var vr_rooms_visited = JSON.parse(getCookie('vr_rooms_visited'));
    if(vr_rooms_visited.indexOf(window.location.href) < 0){
        vr_rooms_visited.push(window.location.href);
    }
    setCookie('vr_rooms_visited',JSON.stringify(vr_rooms_visited),null);    
}
else{
    vr_rooms_visited = [window.location.href]
    setCookie('vr_rooms_visited',JSON.stringify(vr_rooms_visited),null);   
}


function setRoom(){
    // replace room in "<a-scene networked-scene" with room from cookie
    let room_name = getCookie("group_session_room");
    document.getElementsByTagName("a-scene")[0].setAttribute("networked-scene")
    document.getElementsByTagName("a-scene")[0].getAttribute("networked-scene").room = room_name;
    AFRAME.scenes[0].emit('connect');
}

setTimeout(function(){ setRoom(); }, 4000);