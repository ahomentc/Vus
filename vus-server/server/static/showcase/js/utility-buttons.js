function clamp( value, min, max ) {
    return Math.max( min, Math.min( max, value ) );
}

function angleTo(from, to) {
    return 2 * Math.acos( Math.abs( clamp( from.dot( to ), - 1, 1 ) ) );
}

AFRAME.registerComponent('utility-buttons', {
    schema: {
        nextNevigation: {type:"string",default:""},
        exitNevigation: {type:"string",default:""},
        stareThreshold: {default: 1000}, //default threshold = 1s
    },
    init: function () {
        this.staringTime=0;
        this.enabled=true;
        this.showingButtons=false;
        //this.downQuaternion = new THREE.Quaternion();
        //this.downQuaternion.setFromAxisAngle( new THREE.Vector3( 1, 0, 0 ), Math.PI*3/2);
        this.savedPosition = null;
    },
    tick: function (time, timeDelta) {
        var data = this.data;
        var el = this.el;
        var currentPosition = el.object3D.position;
        var currentQuaterion = el.object3D.quaternion;
        if(this.savedPosition!=null && currentPosition.equals(this.savedPosition)){
            if(this.showingButtons || el.object3D.rotation.x<-1.2)
                this.staringTime+=timeDelta;
        }
        else{
            this.savedPosition=Object.assign({}, currentPosition);
            this.staringTime=0;
            if(this.showingButtons){
                this.showingButtons=false;
                this.enabled=true;
                //hide buttons
                var element = document.getElementById("next-button");
                element.parentNode.removeChild(element);
                element = document.getElementById("exit-button");
                element.parentNode.removeChild(element);
                element = document.getElementById("next-button-text");
                element.parentNode.removeChild(element);
                element = document.getElementById("exit-button-text");
                element.parentNode.removeChild(element);
            }

        }

        if(this.enabled && this.staringTime>data.stareThreshold){
            this.showingButtons=true;
            this.enabled=false;
            this.staringTime=0;
            let nextNevigation=this.data.nextNevigation;
            let exitNevigation=this.data.exitNevigation;
            let angle=el.object3D.rotation.y
            console.log(angle)
            //show buttons
            let scene=document.getElementById("player");
            var next=document.createElement("a-box");
            let dx1=(-0.5)*Math.cos(angle);
            let dy1=-(-0.5)*Math.sin(angle);
            next.setAttribute("position",(currentPosition.x+dx1)+" "+(currentPosition.y-1)+" "+(currentPosition.z+dy1));
            next.setAttribute("scale","0.2 0.1 0.2");
            next.setAttribute("rotation","0 "+angle*180/Math.PI+" 0");
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
            let dx2=(-0.47)*Math.cos(angle);
            let dy2=-(-0.47)*Math.sin(angle);
            nextText.setAttribute("position",(currentPosition.x+dx2)+" "+(currentPosition.y-0.89)+" "+(currentPosition.z+dy2));
            nextText.setAttribute("rotation","-90 "+angle*180/Math.PI+" 0");
            nextText.setAttribute("scale","0.38 0.38 0.38");
            nextText.setAttribute("id","next-button-text");
            if(nextNevigation!=""){
                nextText.addEventListener('mouseenter', function() {
                    window.location.href = nextNevigation;
                });
            }
            scene.appendChild(next);
            scene.appendChild(nextText);
            var exit=document.createElement("a-box");
            let dx3=(+0.5)*Math.cos(angle);
            let dy3=-(+0.5)*Math.sin(angle);
            exit.setAttribute("position",(currentPosition.x+dx3)+" "+(currentPosition.y-1)+" "+(currentPosition.z+dy3));
            exit.setAttribute("scale","0.2 0.1 0.2");
            exit.setAttribute("rotation","0 "+angle*180/Math.PI+" 0");
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
            let dx4=(+0.47)*Math.cos(angle);
            let dy4=-(+0.47)*Math.sin(angle);
            exitText.setAttribute("position",(currentPosition.x+dx4)+" "+(currentPosition.y-0.89)+" "+(currentPosition.z+dy4));
            exitText.setAttribute("rotation","-90 "+angle*180/Math.PI+" 0");
            exitText.setAttribute("scale","0.40 0.40 0.40");
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