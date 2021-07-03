var game;
var ennemiesInUse = [];
var deltaTime = 0;
function resetGame(){
    game = {speed:0,
            initSpeed:.00035,
            baseSpeed:.00035,
            targetBaseSpeed:.00035,
            incrementSpeedByTime:.0000025,
            incrementSpeedByLevel:.000005,
            distanceForSpeedUpdate:100,
            speedLastUpdate:0,
  
            distance:0,
            ratioSpeedDistance:50,
            energy:100,
            ratioSpeedEnergy:3,
  
            level:1,
            levelLastUpdate:0,
            distanceForLevelUpdate:1000,
  
            planeDefaultHeight:100,
            planeAmpHeight:80,
            planeAmpWidth:75,
            planeMoveSensivity:0.005,
            planeRotXSensivity:0.0008,
            planeRotZSensivity:0.0004,
            planeFallSpeed:.001,
            planeMinSpeed:1.2,
            planeMaxSpeed:1.6,
            planeSpeed:0,
            planeCollisionDisplacementX:0,
            planeCollisionSpeedX:0,
  
            planeCollisionDisplacementY:0,
            planeCollisionSpeedY:0,
  
            seaRadius:600,
            seaLength:800,
            //seaRotationSpeed:0.006,
            wavesMinAmp : 5,
            wavesMaxAmp : 20,
            wavesMinSpeed : 0.001,
            wavesMaxSpeed : 0.003,
  
            cameraFarPos:500,
            cameraNearPos:150,
            cameraSensivity:0.002,
  
            coinDistanceTolerance:15,
            coinValue:3,
            coinsSpeed:.5,
            coinLastSpawn:0,
            distanceForCoinsSpawn:100,
  
            ennemyDistanceTolerance:30,
            ennemyValue:10,
            ennemiesSpeed:.6,
            ennemyLastSpawn:0,
            distanceForEnnemiesSpawn:50,
  
            status : "playing",
           };}
var Colors = {
        red:0xff0000,
        white:0xd8d0d1,
        brown:0x59332e,
        pink:0xF5986E,
        brownDark:0x23190f,
        blue:0x229a00 ,
        kirby:0xdb4f90,
        };
var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container;
var ennemiesPool = [];

function init() {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	createPlane();
	createSea();
	createSky();
    // createEnnemies();

	// start a loop that will update the objects' positions 
	// and render the scene on each frame
	loop();
}

function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	
	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true 
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}
var hemisphereLight, shadowLight;

function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}
// First let's define a Sea object :
Sea = function(){
	
	// create the geometry (shape) of the cylinder;
	// the parameters are: 
	// radius top, radius bottom, height, number of segments on the radius, number of segments vertically
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);
	
	// rotate the geometry on the x axis
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));
	
	// create the material 
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:true,
		opacity:.6,
		shading:THREE.FlatShading,
	});

	// To create an object in Three.js, we have to create a mesh 
	// which is a combination of a geometry and some material
	this.mesh = new THREE.Mesh(geom, mat);

	// Allow the sea to receive shadows
	this.mesh.receiveShadow = true; 
}

// Instantiate the sea and add it to the scene:

var sea;

function createSea(){
	sea = new Sea();

	// push it a little bit at the bottom of the scene
	sea.mesh.position.y = -600;

	// add the mesh of the sea to the scene
	scene.add(sea.mesh);
}
Cloud = function(){
	// Create an empty container that will hold the different parts of the cloud
	this.mesh = new THREE.Object3D();
	
	// create a cube geometry;
	// this shape will be duplicated to create the cloud
	var geom = new THREE.BoxGeometry(20,20,20);
	
	// create a material; a simple white material will do the trick
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.white,  
	});
	
	// duplicate the geometry a random number of times
	var nBlocs = 3+Math.floor(Math.random()*3);
	for (var i=0; i<nBlocs; i++ ){
		
		// create the mesh by cloning the geometry
		var m = new THREE.Mesh(geom, mat); 
		
		// set the position and the rotation of each cube randomly
		m.position.x = i*15;
		m.position.y = Math.random()*10;
		m.position.z = Math.random()*10;
		m.rotation.z = Math.random()*Math.PI*2;
		m.rotation.y = Math.random()*Math.PI*2;
		
		// set the size of the cube randomly
		var s = .1 + Math.random()*.9;
		m.scale.set(s,s,s);
		
		// allow each cube to cast and to receive shadows
		m.castShadow = true;
		m.receiveShadow = true;
		
		// add the cube to the container we first created
		this.mesh.add(m);
	} 
}
// Define a Sky Object
Sky = function(){
	// Create an empty container
	this.mesh = new THREE.Object3D();
	
	// choose a number of clouds to be scattered in the sky
	this.nClouds = 20;
	
	// To distribute the clouds consistently,
	// we need to place them according to a uniform angle
	var stepAngle = Math.PI*2 / this.nClouds;
	
	// create the clouds
	for(var i=0; i<this.nClouds; i++){
		var c = new Cloud();
	 
		// set the rotation and the position of each cloud;
		// for that we use a bit of trigonometry
		var a = stepAngle*i; // this is the final angle of the cloud
		var h = 750 + Math.random()*200; // this is the distance between the center of the axis and the cloud itself

		// Trigonometry!!! I hope you remember what you've learned in Math :)
		// in case you don't: 
		// we are simply converting polar coordinates (angle, distance) into Cartesian coordinates (x, y)
		c.mesh.position.y = Math.sin(a)*h;
		c.mesh.position.x = Math.cos(a)*h;

		// rotate the cloud according to its position
		c.mesh.rotation.z = a + Math.PI/2;

		// for a better result, we position the clouds 
		// at random depths inside of the scene
		c.mesh.position.z = -400-Math.random()*400;
		
		// we also set a random scale for each cloud
		var s = 1+Math.random()*2;
		c.mesh.scale.set(s,s,s);

		// do not forget to add the mesh of each cloud in the scene
		this.mesh.add(c.mesh);  
	}  
}

// Now we instantiate the sky and push its center a bit
// towards the bottom of the screen

var sky;

function createSky(){
	sky = new Sky();
	sky.mesh.position.y = -600;
	scene.add(sky.mesh);
}

var AirPlane = function() {
	
	this.mesh = new THREE.Object3D();


	// Create the cabin
	var geomCockpit = new THREE.SphereGeometry( 35, 32, 32 );
	var matCockpit = new THREE.MeshPhongMaterial({color:Colors.kirby, shading:THREE.FlatShading});
	var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
	cockpit.castShadow = true;
	cockpit.receiveShadow = true;
	this.mesh.add(cockpit);
	

    var geomSideWing1 = new THREE.CylinderGeometry(20,15,10,100,3,false,1,10); 
	var matSideWing1 = new THREE.MeshPhongMaterial({color:Colors.kirby, shading:THREE.FlatShading});
	var sideWing1 = new THREE.Mesh(geomSideWing1, matSideWing1);
    sideWing1.position.z = -30;
    sideWing1.rotation.x = -17;
    sideWing1.position.y = 30;
	sideWing1.castShadow = true;
	sideWing1.receiveShadow = true;
	this.mesh.add(sideWing1);
	
	// Create the wing
	var geomSideWing = new THREE.CylinderGeometry(20,15,10,100,3,false,1,10); 
	var matSideWing = new THREE.MeshPhongMaterial({color:Colors.kirby, shading:THREE.FlatShading});
	var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.position.z = 32;
    sideWing.rotation.x = 17;
    sideWing.position.y = -10;
	sideWing.castShadow = true;
	sideWing.receiveShadow = true;
	this.mesh.add(sideWing);


    var geomFoot = new THREE.CylinderGeometry( 12, 25, 10 );
    var matFoot = new THREE.MeshPhongMaterial({color:Colors.red, shading:THREE.FlatShading});
	var foot = new THREE.Mesh(geomFoot, matFoot);
    foot.position.z = 20;
    foot.rotation.z = 100;
    foot.position.y = -30;
    foot.position.x = -15;
    foot.rotation.x = -.2;
	foot.castShadow = true;
	foot.receiveShadow = true;
	this.mesh.add(foot);
	
	// propeller
	var geomPropeller = new THREE.BoxGeometry(20,10,10,1,1,1);
	var matPropeller = new THREE.MeshPhongMaterial({color:Colors.brown, shading:THREE.FlatShading});
	this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
	this.propeller.castShadow = true;
	this.propeller.receiveShadow = true;
	
	// blades
	var geomBlade = new THREE.BoxGeometry(1,100,20,1,1,1);
	var matBlade = new THREE.MeshPhongMaterial({color:Colors.brownDark, shading:THREE.FlatShading});
	
	var blade = new THREE.Mesh(geomBlade, matBlade);
	blade.position.set(8,0,0);
    // blade.rotation.y = 3 ;
	blade.castShadow = true;
	blade.receiveShadow = true;
	this.propeller.add(blade);
	this.propeller.position.set(0,56,-30);
    this.propeller.rotation.z = 1.55; //1.55
    this.propeller.rotation.x = -.4;
	this.mesh.add(this.propeller);
};

var airplane;

function createPlane(){ 
	airplane = new AirPlane();
	airplane.mesh.scale.set(.25,.25,.25);
	airplane.mesh.position.y = 100;
	scene.add(airplane.mesh);
}


function loop(){
	// Rotate the propeller, the sea and the sky
    airplane.sideWing.position.y = 20;
	airplane.propeller.rotation.x += 0.3;
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;
	// render the scene
	renderer.render(scene, camera);

	// call the loop function again
    // ennemiesHolder.spawnEnnemies()

	requestAnimationFrame(loop);
}
function init(event){
    resetGame();
	createScene();
	createLights();
	createPlane();
	createSea();
	createSky();
    createEnnemies();
    
	//add the listener
	document.addEventListener('mousemove', handleMouseMove, false);
	
	loop();
}
var mousePos={x:0, y:0};

// now handle the mousemove event

function handleMouseMove(event) {

	// here we are converting the mouse position value received 
	// to a normalized value varying between -1 and 1;
	// this is the formula for the horizontal axis:
	
	var tx = -1 + (event.clientX / WIDTH)*2;

	// for the vertical axis, we need to inverse the formula 
	// because the 2D y-axis goes the opposite direction of the 3D y-axis
	
	var ty = 1 - (event.clientY / HEIGHT)*2;
	mousePos = {x:tx, y:ty};

}


function updatePlane(){

	// let's move the airplane between -100 and 100 on the horizontal axis, 
	// and between 25 and 175 on the vertical axis,
	// depending on the mouse position which ranges between -1 and 1 on both axes;
	// to achieve that we use a normalize function (see below)
	
	var targetX = normalize(mousePos.x, -1, 1, -100, 100);
	var targetY = normalize(mousePos.y, -1, 1, 25, 175);

	// update the airplane's position
	airplane.mesh.position.y = targetY;
	airplane.mesh.position.x = targetX;
	airplane.propeller.rotation.y += .1;
}

function normalize(v,vmin,vmax,tmin, tmax){

	var nv = Math.max(Math.min(v,vmax), vmin);
	var dv = vmax-vmin;
	var pc = (nv-vmin)/dv;
	var dt = tmax-tmin;
	var tv = tmin + (pc*dt);
	return tv;

}
// -------------------------------------------------------------------------------------------


Sea = function(){
	var geom = new THREE.CylinderGeometry(600,600,800,40,10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI/2));

	// important: by merging vertices we ensure the continuity of the waves
	geom.mergeVertices();

	// get the vertices
	var l = geom.vertices.length;

	// create an array to store new data associated to each vertex
	this.waves = [];

	for (var i=0; i<l; i++){
		// get each vertex
		var v = geom.vertices[i];

		// store some data associated to it
		this.waves.push({y:v.y,
                x:v.x,
                z:v.z,
                // a random angle
                ang:Math.random()*Math.PI*2,
                // a random distance
                amp:5 + Math.random()*15,
                // a random speed between 0.016 and 0.048 radians / frame
                speed:0.016 + Math.random()*0.032
            });
	};
	var mat = new THREE.MeshPhongMaterial({
		color:Colors.blue,
		transparent:false,
		opacity:.8,
		shading:THREE.FlatShading,
	});

	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true;

}


// now we create the function that will be called in each frame 
// to update the position of the vertices to simulate the waves

Sea.prototype.moveWaves = function (){
	
	// get the vertices
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	
	for (var i=0; i<l; i++){
		var v = verts[i];
		
		// get the data associated to it
		var vprops = this.waves[i];
		
		// update the position of the vertex
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

		// increment the angle for the next frame
		vprops.ang += vprops.speed;

	}

	// Tell the renderer that the geometry of the sea has changed.
	// In fact, in order to maintain the best level of performance, 
	// three.js caches the geometries and ignores any changes
	// unless we add this line
	this.mesh.geometry.verticesNeedUpdate=true;

	sea.mesh.rotation.z += .005;
}

function updatePlane(){
	var targetY = normalize(mousePos.y,-.75,.75,25, 175);
	var targetX = normalize(mousePos.x,-.75,.75,-100, 100);
	
	// Move the plane at each frame by adding a fraction of the remaining distance
	airplane.mesh.position.y += (targetY-airplane.mesh.position.y)*0.1;

	// Rotate the plane proportionally to the remaining distance
	airplane.mesh.rotation.z = (targetY-airplane.mesh.position.y)*0.0128;
	airplane.mesh.rotation.x = (airplane.mesh.position.y-targetY)*0.0064;

	airplane.propeller.rotation.y += 0.3;
}

Ennemy = function(){
    var geom = new THREE.TetrahedronGeometry(8,2);
    var mat = new THREE.MeshPhongMaterial({
      color:Colors.red,
      shininess:0,
      specular:0xffffff,
      shading:THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom,mat);
    this.mesh.castShadow = true;
    this.angle = 0;
    this.dist = 0;
  }
  
  EnnemiesHolder = function (){
    this.mesh = new THREE.Object3D();
    this.ennemiesInUse = [];
  }
  
  EnnemiesHolder.prototype.spawnEnnemies = function(){
    var nEnnemies = 49;
  
    for (var i=0; i<nEnnemies; i++){
      var ennemy;
      if (ennemiesPool.length) {
        ennemy = ennemiesPool.pop();
      }else{
        ennemy = new Ennemy();
      }
  
      ennemy.angle = - (i*0.1);
      ennemy.distance = game.seaRadius + game.planeDefaultHeight + (-1 + Math.random() * 2) * (game.planeAmpHeight-20);
      ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
  
      this.mesh.add(ennemy.mesh);
      this.ennemiesInUse.push(ennemy);
    }
  }
  
  EnnemiesHolder.prototype.rotateEnnemies = function(){
    for (var i=0; i<this.ennemiesInUse.length; i++){
      var ennemy = this.ennemiesInUse[i];
      ennemy.angle += game.speed*deltaTime*game.ennemiesSpeed;
  
      if (ennemy.angle > Math.PI*2) ennemy.angle -= Math.PI*2;
  
      ennemy.mesh.position.y = -game.seaRadius + Math.sin(ennemy.angle)*ennemy.distance;
      ennemy.mesh.position.x = Math.cos(ennemy.angle)*ennemy.distance;
      ennemy.mesh.rotation.z += Math.random()*.1;
      ennemy.mesh.rotation.y += Math.random()*.1;
  
      //var globalEnnemyPosition =  ennemy.mesh.localToWorld(new THREE.Vector3());
      var diffPos = airplane.mesh.position.clone().sub(ennemy.mesh.position.clone());
      var d = diffPos.length();
      if (d<game.ennemyDistanceTolerance){  
        ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
        game.planeCollisionSpeedX = 100 * diffPos.x / d;
        game.planeCollisionSpeedY = 100 * diffPos.y / d;
        ennemiesInUse.shift();
       
  
        i--;
      }else if (ennemy.angle > Math.PI){
        ennemiesPool.unshift(this.ennemiesInUse.splice(i,1)[0]);
        this.mesh.remove(ennemy.mesh);
        i--;
      }

    }
    this.ennemiesInUse
  }

  
  function createEnnemies(){
    for (var i=0; i<10; i++){
      var ennemy = new Ennemy();
      ennemiesPool.push(ennemy);
    }
    ennemiesHolder = new EnnemiesHolder();
    //ennemiesHolder.mesh.position.y = -game.seaRadius;
    scene.add(ennemiesHolder.mesh)
  }
  function loop(){
	sea.mesh.rotation.z += .005;
	sky.mesh.rotation.z += .01;

	// update the plane on each frame
	updatePlane();
    // ennemiesHolder.spawnEnnemies();
    ennemiesHolder.rotateEnnemies();
    sea.moveWaves();
	renderer.render(scene, camera);

	requestAnimationFrame(loop);
    //exe

    
}

  window.addEventListener('load', init, false);