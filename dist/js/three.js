/* General config variables */
let camera, scene, canvas, renderer, controls, clock, mixer;

/* Animation variables */
var leftDoor, rightDoor, upperDoor, upperDoorLeg;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, 1280 / 960, 0.1, 500);
    camera.position.set( -3.75, 4, 13.75 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xdddddd );

    canvas = document.getElementById( 'product3DCanvas' );

    new THREE.GLTFLoader()
        .setPath( '3d-model/' )
        .load( 'workBenchM.gltf', function ( gltf ) {
            scene.add( gltf.scene )

            clipLeftDoor = THREE.AnimationClip.findByName( gltf.animations, 'leftDoor' );
            clipRightDoor = THREE.AnimationClip.findByName( gltf.animations, 'rightDoor' );
            clipUpperDoor = THREE.AnimationClip.findByName( gltf.animations, 'upperDoor' );
            clipUpperDoorLeg = THREE.AnimationClip.findByName( gltf.animations, 'upperDoorLeg' );
        }
    );

    renderer = new THREE.WebGLRenderer({ canvas: product3DCanvas, antialias: true });
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( 800, 600 );
    renderer.setViewport( 0, -80, 800, 600 );
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
	renderer.toneMappingExposure = 1;
	renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();
    mixer = new THREE.AnimationMixer( scene );

    controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.minDistance = 10;
    controls.maxDistance = 20;
    controls.addEventListener( 'change', render );

    /* Scene Lighting */
    hemiLight = new THREE.HemisphereLight( 0xffeeb1, 0x080820, 4 );
    scene.add( hemiLight );
    light = new THREE.SpotLight( 0xffa95c, 4 );
    light.position.set( -50, 50, 50 );
    light.castShadow = true;
    scene.add(light);

    /* Shadows */
    scene.traverse(n => {
        if ( n.isMesh ) {
            n.castShadow = true;
            n.receiveShadow = true;
            if ( n.material.map ) n.material.map.anisotropy = 16;
        }
    });

    renderer.shadowMap.enabled = true;

    light.shadow.bias = -0.0001;
    light.shadow.mapSize.width = 1024 * 4;
    light.shadow.mapSize.height = 1024 * 4;
}

function animate() {
    requestAnimationFrame( animate );

    mixer.update( clock.getDelta() );

    light.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10,
    );

    render();
}

function render() {
    renderer.render( scene, camera );
}

/* Open Door */
function openDoor(clip) {
    leftDoor = mixer.clipAction( clip );
    leftDoor.reset();
    leftDoor.timeScale = 1;
    leftDoor.setLoop( THREE.LoopOnce );
    leftDoor.clampWhenFinished = true;
    leftDoor.play();
}

/* Close Door */
function closeDoor(clip) {
    leftDoor = mixer.clipAction( clip );
    leftDoor.paused = false;
    leftDoor.timeScale = -1;
    leftDoor.setLoop( THREE.LoopOnce );
    leftDoor.play();
}

/* Animation to open left door */
document.getElementById('open_left_door').onclick = function () {
    openDoor(clipLeftDoor)
}

/* Animation to close left door */
document.getElementById('close_left_door').onclick = function () {
    closeDoor(clipLeftDoor)
}

/* Animation to open right door */
document.getElementById('open_right_door').onclick = function () {
    openDoor(clipRightDoor)
}

/* Animation to close right door */
document.getElementById('close_right_door').onclick = function () {
    closeDoor(clipRightDoor)
}

/* Animation to open both doors */
document.getElementById('open_both_doors').onclick = function () {
    openDoor(clipRightDoor)
    openDoor(clipLeftDoor)
}

/* Animation to close both doors */
document.getElementById('close_both_doors').onclick = function () {
    closeDoor(clipRightDoor)
    closeDoor(clipLeftDoor)
}

/* Animation to open upper door and leg */
document.getElementById('open_upper_door').onclick = function () {
    openDoor(clipUpperDoor)
    openDoor(clipUpperDoorLeg)
}

/* Animation to close upper door and leg */
document.getElementById('close_upper_door').onclick = function () {
    closeDoor(clipUpperDoorLeg)
    closeDoor(clipUpperDoor)
}

/* Gets the image uploaded */
var image_input = document.querySelector("#image_input")
image_input.addEventListener("change", function () {
    var reader = new FileReader()
    reader.addEventListener("load", () => {
        uploaded_image = reader.result
        loadBackgroundImage(uploaded_image)
    })
    reader.readAsDataURL(this.files[0])
})

/* Add Background Image to Model */
function loadBackgroundImage(uploaded_image) {
    var loaderBackground = new THREE.TextureLoader();
    loaderBackground.load(uploaded_image, function (texture) {
        scene.background = texture;
    })
}

/* Make Object Bigger */
document.getElementById('bigger').onclick = function () {
    scene.scale.multiplyScalar(1.1);
}

/* Make Object Smaller */
document.getElementById('smaller').onclick = function () {
    scene.scale.multiplyScalar(0.9);
}

/* Move Object Up */
document.getElementById('up').onclick = function () {
    scene.translateY(1);
}

/* Move Object Down */
document.getElementById('down').onclick = function () {
    scene.translateY(-1);
}

/* Move Object Right */
document.getElementById('right').onclick = function () {
    scene.translateX(1);
}

/* Move Object Left */
document.getElementById('left').onclick = function () {
    scene.translateX(-1);
}

/* Move Object Left */
document.getElementById('front').onclick = function () {
    scene.translateZ(1);
}

/* Move Object Right */
document.getElementById('back').onclick = function () {
    scene.translateZ(-1);
}
