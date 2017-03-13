var camera, scene, renderer;
var cameraControls, effectController;
var clock = new THREE.Clock();
var gridX = true;
var gridY = false;
var gridZ = false;
var axes = true;
var ground = true;
var arm, forearm, rectangle;

function fillScene() {
	scene = new THREE.Scene();
	scene.fog = new THREE.Fog( 0x808080, 2000, 4000 );

	// LIGHTS
	var ambientLight = new THREE.AmbientLight( 0x222222 );
	
	var light = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light.position.set( 200, 400, 500 );
	
	var light2 = new THREE.DirectionalLight( 0xFFFFFF, 1.0 );
	light2.position.set( -500, 250, -200 );
	
	scene.add(ambientLight);
	scene.add(light);
	scene.add(light2);

	if (ground) {
		Coordinates.drawGround({size:10000});		
	}
	if (gridX) {
		Coordinates.drawGrid({size:10000,scale:0.01});
	}
	if (gridY) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"y"});
	}
	if (gridZ) {
		Coordinates.drawGrid({size:10000,scale:0.01, orientation:"z"});	
	}
	if (axes) {
		Coordinates.drawAllAxes({axisLength:200,axisRadius:1,axisTess:50});
	}
	
	var robotBaseMaterial = new THREE.MeshPhongMaterial( { color: 0x6E23BB, specular: 0x6E23BB, shininess: 20 } );
	var robotForearmMaterial = new THREE.MeshPhongMaterial( { color: 0xF4C154, specular: 0xF4C154, shininess: 100 } );
	var robotUpperArmMaterial = new THREE.MeshPhongMaterial( { color: 0x95E4FB, specular: 0x95E4FB, shininess: 100 } );
	var robotuptMaterial = new THREE.MeshPhongMaterial( { color: 0xFF6600, specular: 0xFF6633, shininess: 20 } );
	
	var torus = new THREE.Mesh(
		new THREE.TorusGeometry( 22, 15, 32, 32 ), robotBaseMaterial );
	torus.rotation.x = 90 * Math.PI/180;
	scene.add( torus );

	forearm = new THREE.Object3D();
	var faLength = 80;

	createRobotExtender( forearm, faLength, robotForearmMaterial );

	arm = new THREE.Object3D();
	var uaLength = 120;

	createRobotCrane( arm, uaLength, robotUpperArmMaterial );

	// Move the forearm itself to the end of the upper arm.
	forearm.position.y = uaLength;
	arm.add( forearm );

	rectangle = new THREE.Object3D();
	createRectangle( rectangle, robotuptMaterial );
	rectangle.position.y = 80;
	forearm.add( rectangle );
	scene.add( arm );
}

function createRectangle( part, material )
{
	

	var cylinder=new THREE.Mesh(new THREE.CylinderGeometry(3,3,100,30),material);
	cylinder.rotation.x =  Math.PI/180;
	cylinder.position.y = 50;
	part.add(cylinder);
	
	
	var cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 17,17, 6, 32 ),material);
		cylinder.rotation.x =  89*Math.PI/180;
	part.add(cylinder);
	
	
	var cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 17,17, 6, 32 ),material);
		cylinder.position.z = -28;
		cylinder.rotation.x =  89*Math.PI/180;
		
	
	part.add(cylinder);

	
	
	
   var cubeMaterial = new THREE.MeshLambertMaterial( { color: 0xF07020 } );
   
   
	// base
	var cube;
	cube = new THREE.Mesh( 
		new THREE.CubeGeometry( 100, 50, 50 ), cubeMaterial );
	cube.position.x = 0;	// (20+32) - half of width (20+64+110)/2
	cube.position.y = 100;	// half of height
	cube.position.z = 0;

	// centered at origin
	part.add( cube );
	
}

function createRobotExtender( part, length, material )
{
	var cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 22, 22, 6, 32 ), material );
	part.add( cylinder );

	var i;
	for ( i = 0; i < 4; i++ )
	{
		var box = new THREE.Mesh(
			new THREE.CubeGeometry( 4, length, 4 ), material );
		box.position.x = (i < 2) ? -8 : 8;
		box.position.y = length/2;
		box.position.z = (i%2) ? -8 : 8;
		part.add( box );
	}

	cylinder = new THREE.Mesh(
		new THREE.CylinderGeometry( 15, 15, 60, 32 ), material );
	cylinder.rotation.x = 90 * Math.PI/180;
	cylinder.position.y = length;
	part.add( cylinder );
}

function createRobotCrane( part, length, material )
{
	var box = new THREE.Mesh(
		new THREE.CubeGeometry( 18, length, 18 ), material );
	box.position.y = length/2;
	part.add( box );

	var sphere = new THREE.Mesh(
		new THREE.SphereGeometry( 20, 32, 16 ), material );
	// place sphere at end of arm
	sphere.position.y = length;
	part.add( sphere );
}

function init() {
	var canvasWidth = window.innerWidth;
	var canvasHeight = window.innerHeight;
	var canvasRatio = canvasWidth / canvasHeight;

	// RENDERER
	renderer = new THREE.WebGLRenderer( { antialias: true } );
	renderer.gammaInput = true;
	renderer.gammaOutput = true;
	renderer.setSize(canvasWidth, canvasHeight);
	renderer.setClearColorHex( 0xAAAAAA, 1.0 );

	var container = document.getElementById('container');
	container.appendChild( renderer.domElement );

	// CAMERA
	camera = new THREE.PerspectiveCamera( 30, canvasRatio, 1, 10000 );
	camera.position.set( -510, 240, 100 );
	// CONTROLS
	cameraControls = new THREE.OrbitAndPanControls(camera, renderer.domElement);
	cameraControls.target.set(0,100,0);

	fillScene();

}

function animate() {
	window.requestAnimationFrame(animate);
	render();
}

function render() {
	var delta = clock.getDelta();
	cameraControls.update(delta);

	if ( effectController.newGridX !== gridX || effectController.newGridY !== gridY || effectController.newGridZ !== gridZ || effectController.newGround !== ground || effectController.newAxes !== axes)
	{
		gridX = effectController.newGridX;
		gridY = effectController.newGridY;
		gridZ = effectController.newGridZ;
		ground = effectController.newGround;
		axes = effectController.newAxes;

		fillScene();

	}

	arm.rotation.y = effectController.uy * Math.PI/180;	// yaw
	arm.rotation.z = effectController.uz * Math.PI/180;	// roll

	forearm.rotation.y = effectController.fy * Math.PI/180;	// yaw
	forearm.rotation.z = effectController.fz * Math.PI/180;	// roll

	rectangle.rotation.z = effectController.az * Math.PI/180;	// yaw
	rectangle.position.z = effectController.apz;	// translate

	renderer.render(scene, camera);
}

function setupGui() {

	effectController = {

		newGridX: gridX,
		newGridY: gridY,
		newGridZ: gridZ,
		newGround: ground,
		newAxes: axes,

		uy: 70.0,
		uz: -15.0,

		fy: 10.0,
		fz: 60.0,

		az: 30.0,
		apz: 12.0
	};

	var gui = new dat.GUI();
	var h = gui.addFolder("Grid display");
	h.add( effectController, "newGridX").name("Show XZ grid");
	h.add( effectController, "newGridY" ).name("Show YZ grid");
	h.add( effectController, "newGridZ" ).name("Show XY grid");
	h.add( effectController, "newGround" ).name("Show ground");
	h.add( effectController, "newAxes" ).name("Show axes");
	h = gui.addFolder("Arm angles");
	h.add(effectController, "uy", -180.0, 180.0, 0.025).name("Upper arm y");
	h.add(effectController, "uz", -45.0, 45.0, 0.025).name("Upper arm z");
	h.add(effectController, "fy", -180.0, 180.0, 0.025).name("Forearm y");
	h.add(effectController, "fz", -120.0, 120.0, 0.025).name("Forearm z");
	h.add(effectController, "az", -100.0, 100.0, 0.025).name("arm z");
	
	h.add(effectController, "apz", 14.0, 25.0, 0.025).name("armp z");
}

function takeScreenshot() {
	effectController.newGround = true;
	effectController.newGridX = false;
	effectController.newGridY = false;
	effectController.newGridZ = false;
	effectController.newAxes = false;
	init();
	render();
	var img1 = renderer.domElement.toDataURL("image/png");
	camera.position.set( 400, 500, -800 );
	render();
	var img2 = renderer.domElement.toDataURL("image/png");
	var imgTarget = window.open('', 'For grading script');
	imgTarget.document.write('<img src="'+img1+'"/><img src="'+img2+'"/>');
}


init();
setupGui();
animate();
$("body").keydown(function(event) {
	if (event.which === 80) {
		takeScreenshot();
	}
});