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

var time_pressed = 0;
AFRAME.registerComponent('menu_select', {
    schema: {
        scene_num: {type: 'number', default: 1},
        time_pressed: {type: 'number', default: 0}
    },
    init: function () {
        // add another to schema called name. Change the text to name in init.
        var scene_num = this.data.scene_num;
        this.laserEnabled = false;
        this.el.addEventListener('click', function (evt) {
            transition();

            for(var i=scene_num; i<=scene_num+2; i++){
                // check to see if picture in assets
                if(!document.body.contains(document.getElementById(i.toString() + "L"))){
                    var image360L = document.createElement('img');
                    image360L.setAttribute('id', i.toString() + "L");
                    image360L.setAttribute('crossorigin', 'anonymous')
                    image360L.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/left/' + i.toString() + ".jpg");
                    image360L.setAttribute('crossorigin', 'anonymous')

                    var image360R = document.createElement('img');
                    image360R.setAttribute('id', i.toString() + "R");
                    image360R.setAttribute('crossorigin', 'anonymous')
                    image360R.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/right/' + i.toString() + ".jpg");
                    image360R.setAttribute('crossorigin', 'anonymous')

                    var parent = document.querySelector("a-assets")
                    parent.appendChild(image360L);
                    parent.appendChild(image360R);
                }
            }

            setTimeout(function(){
                // disable clicks within 1500 ms of each other. Cursor and mouse interfere and click twice.
                // can also use ticks for this, and then it might be easier
                var currentTime = Date.now();
                if(currentTime - time_pressed < 1500){
                    return;
                }
                time_pressed = currentTime;
                

                currentPic = scene_num
                document.getElementById("left_pic").setAttribute("src", "#" + currentPic.toString() + "L")
                document.getElementById("right_pic").setAttribute("src", "#" + currentPic.toString() + "R")

                var rot = document.getElementById("scene_rotator").getAttribute("rotation")
                rot.y += 180;
                document.getElementById("scene_rotator").setAttribute('rotation', rot)
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
            // this.lastMaterial = this.getAttribute("material")
            this.setAttribute("material", "color", "#333")        
        })
        this.el.addEventListener('mouseleave', function(evt){
            this.setAttribute("material", "color", "#000")  
            // this.setAttribute("material", this.lastMaterial) 
        })
    }
});

AFRAME.registerComponent('menu', {
    init: function () {
        var labelsJSON = JSON.parse(labels.replace(/&quot;/g,'"'))
        var label_count = 0;
        for (var key in labelsJSON) {
            if (labelsJSON.hasOwnProperty(key)) {
                // alert(key + " -> " + labelsJSON[key]);
                // add a new aframe tile.
                var tile_text = document.createElement('a-entity');
                var tile_outer = document.createElement('a-plane');
                var tile_inner = document.createElement('a-plane');
                
                tile_text.setAttribute("rotation", "0 180 0");
                tile_text.setAttribute("scale", "10 10 10");
                tile_text.setAttribute("text__menu1", "color", "#ffffff");
                tile_text.setAttribute("text__menu1", "anchor", "left");
                tile_text.setAttribute("text__menu1", "value", labelsJSON[key]);
                tile_outer.setAttribute("menu_select", "scene_num", key)
                
                tile_outer.setAttribute("rotation", "0 180 0");
                tile_outer.setAttribute("id", labelsJSON[key] + "_outer");
                tile_outer.setAttribute("menu_select", "scene_num", key)
                tile_outer.setAttribute("width", "2")
                tile_outer.setAttribute("height", "1")
                tile_outer.setAttribute("material", "color", "#000")
                
                tile_inner.setAttribute('scale', '.95 .9 .9');
                tile_inner.setAttribute("rotation", "0 180 0");
                tile_inner.setAttribute("id", labelsJSON[key] + "_inner");
                tile_inner.setAttribute("menu_select", "scene_num", key)
                tile_inner.setAttribute("width", "2.5")
                tile_inner.setAttribute("height", "1")
                tile_inner.setAttribute("material", "color", "#000")

                y_col = Math.floor(label_count/3) * 1.5
                if(label_count % 3 == 0){ // col 1
                    tile_text.setAttribute('position', '3.5 ' + y_col.toString() + ' 5.132');
                    tile_outer.setAttribute('position', '2.5 ' + y_col.toString() + ' 5.2');
                    tile_inner.setAttribute('position', '2.5 ' + y_col.toString() + ' 5.19');
                }
                else if(label_count % 3 == 1){ // col 2
                    tile_text.setAttribute('position', '.7 ' + y_col.toString() + ' 5.132');
                    tile_outer.setAttribute('position', '0 ' + y_col.toString() + ' 5.2');
                    tile_inner.setAttribute('position', '0 ' + y_col.toString() + ' 5.19');
                }
                else if(label_count % 3 == 2){ // col 2
                    tile_text.setAttribute('position', '-1.7 ' + y_col.toString() + ' 5.132');
                    tile_outer.setAttribute('position', '-2.7 ' + y_col.toString() + ' 5.2');
                    tile_inner.setAttribute('position', '-2.7 ' + y_col.toString() + ' 5.19');
                }
                var parent = document.querySelector("a-scene")
                parent.appendChild(tile_text);
                // parent.appendChild(tile_outer);
                parent.appendChild(tile_inner);
                label_count+=1;
            }
        }
    },
    tick: function(){
        headRot = document.querySelector("a-camera").getAttribute("rotation").y + document.getElementById("scene_rotator").getAttribute("rotation").y;
        if(headRot < 0){
            headRot = 360 + headRot
        }
        else if(headRot > 360){
            headRot = headRot - 360;
        }
        if(headRot > 90 && headRot < 270){
            this.laserEnabled = true;
            document.querySelector("a-cursor").setAttribute("visible", true);
            document.getElementById("right_hand").setAttribute("line", "opacity", 1)
        }
        else{
            this.laserEnabled = false;
            document.querySelector("a-cursor").setAttribute("visible", false);
            document.getElementById("right_hand").setAttribute("line", "opacity", 0)
        }
    }
});

AFRAME.registerComponent("load_tour", {
  schema:{
    num_images: {type: 'number', default: 1},
    images_width: {type: 'number', default: 0},
    images_height: {type: 'number', default: 0}
  },
  init: function() {
    // var num_images = this.data.num_images;

    // loading only the first 3 sets of images first
    var num_images = 3;
    for(var i=1; i<=num_images; i++){
        var image360L = document.createElement('img');
        image360L.setAttribute('id', i.toString() + "L");
        image360L.setAttribute('crossorigin', 'anonymous')
        image360L.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/left/' + i.toString() + ".jpg");
        image360L.setAttribute('crossorigin', 'anonymous')

        var image360R = document.createElement('img');
        image360R.setAttribute('id', i.toString() + "R");
        image360R.setAttribute('crossorigin', 'anonymous')
        image360R.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/right/' + i.toString() + ".jpg");
        image360R.setAttribute('crossorigin', 'anonymous')

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
      // triggerIsDown = true;
    });

    document.getElementById("right_hand").addEventListener('triggerup', function(){
        prev()
        // triggerIsDown = false;
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
    // if(rotations[currentPic+1]){
    //     rotateAnim(rotations[currentPic+1])
    // }
    // else{
    //     moveForwardsAnim();
    // }
    // var num_images = document.querySelector("a-scene").getAttribute("load_pictures").num_images;

    // if(currentPic < num_images && document.getElementById(currentPic.toString() + "L").complete && document.getElementById(currentPic.toString() + "R").complete){
    if(currentPic < num_images){
      currentPic += 1

      for(var i=currentPic; i<=currentPic+3; i++){
          // check to see if picture in assets
          if(!document.body.contains(document.getElementById(i.toString() + "L"))){
              var image360L = document.createElement('img');
              image360L.setAttribute('id', i.toString() + "L");
              image360L.setAttribute('crossorigin', 'anonymous')
              image360L.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/left/' + i.toString() + ".jpg");
              image360L.setAttribute('crossorigin', 'anonymous')

              var image360R = document.createElement('img');
              image360R.setAttribute('id', i.toString() + "R");
              image360R.setAttribute('crossorigin', 'anonymous')
              image360R.setAttribute('src', 'https://d3ga0cb3khynzt.cloudfront.net/' + username + '/' + env_name + '/right/' + i.toString() + ".jpg");
              image360R.setAttribute('crossorigin', 'anonymous')

              var parent = document.querySelector("a-assets")
              parent.appendChild(image360L);
              parent.appendChild(image360R);
          }
      }


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








