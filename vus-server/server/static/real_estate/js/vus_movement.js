var photosHeadset = {
    'master': [3, .5],
    'living2': [10, 6],
    'dining': [16.478, -0.984],
    'room1': [1.3, -7],
    'room2': [7.5, -7],
    'guest': [11.6, -6.143],
    'bath_guest': [15.7, -8.644],
    'bath_guest2': [15.7, -7.532],
    'dining2': [13.8, .76],
    'hall1': [10.08, -1.9],
    'hall2': [10.77, .97],
    'bath_kids': [4.17, -6.7],
    'bath_master': [3.69, 6.6],
    'hall3': [21.97, -2.643],
    'living1': [20.16, -6],
    'kitchen1': [19.56, .994],
    'tools': [15.408, -4.790]
};

var rotations = {
    'master': -90,
    'living2': -120,
    'dining': 100,
    'room1': -80,
    'room2': -90,
    'guest': -220,
    'bath_guest': 90,
    'bath_guest2': 90,
    'dining2': -120,
    'hall1': 100,
    'hall2': 90,
    'bath_kids': 90,
    'bath_master': -90,
    'hall3': 0,
    'living1': 40,
    'kitchen1': 90,
    'tools': 90
}

var isMobile;
var pano_enabled = false;

// ----------------------------
// ----- Helper functions -----
// ----------------------------

function getClosestImage(x,z,photos){
    closestVal = 1000000;
    closestImage = ''
    for(var key in photos) {
        var x_photo = photos[key][0];
        var z_photo = photos[key][1];
        var distance = Math.sqrt((Math.pow(x-x_photo,2))+(Math.pow(z-z_photo,2)));
        if(distance < closestVal){
            closestVal = distance;
            closestImage = key;
        }
    }              
    return closestImage;
}

function getClosestImageDist(x,z,photos){
    closestVal = 1000000;
    closestImage = ''
    for(var key in photos) {
        var x_photo = photos[key][0];
        var z_photo = photos[key][1];
        var distance = Math.sqrt((Math.pow(x-x_photo,2))+(Math.pow(z-z_photo,2)));
        if(distance < closestVal){
            closestVal = distance;
            closestImage = key;
        }
    }              
    return closestVal;
}

// returns an array holding x,z or the closest picture
function getClosestImageCoords(x,z,photos){
    closestVal = 100000;
    closestCoords = [];
    for(var key in photos){
        var x_photo = photos[key][0];
        var z_photo = photos[key][1];
        var distance = Math.sqrt((Math.pow(x-x_photo,2))+(Math.pow(z-z_photo,2)));
        if(distance < closestVal){
            closestVal = distance;
            closestCoords = photos[key];
        }
    }
    return closestCoords
}

function getClosetImageInFront(x,z,photos){
    // get a point in front of user.
    var angle = camera.getAttribute("rotation")
    var x = 5 * Math.cos((angle.y-90) * Math.PI / 180)
    var y = 5 * Math.sin((angle.y-90) * Math.PI / 180)
    var pos = player.getAttribute("position")
    var new_x = pos.x -= y;
    var new_z = pos.z -= x;
        
    // now find the closest picture to that point
    return getClosestImage(new_x,new_z,photos);
}

function getClosestImageInFrontCoords(x,z,photos){
 // get a point in front of user.
    var angle = camera.getAttribute("rotation")
    var x = 5 * Math.cos((angle.y-90) * Math.PI / 180)
    var y = 5 * Math.sin((angle.y-90) * Math.PI / 180)
    var pos = player.getAttribute("position")
    var new_x = pos.x -= y;
    var new_z = pos.z -= x;
    
    // now find the closest picture to that point
    return getClosestImageCoords(new_x,new_z,photos);
}

// Adjust the players position when enter VR because aframe is weird here
document.body.addEventListener('enter-vr', function (evt) {
    var posx = document.getElementById("player").getAttribute('position').x;
    var posy = document.getElementById("player").getAttribute('position').y - 1.5;
    var posz = document.getElementById("player").getAttribute('position').z;
    var pos = posx.toString() + " " + posy.toString() + " " + posz.toString();
    document.getElementById("player").setAttribute('position',pos);
});

// Fade in and out a black 360 picture to transition
function transition(){
  document.getElementById("transition_sphere").setAttribute('visible', true);
      document.getElementById("transition_sphere").emit("fadein");
      setTimeout(function(){
            document.getElementById("transition_sphere").emit("fadeout");
      },500);
      setTimeout(function(){
            document.getElementById("transition_sphere").setAttribute('visible', false);
      },1000);
}

// ----------------------------
// ----- Mobile Controls ------
// ----------------------------
AFRAME.registerComponent("enter_sphere", {
  init: function() {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    canvasEl.addEventListener('touchstart', function(){
      isMobile = true;
    });

    // for mobile, disable movement while inside sphere unless touch is held in place
    // this is so that the user doesn't move when their scrolling around the 360 photo
    canvasEl.addEventListener('touchmove', function(){
      if(pano_enabled){
          document.getElementById("player").setAttribute("movement-controls", 'speed', 0);
      }

    });
    canvasEl.addEventListener('touchend', function(){
      if(pano_enabled){
          document.getElementById("player").setAttribute("movement-controls", 'speed', 0.1);        
      }

    });
  },
    tick: function(){
        if(isMobile){
            // player is always 0 0 on desktop. Desktop uses a-camera
            var posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
            var posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z; 
            var closestImage = getClosestImage(posx,posz,photosHeadset);
            var distance = getClosestImageDist(posx,posz,photosHeadset);
            if(distance > .4 && pano_enabled){
                // enter VR mode
                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementById("grid").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
                document.getElementById("apt_sky").setAttribute('src', "#black"); 

                // enable marker closest to user
                document.getElementById(closestImage + "_bcn").setAttribute('visible', true);

                var pos = document.getElementById("player").getAttribute('position');
                pos.x = posx;
                pos.z = posz;
                document.getElementById("apt_sky").setAttribute('position', pos);

                pano_enabled = false;
            }
            else if (distance <= .4 && !pano_enabled){
                // enter pano mode
                document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);
                document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[closestImage] + ' 0');
                // disable the marker closest to user
                document.getElementById(closestImage + "_bcn").setAttribute('visible', false);

                document.getElementById("real_sky").setAttribute('visible', false);
                document.getElementById("grid").setAttribute('visible', false);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);

                document.getElementById("apt_sky").setAttribute('visible', true);
                pano_enabled = true;
            }
      }
  }
})


// ----------------------------
// ----- Headset Controls -----
// ----------------------------
document.body.addEventListener('triggerdown', function (evt) {
  if(pano_enabled){
        transition();   
        setTimeout(function(){
            document.getElementById("real_sky").setAttribute('visible', true);
            document.getElementById("grid").setAttribute('visible', true);
            document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
            document.getElementById("apt_sky").setAttribute('visible', false);
            document.getElementById("spheres").setAttribute('visible', true);
        },600);
        pano_enabled = false;
  }
  else{
        transition();
        document.getElementById("spheres").setAttribute('visible', false);
        document.getElementById("spheres").setAttribute('visible', false);
        var posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
        var posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z;
        var pos = document.getElementById("player").getAttribute('position');
        pos.x = posx;
        pos.z = posz;
        document.getElementById("apt_sky").setAttribute('src', "#" + getClosestImage(posx,posz,photosHeadset));  
        document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[getClosestImage(posx,posz,photosHeadset)] + ' 0');
        setTimeout(function(){  
            document.getElementById("real_sky").setAttribute('visible', false);
            document.getElementById("grid").setAttribute('visible', false);
            document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);
            document.getElementById("apt_sky").setAttribute('visible', true);
            document.getElementById("apt_sky").setAttribute('position', pos);
        },600);
      pano_enabled = true;
  }
});


// go to closest 360 picture in front of user 
document.body.addEventListener('axismove', function (evt) {
  if(pano_enabled){
        transition();
        var posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
        var posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z;

        setTimeout(function(){        
            // set the 360 image as the one in front of user
            document.getElementById("apt_sky").setAttribute('src', "#" + getClosetImageInFront(posx,posz,photosHeadset));
            document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[getClosetImageInFront(posx,posz,photosHeadset)] + ' 0');

            // move the user to the coordinates of the closest image
            var new_xz_coords = getClosestImageInFrontCoords(posx,posz,photosHeadset);
            var pos = document.getElementById("player").getAttribute("position")
            pos.x = new_xz_coords[0];
            pos.z = new_xz_coords[1];
            player.setAttribute("position", pos);  

            // set a-camera to 0
            var posCam = document.querySelector("a-camera").getAttribute('position');
            posCam.x = 0;
            posCam.z = 0;
            document.querySelector("a-camera").setAttribute('position',posCam);

            var pos = document.getElementById("player").getAttribute('position');
            pos.x = posx;
            pos.z = posz;
            document.getElementById("apt_sky").setAttribute('position', document.querySelector("a-camera").getAttribute('position'));

        });
/*
          transition();  
        setTimeout(function(){        
                document.getElementById("spheres").setAttribute('visible', true);
                document.getElementById("grid").setAttribute('visible', true);
                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
          },600);
          pano_enabled = false;
*/
  }
});

// ----------------------------
// ----- Desktop Controls -----
// ----------------------------
document.body.onkeydown = function(e){
    if(e.keyCode == 32){
        if(pano_enabled){
            transition();
            setTimeout(function(){    
                document.getElementById("spheres").setAttribute('visible', true);
                document.getElementById("grid").setAttribute('visible', true);
                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
            },600);
            pano_enabled = false;
        }
        else{
            transition();
            document.getElementById("spheres").setAttribute('visible', false);
            var posx = document.querySelector("a-camera").getAttribute('position').x;
            var posz = document.querySelector("a-camera").getAttribute('position').z;
            document.getElementById("apt_sky").setAttribute('src', "#" + getClosestImage(posx,posz,photosHeadset));
            document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[getClosestImage(posx,posz,photosHeadset)] + ' 0');
            setTimeout(function(){   
                document.getElementById("real_sky").setAttribute('visible', false);
                document.getElementById("grid").setAttribute('visible', false);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);
                document.getElementById("apt_sky").setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('position', document.querySelector("a-camera").getAttribute('position'));
            },600);
            pano_enabled = true;
        }
    }
    else if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68){
        if(pano_enabled){
            transition();  
            setTimeout(function(){        
                document.getElementById("spheres").setAttribute('visible', true);
                document.getElementById("grid").setAttribute('visible', true);
                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
            },600);
            pano_enabled = false;
        }   
    }
}