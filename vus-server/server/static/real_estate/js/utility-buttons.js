AFRAME.registerComponent('utility-buttons', {
    schema: {
        nextNevigation: {type:"string",default:""},
        exitNevigation: {type:"string",default:""},
        stareThreshold: {default: 3000}, //default threshold = 3s
    },
    init: function () {
        this.staringTime=0;
        this.enabled=true;
        this.showingButtons=false;
        this.downQuaternion = new THREE.Quaternion();
        this.downQuaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI*3/2);
        this.savedPosition = null;
    },
    tick: function (time, timeDelta) {
        var data = this.data;
        var el = this.el;
        var currentPosition = el.object3D.position;
        var currentQuaterion = el.object3D.quaternion;
        if(this.savedPosition!=null && currentPosition.equals(this.savedPosition)){
            if(this.showingButtons || Math.abs(this.downQuaternion.angleTo(currentQuaterion))<(30/180*3.14))
                this.staringTime+=timeDelta;
        }
        else{
            this.savedPosition=Object.assign({}, currentPosition);
            this.staringTime=0;
            if(this.showingButtons){
                this.showingButtons=false;
                this.enabled=true;
                //hide buttons
                document.getElementById("next-button").remove();
                document.getElementById("exit-button").remove();
                document.getElementById("next-button-text").remove();
                document.getElementById("exit-button-text").remove();
            }

        }

        if(this.enabled && this.staringTime>data.stareThreshold){
            this.showingButtons=true;
            this.enabled=false;
            this.staringTime=0;
            let nextNevigation=this.data.nextNevigation;
            let exitNevigation=this.data.exitNevigation;
            //show buttons
            let scene=document.getElementsByTagName("a-scene")[0];
            var next=document.createElement("a-box");
            next.setAttribute("position",(currentPosition.x-0.5)+" "+(currentPosition.y-1)+" "+currentPosition.z);
            next.setAttribute("scale","0.2 0.1 0.2");
            next.setAttribute("id","next-button");
            next.setAttribute("material","opacity:.6; emissive:#040404;side:double;color:#0000FF");
            if(nextNevigation!=""){
                next.addEventListener('click', function() {
                    window.location.href = nextNevigation;
                });
            }
            var nextText=document.createElement("a-text");
            nextText.setAttribute("value","Next");
            nextText.setAttribute("align","center");
            nextText.setAttribute("position",(currentPosition.x-0.47)+" "+(currentPosition.y-0.89)+" "+currentPosition.z);
            nextText.setAttribute("rotation","-90 0 0");
            nextText.setAttribute("scale","0.45 0.45 0.45");
            nextText.setAttribute("id","next-button-text");
            if(nextNevigation!=""){
                nextText.addEventListener('mouseenter', function() {
                    window.location.href = nextNevigation;
                });
            }
            scene.appendChild(next);
            scene.appendChild(nextText);
            var exit=document.createElement("a-box");
            exit.setAttribute("position",(currentPosition.x+0.5)+" "+(currentPosition.y-1)+" "+currentPosition.z);
            exit.setAttribute("scale","0.2 0.1 0.2");
            exit.setAttribute("id","exit-button");
            exit.setAttribute("material","opacity:.6; emissive:#040404;side:double;color:#FF0000");
            if(exitNevigation!=""){
                exit.addEventListener('click', function() {
                    window.location.href = exitNevigation;
                });
            }
            var exitText=document.createElement("a-text");
            exitText.setAttribute("value","Exit");
            exitText.setAttribute("align","center");
            exitText.setAttribute("position",(currentPosition.x+0.47)+" "+(currentPosition.y-0.89)+" "+currentPosition.z);
            exitText.setAttribute("rotation","-90 0 0");
            exitText.setAttribute("scale","0.45 0.45 0.45");
            exitText.setAttribute("id","exit-button-text");

            if(exitNevigation!=""){
                exitText.addEventListener('mouseenter', function() {
                    window.location.href = exitNevigation;
                });
            }
            scene.appendChild(exit);
            scene.appendChild(exitText);
        }
    }
});