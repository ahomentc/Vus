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

// try to connect every 4 seconds
var findRoom = setInterval(setRoom, 4000);

function setRoom(){
    alert("hi");
    if(NAF.connection.isConnected()){
        clearInterval(findRoom);
        alert('bye');
        return;
    }
    // replace room in "<a-scene networked-scene" with room from cookie
    var room_name = getCookie("group_session_room");
    // add the actual room to the room_name. Otherwise visible if in different rooms
    var room_url = window.location.pathname.split('/').pop(); // return segment1/segment2/segment3/segment4
    room_name = room_name + "_" + room_url;
    document.getElementsByTagName("a-scene")[0].setAttribute("networked-scene")
    document.getElementsByTagName("a-scene")[0].getAttribute("networked-scene").room = room_name;
    AFRAME.scenes[0].emit('connect');
}