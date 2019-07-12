AFRAME.registerComponent('utility-buttons', {
    schema: {
        stareThreshold: {default: 3000}, //default threshold = 3s
        keepThreshold: {default: 5000} //default threshold = 5s
    },
    init: function () {
        this.staringTime=0;
        this.enabled=true;
        this.showingButtons=false;
        this.upQuaternion = new THREE.Quaternion();
        this.upQuaternion.setFromAxisAngle( new THREE.Vector3( 0, 1, 0 ), Math.PI / 2 );
    },
    tick: function (time, timeDelta) {
        var data = this.data;
        var el = this.el;
        var currentPosition = el.object3D.position;
        var currentQuaterion = el.object3D.quaternion;
        if(abs(this.upQuaternion.angleTo(currentQuaterion))<(45/180*3.14)){
            this.staringTime+=timeDelta;
        }
        else{
            this.staringTime=0;
            if(this.showingButtons){
                this.showingButtons=false;
                this.enabled=true;
                //hide buttons
                el.removeObject3D(this.mesh1);
            }

        }

        if(this.enabled && this.staringTime>data.stareThreshold){
            this.showingButtons=true;
            this.enabled=false;
            this.staringTime=0;
            //show buttons
            // Create geometry.
            var geometry1 = new THREE.BoxBufferGeometry(1, 1, 1);
            // Create material.
            var material1 = new THREE.MeshStandardMaterial({color: '#AAA'});
            // Create mesh.
            this.mesh1 = new THREE.Mesh(geometry1, material1);
            // Set mesh on entity.
            el.setObject3D('button1', this.mesh);
        }

        if(this.showingButtons && this.staringTime>data.keepThreshold){
            //hide buttons
            this.showingButtons=false;
            el.removeObject3D(this.mesh1);
        }
    }
});