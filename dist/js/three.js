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

    /* Scene Lighting - Still a Work in progress */
    var mainLight = new THREE.PointLight( 0xffffff, 5.0, 28, 2 );
    mainLight.position.set( 0.418, 16.199, 0.300 );
    mainLight.add(new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10),new THREE.MeshBasicMaterial({color: 0xFF0000})));
    scene.add( mainLight );
    var whitePointLight = new THREE.PointLight(0xffffff)
    whitePointLight.position.set(0, 2, 0)
    whitePointLight.add(new THREE.Mesh(new THREE.SphereGeometry(1, 10, 10),new THREE.MeshBasicMaterial({color: 0xFF0000})));
    scene.add( whitePointLight );
}

function animate() {
    requestAnimationFrame( animate );

    mixer.update( clock.getDelta() );
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

/* Hand gestures */
const modelParams = {
    flipHorizontal: false,
    outputStride: 16,
    imageScaleFactor: 1,
    maxNumBoxes: 20,
    iouThreshold: 0.2,
    scoreThreshold: 0.7,
    modelType: "ssd320fpnlite",
    modelSize: "large",
    bboxLineWidth: "2",
    fontSize: 17,
}

const video = document.querySelector('#video');

let model;

navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;

handTrack.startVideo(video).then(status => {
    if (status) {
        navigator.getUserMedia({ video: {} }, stream => {
                video.sourceObject = stream;
                setInterval(runDetection, 1000);
            },
            err => console.log(err)
        );
    }
});

function runDetection() {
    model.detect(video).then(predictions => {
        console.log(predictions);
        predictions.forEach((p) => {
            if (p.label == "closed") {
                scene.translateZ(1);
            }

            if (p.label == "open") {
                scene.translateY(-1);
            }

            if (p.label == "point") {
                scene.translateY(1);
            }
        });
    });
}

handTrack.load(modelParams).then(lmodel => {
    model = lmodel;
});
