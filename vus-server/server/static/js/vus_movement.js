var photosHeadset = {
    '1': [10, 4.11],
    '2': [2.527, -8.282],
    '3': [1.691,-8.28],
    '4': [2.564,-7.444],
    '5': [2.56,-6.607],
    '6': [2.782,-5.732],
    '7': [3.074,-3.839],
    '8': [8.325,1.756],
    '9': [8.580,-0.635],
    '10': [8.544,-2.522],
    '11': [12.238,-4.852],
    '12': [13.179,-6.843],
    '13': [12.383,-6.843],
    '14': [10.970,-6.843],
    '15': [10.897,-5.720],
    '16': [10.897,-4.089],
    '17': [11.331,-2.495],
    '18': [10.787,-1.190],
    '19': [10.787,0.983],
    '20': [10.787,2.034],
    '21': [11.186,4.028],
    '22': [12.019,5.914],
    '23': [9.161,4.138],
    '24': [9.161,5.623],
    '25': [8.835,7.324],
    '26': [10.317,7.471],
    '27': [11.258,7.390],
    '28': [14.263,-6.906],
    '29': [15.494,-8.463],
    '30': [15.494,-7.158],
    '31': [15.484,-5.273],
    '32': [15.484,-4.222],
    '33': [15.665,-2.664],
    '34': [16.425,-2.664],
    '35': [18.126,-2.664],
    '36': [16.822,-1.138],
    '37': [15.156,-1.138],
    '38': [13.795,-1.138],
    '39': [13.543,-0.420],
    '40': [13.543,0.656],
    '41': [15.549,0.836],
    '42': [20.888,2.666],
    '43': [16.731,0.799],
    '44': [19.311,0.834],
    '45': [19.526,1.910],
    '46': [20.815,1.156],
    '47': [21.890,1.085],
    '48': [1.185,-6.197],
    '49': [22.045,-2.122],
    '50': [19.348,-1.504],
    '51': [19.348,-2.577],
    '52': [20.585,-2.577],
    '53': [21.922,-2.577],
    '54': [21.337,-3.748],
    '55': [20.298,-5.538],
    '56': [18.739,-4.476],
    '57': [18.209,-6.592],
    '58': [18.209,-7.894],
    '59': [3.802,6.741],
    '60': [3.802,4.592],
    '61': [3.802,2.835],
    '62': [2.442,2.672],
    '63': [1.762,-0.266],
    '64': [0.954,-1.829],
    '65': [3.375,-1.564],
    '66': [5.656,-1.596],
    '67': [8.686,-1.790],
    '68': [8.621,-3.579],
    '69': [6.953,-7.000],
    '70': [7.234,-5.823],
    '71': [6.032,-5.498],
    '72': [5.917,-3.777],
    '73': [5.179,-3.777],
    '74': [4.326,-3.777],
    '75': [4.303,-5.690],
    '76': [4.303,-6.819],
    '77': [12.549, -2.604],
    '78': [14.547, -2.604]
}

var isMobile = false;
var isHeadset = false;
var pano_enabled = false;
var isMoving = false;

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
    return closestCoords;
}

// A = [x,z]
function distance(A,B){
    return Math.sqrt((Math.pow(A[0]-B[0],2))+(Math.pow(A[1]-B[1],2)));
}

// A = [x,z]
// the center point is B (should be user)
function get_angle(A,B,C){
    a = distance(A,C)
    b = distance(B,A)
    c = distance(B,C)
    radians = Math.acos((Math.pow(b,2) + Math.pow(c,2) - Math.pow(a,2)) / (2*b*c));
    return radians * (180 / Math.PI);     // convert to radians after
}

// get the image closest to the user that is in front
// returns an array holding the image name and the coordinates
// (no check too see if picture is behind yet... add it though)
// this only works on desktop so far. Can differentiate by adding a variable that is activated forever when headset trigger is pressed.
function getClosestImageInFront(x,z,photos){
    // while distance > val and iter < 10, get the closest image.
    iter = 0
    closestVal = 1000000;
    closestCoords = [];
    closestImage = ''
    var currentImg = document.getElementById("apt_sky").getAttribute('src');
    var angle = document.querySelector("a-camera").getAttribute("rotation") 
    var x = .3 * Math.cos((angle.y) * Math.PI / 180)
    var y = .3 * Math.sin((angle.y) * Math.PI / 180) 
    var pos = document.querySelector("a-camera").getAttribute('position');
    var new_x = pos.x - y;
    var new_z = pos.z - x; 
    for(var key in photos) {
        var x_photo = photos[key][0];
        var z_photo = photos[key][1];
        var distance = Math.sqrt((Math.pow(new_x-x_photo,2))+(Math.pow(new_z-z_photo,2)));
        // if smallest distance, the new photo isn't the same as old, and the new photo is within 30 degree angle
        // add angle to the distance to incentivize smaller angles
        angle = get_angle([new_x,new_z], [pos.x,pos.z], [x_photo,z_photo])
        if(distance + .15 * angle < closestVal && ("#" + key != currentImg) && angle<35 ){
            closestVal = distance;
            closestCoords = photos[key];
            closestImage = key;
        }
    } 

    return [closestImage, closestCoords];
}

// Adjust the players position when enter VR because aframe is weird here
document.body.addEventListener('enter-vr', function (evt) {
    isHeadset = true;
    var posx = document.getElementById("player").getAttribute('position').x;
    var posy = document.getElementById("player").getAttribute('position').y - 1.5;
    var posz = document.getElementById("player").getAttribute('position').z;
    var pos = posx.toString() + " " + posy.toString() + " " + posz.toString();
    document.getElementById("player").setAttribute('position',pos);

    // disable radius for apt_sky
    document.getElementById("apt_sky").setAttribute("radius",5000)
});

// document.body.addEventListener('exit-vr', function (evt) {
//     isHeadset = false;
//     var posx = document.getElementById("player").getAttribute('position').x;
//     var posy = document.getElementById("player").getAttribute('position').y + 1.5;
//     var posz = document.getElementById("player").getAttribute('position').z;
//     var pos = posx.toString() + " " + posy.toString() + " " + posz.toString();
//     document.getElementById("player").setAttribute('position',pos);
// });

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

// ------------------------------------------
// --------------    Beacons   --------------
// ------------------------------------------

function disableBeaconsWithRay(){
    var vrbeacons = document.querySelectorAll("a-sphere")
    count = 0
    vrbeacons.forEach(function(sphere) {
        count++;
        if (count > 1 && count<100){
            var bcn_pos_x = sphere.getAttribute("position").x
            var bcn_pos_z = sphere.getAttribute("position").z
            var distance = Math.sqrt((Math.pow(pos.x-bcn_pos_x,2))+(Math.pow(pos.z-bcn_pos_z,2)));
            var ray = document.createElement('a-entity');
            ray.setAttribute('raycaster', {
                objects: '.io3d-data3d',
                far: distance,
                // showLine: true
            });
            // ray.setAttribute('line', {color: 'orange'});
            ray.setAttribute('position', { x: pos.x, y: 1.5, z: pos.z });
            ray.setAttribute('collider-check', {beacon: sphere.getAttribute("id") + "_bcn"});

            angle = (Math.atan((bcn_pos_x-pos.x)/(bcn_pos_z-pos.z)) * 180 / Math.PI)
            if(bcn_pos_z > 0){
                angle = angle + 180;
            }
            if(pos.z > 0){
                angle = angle + 180;
            }
            ray.setAttribute('rotation', { x: 0, y: angle, z: 0 });

            var parent = document.getElementById("player")
            parent.appendChild(ray);
        }
    });
}

function disableFarBeacons(){
    var beacons = document.querySelectorAll("a-sphere");
    var posx;
    var posz;
    if(isHeadset){
        posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
        posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z;
    }
    else{
        posx = document.querySelector("a-camera").getAttribute('position').x;
        posz = document.querySelector("a-camera").getAttribute('position').z;
    }
    beacons.forEach(function(sphere) {
        var bcn_pos_x = sphere.getAttribute("position").x
        var bcn_pos_z = sphere.getAttribute("position").z
        var distance = Math.sqrt((Math.pow(posx-bcn_pos_x,2))+(Math.pow(posz-bcn_pos_z,2)));
        if (distance > 4){
            sphere.setAttribute("visible",false);
        }
    })
}

function enableAllBeacons(){
    var beacons = document.querySelectorAll("a-sphere")
    beacons.forEach(function(sphere) {
        sphere.setAttribute("visible",true);
    })
}

AFRAME.registerComponent('bcn_teleport', {
    init: function () {
        this.el.addEventListener('click', function (evt) {
            transition();
            enableAllBeacons()
            setTimeout(function(){
                // teleport user to sphere on click [Check if VR device and make it work for that too]
                if(isHeadset){
                    var pos = document.getElementById("player").getAttribute('position');

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
                    // var pos_cam = document.querySelector("a-camera").getAttribute('position');
                    // pos_cam.x = 0;
                    // pos_cam.z = 0;
                    // document.querySelector("a-camera").setAttribute('position', pos_cam);

                    pos.x = evt.detail.intersection.point.x
                    pos.z = evt.detail.intersection.point.z
                    var closestImage = getClosestImage(pos.x,pos.z,photosHeadset)

                    document.getElementById("player").setAttribute('position',pos);

                    // if the image we're teleporting to hasn't loaded yet, teleport user but switch to vr mode
                    if(!document.getElementById(closestImage).complete){
                        enableAllBeacons();
                        document.getElementById("real_sky").setAttribute('visible', true);
                        document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                        document.getElementById("apt_sky").setAttribute('visible', false);
                        pano_enabled = false;
                    }
                    else{
                        document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);
                        document.getElementById("apt_sky").setAttribute('position', pos);
                    }
                }
                else{
                    var pos = document.querySelector("a-camera").getAttribute('position');
                    pos.x = evt.detail.intersection.point.x
                    pos.z = evt.detail.intersection.point.z
                    var closestImage = getClosestImage(pos.x,pos.z,photosHeadset)
                    document.querySelector("a-camera").setAttribute('position',pos)

                    // if the image we're teleporting to hasn't loaded yet, teleport user but switch to vr mode
                    if(!document.getElementById(closestImage).complete){
                        enableAllBeacons();
                        document.getElementById("real_sky").setAttribute('visible', true);
                        document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                        document.getElementById("apt_sky").setAttribute('visible', false);
                        pano_enabled = false;
                    }
                    else{
                        document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);
                        document.getElementById("apt_sky").setAttribute('position', pos);
                    }
                }
                if(pano_enabled){
                    disableFarBeacons();
                }
            },600)
        });
        this.el.addEventListener('mouseenter', function(evt){
            this.setAttribute("radius", .2)
            this.setAttribute('material', 'opacity: 1')
        })
        this.el.addEventListener('mouseleave', function(evt){
            this.setAttribute("radius", .15)
            this.setAttribute('material', 'opacity: .6')
        })
    }
});

// fixes the angle of the controller
AFRAME.components['laser-controls'].Component.prototype.config['oculus-touch-controls'].raycaster.direction.y = 0;
    document.addEventListener("DOMContentLoaded", function () {
      document.querySelector("a-scene")
        .addEventListener("loaded", function fixModelPoses() {
          Array.from(document.querySelectorAll('[oculus-touch-controls]'))
            .filter(el => el.components['oculus-touch-controls'].controllerPresent)
            .forEach(el => {
              el.addEventListener('model-loaded', () => {
                // FIX TWO: align model with raycaster (and reality)
                var mesh = el.getObject3D('mesh');
                mesh.rotateX(Math.PI / 4);
                mesh.translateY(0.06);
              });
            });
      });
});

AFRAME.registerComponent('beacons', {
    init: function () {
        for(var i=1; i<79; i++){
            var sphere = document.createElement('a-sphere');
            var posx = photosHeadset[i.toString()][0];
            var posz= photosHeadset[i.toString()][1];
            sphere.setAttribute('id', i.toString() + "_bcn");
            sphere.setAttribute('position', posx + ' 1.5 ' + posz);
            sphere.setAttribute('material', 'color: red; transparent: true; opacity: 0.4');
            sphere.setAttribute('radius', '.15');
            sphere.setAttribute('bcn_teleport','');
            // sphere.setAttribute('class', 'io3d-data3d') // temporary for simplicity

            var parent = document.getElementById("vrbeacons")
            parent.appendChild(sphere);
            // alert(posx.toString() + " " + posz.toString())
        }
    }
});


//------------

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
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
                document.getElementById("apt_sky").setAttribute('src', "#black"); 

                // enable marker closest to user
                document.getElementById(closestImage + "_bcn").setAttribute('visible', true);

                var pos = document.getElementById("player").getAttribute('position');
                pos.x = posx;
                pos.z = posz;
                document.getElementById("apt_sky").setAttribute('position', pos);

                enableAllBeacons()

                pano_enabled = false;
            }
            else if (distance <= .4 && !pano_enabled){
                enableAllBeacons()

                // don't enter the image if it's not loaded yet
                if(!document.getElementById(closestImage).complete){
                    return;
                }

                // enter pano mode
                document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);
                // document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[closestImage] + ' 0');
                document.getElementById("apt_sky").setAttribute('rotation', '0 90 0');
                // disable the marker closest to user
                document.getElementById(closestImage + "_bcn").setAttribute('visible', false);

                document.getElementById("real_sky").setAttribute('visible', false);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);

                document.getElementById("apt_sky").setAttribute('visible', true);

                // move the 360 sphere to the user location
                var pos = document.getElementById("player").getAttribute('position');
                pos.x = posx;
                pos.z = posz;
                document.getElementById("apt_sky").setAttribute('position', pos);

                disableFarBeacons();
                pano_enabled = true;
            }
        }
    }
})


// ----------------------------
// ----- Headset Controls -----
// ----------------------------
// was triggerdown
document.body.addEventListener('abuttondown', function (evt) {
      isHeadset = true;
      if(pano_enabled){
            transition();   
            setTimeout(function(){
                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
                enableAllBeacons()
                // document.getElementById("vrbeacons").setAttribute('visible', true);
            },600);
            pano_enabled = false;
      }
      else{
        var posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
        var posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z;
        var closestImage = getClosestImage(posx,posz,photosHeadset)

        // don't enter the image if it's not loaded yet 
        if(!document.getElementById(closestImage).complete){
            return;
        }


        disableFarBeacons();

        transition();
        var pos = document.getElementById("player").getAttribute('position');
        pos.x = posx;
        pos.z = posz;
        document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);  
        document.getElementById("apt_sky").setAttribute('rotation', '0 90 0');

        setTimeout(function(){
            
            document.getElementById("real_sky").setAttribute('visible', false);
            document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);
            document.getElementById("apt_sky").setAttribute('visible', true);
            document.getElementById("apt_sky").setAttribute('position', pos);

            
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            // var pos_cam = document.querySelector("a-camera").getAttribute('position');
            // pos_cam.x = 0;
            // pos_cam.z = 0;
            // document.querySelector("a-camera").setAttribute('position', pos_cam);

            // move the user to the pano location
            coords_pics = getClosestImageCoords(posx,posz,photosHeadset);
            pos.x = coords_pics[0]
            pos.z = coords_pics[1]
            document.querySelector("player").setAttribute('position',pos);

        },600);
        pano_enabled = true;
    }
});


// go to closest 360 picture in front of user 
document.body.addEventListener('axismove', function (evt) {
  if(pano_enabled){
        // transition();

        // var posx = document.getElementById("player").getAttribute('position').x + document.querySelector("a-camera").getAttribute('position').x;
        // var posz = document.getElementById("player").getAttribute('position').z + document.querySelector("a-camera").getAttribute('position').z;

        // setTimeout(function(){        
        //     // set the 360 image as the one in front of user
        //     document.getElementById("apt_sky").setAttribute('src', "#" + getClosetImageInFront(posx,posz,photosHeadset));
        //     // document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[getClosetImageInFront(posx,posz,photosHeadset)] + ' 0');
        //     document.getElementById("apt_sky").setAttribute('rotation', '0 90 0');

        //     // move the user to the coordinates of the closest image
            // var new_xz_coords = getClosestImageInFrontCoords(posx,posz,photosHeadset);
            // var pos = document.getElementById("player").getAttribute("position")
            // pos.x = new_xz_coords[0];
            // pos.z = new_xz_coords[1];
            // player.setAttribute("position", pos);  

        //     // set a-camera to 0
        //     var posCam = document.querySelector("a-camera").getAttribute('position');
        //     posCam.x = 0;
        //     posCam.z = 0;
        //     document.querySelector("a-camera").setAttribute('position',posCam);

        //     var pos = document.getElementById("player").getAttribute('position');
        //     pos.x = posx;
        //     pos.z = posz;
        //     document.getElementById("apt_sky").setAttribute('position', document.querySelector("a-camera").getAttribute('position'));

        // },600);

        // ----------
        // exit 360 mode and enter vr mode
        transition();  
        setTimeout(function(){        
            // document.getElementById("vrbeacons").setAttribute('visible', true);
            document.getElementById("real_sky").setAttribute('visible', true);
            document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
            document.getElementById("apt_sky").setAttribute('visible', false);
            enableAllBeacons();
        },600);
        pano_enabled = false;

  }
});

// ----------------------------
// ----- Desktop Controls -----
// ----------------------------

document.body.onkeydown = function(e){
    if(e.keyCode == 32){
        // enable VR mode
        if(pano_enabled){
            transition();
            setTimeout(function(){    
                // enable the vrbeacons
                // var vrbeacons = document.querySelectorAll("a-sphere")
                // vrbeacons.forEach(function(sphere) {
                //     sphere.setAttribute('visible',true);
                // });

                document.getElementById("real_sky").setAttribute('visible', true);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('visible', false);
                enableAllBeacons();
                // document.getElementById("vrbeacons").setAttribute('visible', true);
                // document.getElementById("photobeacons").setAttribute('visible', false);
            },600);
            pano_enabled = false;
        }
        // enable 360 picture mode
        else{
            var posx = document.querySelector("a-camera").getAttribute('position').x;
            var posz = document.querySelector("a-camera").getAttribute('position').z;
            var closestImage = getClosestImage(posx,posz,photosHeadset)

            // don't enter the image if it's not loaded yet
            if(!document.getElementById(closestImage).complete){
                return;
            }

            transition();
            document.getElementById("apt_sky").setAttribute('src', "#" + closestImage);
            document.getElementById("apt_sky").setAttribute('rotation', '0 90 0');

            // we have a timeout for the transition
            setTimeout(function(){   
                document.getElementById("real_sky").setAttribute('visible', false);
                document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', false);
                document.getElementById("apt_sky").setAttribute('visible', true);
                document.getElementById("apt_sky").setAttribute('position', document.querySelector("a-camera").getAttribute('position'));
                // document.getElementById("vrbeacons").setAttribute('visible', false);
                // document.getElementById("photobeacons").setAttribute('visible', true);

                // alert(document.getElementById("1").getAttribute("radius"))

                // move the user to the pano location
                var pos = document.querySelector("a-camera").getAttribute("position");
                coords_pics = getClosestImageCoords(posx,posz,photosHeadset);
                pos.x = coords_pics[0]
                pos.z = coords_pics[1]
                document.querySelector("a-camera").setAttribute('position',pos);

                // disableBeaconsWithRay();
                disableFarBeacons();


            },600);
            pano_enabled = true;
        }
    }
    // on movement
    else if(e.keyCode == 37 || e.keyCode == 38 || e.keyCode == 39 || e.keyCode == 40 || e.keyCode == 87 || e.keyCode == 65 || e.keyCode == 83 || e.keyCode == 68){
        var posx = document.querySelector("a-camera").getAttribute('position').x;
        var posz = document.querySelector("a-camera").getAttribute('position').z;
        if(pano_enabled && !isMoving){
            isMoving = true;
            transition();  
            // pause the effect of all further key presses after the first one, excpet for movement

            enableAllBeacons()
            
            setTimeout(function(){        
                closestImageInFront = getClosestImageInFront(posx,posz,photosHeadset);
                var new_xz_coords = closestImageInFront[1];

                setTimeout(function(){   
                    isMoving = false;
                },400);

                // if distance is above a certain amount, switch to VR mode instead.
                if( Math.sqrt((Math.pow(posx-new_xz_coords[0],2))+(Math.pow(posz-new_xz_coords[1],2))) > 8 || closestImageInFront[0] == ''){        
                    document.getElementById("real_sky").setAttribute('visible', true);
                    document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
                    document.getElementById("apt_sky").setAttribute('visible', false);
                    // document.getElementById("vrbeacons").setAttribute('visible', true);
                    // document.getElementById("photobeacons").setAttribute('visible', false);
                    enableAllBeacons();
                    pano_enabled = false;
                }
                else{
                    // set the 360 image as the one in front of user
                    document.getElementById("apt_sky").setAttribute('src', "#" + closestImageInFront[0]);
                    // document.getElementById("apt_sky").setAttribute('rotation', '0 ' + rotations[closestImageInFront[0]] + ' 0');


                    // move the user to the coordinates of the closest image
                    var pos = document.querySelector("a-camera").getAttribute("position");
                    pos.x = new_xz_coords[0];
                    pos.z = new_xz_coords[1];
                    document.querySelector("a-camera").setAttribute('position',pos);

                    // move the 360 sphere to the user location
                    document.getElementById("apt_sky").setAttribute('position', pos);
                }

                disableFarBeacons();

            },600);

            // setTimeout(function(){        
            //     document.getElementById("vrbeacons").setAttribute('visible', true);
            //     document.getElementById("real_sky").setAttribute('visible', true);
            //     document.getElementsByClassName("io3d-scene")[0].setAttribute('visible', true);
            //     document.getElementById("apt_sky").setAttribute('visible', false);
            // },600);
            // pano_enabled = false;
        }   
    }
}



