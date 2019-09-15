alert("hi")

var isMobile = false;
var isHeadset = false;
var currentPic = 1;
var num_images = 1
var triggerIsDown = false;
 

// Need to somehow pass in: username, room_name, number of pictures
// https://vusbucket.s3-us-west-1.amazonaws.com/andrei/inverrary/left/64.jpg
// https://vusbucket.s3-us-west-1.amazonaws.com/" + username + "/" + env_name + "/left/64.jpg
      
var scrolling = true

AFRAME.registerComponent("move_mobile", {
  init: function() {
    const sceneEl = this.el.sceneEl;
    const canvasEl = sceneEl.canvas;

    canvasEl.addEventListener('touchstart', function(){
        isMobile = true;
        isHeadset = false;

        // 500 ms of continous
        var time = 0;
        var interval = setInterval(function(){
            time += 1
            if(time > 30){
                next();
                clearInterval(interval);
            }
            if(scrolling){
                time = 0;
            }
        },1)

    });

    // for mobile, disable movement while inside sphere unless touch is held in place
    // this is so that the user doesn't move when their scrolling around the 360 photo
    canvasEl.addEventListener('touchmove', function(){
        scrolling = true;
    });
    canvasEl.addEventListener('touchend', function(){
        scrolling = false;
        triggerIsDown = false;
    });
  },
})


      

//  !!!! ------------------ FIX THIS ------------------ !!!!

      // also need to fix that the camera isn't resetting the rotation to 0 0 0 when the interval called.
      // pos works though

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

AFRAME.registerComponent('menu_select', {
    schema: {
        scene_num: {type: 'number', default: 1},
    },
    init: function () {
        // add another to schema called name. Change the text to name in init.
        var scene_num = this.data.scene_num;
        this.laserEnabled = false;
        this.el.addEventListener('click', function (evt) {
            transition();
            setTimeout(function(){
                currentPic = scene_num
                document.getElementById("left_pic").setAttribute("src", "#" + currentPic.toString() + "L")
                document.getElementById("right_pic").setAttribute("src", "#" + currentPic.toString() + "R")

                var rot = document.querySelector("a-camera").getAttribute("rotation")
                rot.y = 0
                document.querySelector("a-camera").setAttribute('rotation', rot)
            },600)
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
        });
        this.el.addEventListener('mouseenter', function(evt){
            this.lastMaterial = this.getAttribute("material")
            this.setAttribute("material", "color", "#333")        
        })
        this.el.addEventListener('mouseleave', function(evt){
            this.setAttribute("material", this.lastMaterial) 
        })
    },
    tick: function(){
        headRot = document.querySelector("a-camera").getAttribute("rotation").y
        if(headRot < 0){
            headRot = 360 + headRot
        }
        if(headRot > 90 && headRot < 270){
            this.laserEnabled = true;
            document.getElementById("right_hand").setAttribute("line", "opacity", 1)
        }
        else{
            this.laserEnabled = false;
            document.getElementById("right_hand").setAttribute("line", "opacity", 0)
        }
    }
});


AFRAME.registerComponent("load_tour", {
  schema:{
    num_images: {type: 'number', default: 1},
  },
  init: function() {
    var num_images = this.data.num_images;
    for(var i=1; i<=num_images; i++){
        var image360L = document.createElement('img');
        image360L.setAttribute('id', i.toString() + "L");
        image360L.setAttribute('src', 'https://vusbucket.s3-us-west-1.amazonaws.com/{{username}}/env_name/left/' + i.toString() + ".jpg");

        var image360R = document.createElement('img');
        image360R.setAttribute('id', i.toString() + "R");
        image360L.setAttribute('src', 'https://vusbucket.s3-us-west-1.amazonaws.com/{{username}}/{{env_name}}/right/' + i.toString() + ".jpg");

        var parent = document.querySelector("a-assets")
        parent.appendChild(image360L);
        parent.appendChild(image360R);
    }



    document.body.onkeydown = function(e){
        if(e.keyCode == 32){
            if(! triggerIsDown){
                triggerIsDown = true;
                next();
            }
        }
    }

    document.body.onkeyup = function(e){
        if(e.keyCode == 32){
            if(triggerIsDown){
                triggerIsDown = false;
            }
        }
    }


    document.getElementById("right_hand").addEventListener('triggerdown', function(){
      next()
      triggerIsDown = true;
    });

    document.getElementById("right_hand").addEventListener('triggerup', function(){
        prev()
        triggerIsDown = false;
    });

    // move backwards
    document.getElementById("left_hand").addEventListener('triggerdown', function(){
        prev()
        // triggerIsDown = false;
    });

    setInterval(function(){
        if(triggerIsDown){
          next();
        }
    },1500)

    document.body.addEventListener('enter-vr', function (evt) {
        isHeadset = true;
    });

  },
})

function rotateAnim(direction){
    // Check to see which way camera is facing. If facing towards the point we're rotating to, then just return immedielty.
    var y_angle = document.querySelector("a-camera").getAttribute("rotation").y;
    if(y_angle<0){y_angle = 360 - y_angle} // fix angle rotation to not be negative
    if((direction == "left" && y_angle < 95 && y_angle > 20) || (direction == "right" && y_angle > 265 && y_angle < 340)){
      return;
    }
    else{
      var enabled = true;
      var left_pic = document.getElementById('left_pic');
      var right_pic = document.getElementById('right_pic');

      var speed = .02;
      if(!isHeadset){
          speed = .2;
      }

      setInterval(function(){
          if(!enabled){return};

          var rot_left = left_pic.getAttribute("rotation");
          var rot_right = right_pic.getAttribute("rotation");
          if(direction == "left"){
              rot_left.y -= speed;
              rot_right.y -= speed;
          }
          else if(direction == "right"){
              rot_left.y += speed;
              rot_right.y += speed;
          }
          left_pic.setAttribute("rotation", rot_left)
          right_pic.setAttribute("rotation", rot_right)
      },5);
      setTimeout(function(){
        enabled = false;
        // return radius to large number
        document.getElementById('left_pic').setAttribute("rotation","0 180 0")
        document.getElementById('right_pic').setAttribute("rotation","0 0 0")
      },500)
    }

}

function moveForwardsAnim(){
  var enabled = true;
  // give the pano a radius so we an see the movement
  document.getElementById('left_pic').setAttribute("radius",50);
  document.getElementById('right_pic').setAttribute("radius",50);
  var camera = document.querySelector('a-camera')
  camera.setAttribute("position","0 0 0")

  var speed = .01;
  if(!isHeadset){
      speed = .07;
  }

  setInterval(function(){
      if(!enabled){return;}

      // move camera forwards by a bit
      var angle = camera.getAttribute("rotation")
      var x = speed * Math.cos((angle.y) * Math.PI / 180)
      var y = speed * Math.sin((angle.y) * Math.PI / 180)
      var pos = camera.getAttribute("position")
      pos.x -= y;
      pos.z -= x;
      camera.setAttribute("position", pos);

  },10)

  setTimeout(function(){
    enabled = false;
    // return radius to large number
    document.getElementById('left_pic').setAttribute("radius",2000);
    document.getElementById('right_pic').setAttribute("radius",2000);
    document.querySelector("a-camera").setAttribute("position","0 0 0")
  },500)

}

function next(){
    transition();
    if(rotations[currentPic+1]){
        rotateAnim(rotations[currentPic+1])
    }
    else{
        moveForwardsAnim();
    }
    var num_images = document.querySelector("a-scene").getAttribute("load_pictures").num_images;
    if(currentPic < num_images && document.getElementById(currentPic.toString() + "L").complete && document.getElementById(currentPic.toString() + "R").complete){
      currentPic += 1
      setTimeout(function(){
          document.getElementById("left_pic").setAttribute("src", "#" + currentPic.toString() + "L")
          document.getElementById("right_pic").setAttribute("src", "#" + currentPic.toString() + "R")
          var rot = document.querySelector("a-camera").getAttribute("rotation")
          rot.y = 0
          document.querySelector("a-camera").setAttribute('rotation', rot)
      },600)
    }

    // start from beginning to cycle through
    else if(currentPic == num_images){
        currentPic = 1;
        setTimeout(function(){
          document.getElementById("left_pic").setAttribute("src", "#" + currentPic.toString() + "L")
          document.getElementById("right_pic").setAttribute("src", "#" + currentPic.toString() + "R")
        },600)
    }
}

function prev(){
    transition();
    if(currentPic > 0 && document.getElementById(currentPic.toString() + "L").complete && document.getElementById(currentPic.toString() + "R").complete){
      currentPic -= 1
      setTimeout(function(){
          document.getElementById("left_pic").setAttribute("src", "#" + currentPic.toString() + "L")
          document.getElementById("right_pic").setAttribute("src", "#" + currentPic.toString() + "R")
      },600)
    }
}








