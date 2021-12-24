var scene = new THREE.Scene()
scene.background = new THREE.Color(0xdddddd);
var camera = new THREE.PerspectiveCamera(70, 1280 / 960, 0.1, 500)
var canvas = document.getElementById('myCanvas')
var renderer = new THREE.WebGLRenderer({ canvas: myCanvas })

var clock = new THREE.Clock()
var mixer = new THREE.AnimationMixer(scene)

/* Animations */
var leftDoor = null
var rightDoor = null
var upperDoor = null
var upperDoorLeg = null

/* Sets the size of the canvas */
renderer.setSize(800, 600)
renderer.render(scene, camera)
renderer.shadowMap.enabled = true

/* Sets camera positions */
camera.position.set(0, 10, 15);
camera.lookAt(0, 0, 0)

/* Camera Zoom */
var controls = new THREE.OrbitControls(camera, renderer.domElement)
controls.minDistance = 10
controls.maxDistance = 20

var loader = new THREE.GLTFLoader()

function makeRender() {
    renderer.render(scene, camera)
}
makeRender()

controls.addEventListener('change', makeRender)

/* Loads Animation for left door */
loader.load(
    '../3d-model/workBenchM.gltf',
    function (gltf) {
        scene.add(gltf.scene)

        clipLeftDoor = THREE.AnimationClip.findByName(gltf.animations, 'leftDoor')
        clipRightDoor = THREE.AnimationClip.findByName(gltf.animations, 'rightDoor')
        clipUpperDoor = THREE.AnimationClip.findByName(gltf.animations, 'upperDoor')
        clipUpperDoorLeg = THREE.AnimationClip.findByName(gltf.animations, 'upperDoorLeg')
    }
)

/* Scene Lighting */
hemiLight = new THREE.HemisphereLight(0xffeeb1, 0x080820, 4);
scene.add(hemiLight);
light = new THREE.SpotLight(0xffa95c, 4);
light.position.set(-50, 50, 50);
light.castShadow = true;
scene.add(light);

/* Shadows */
scene.traverse(n => {
    if (n.isMesh) {
        n.castShadow = true;
        n.receiveShadow = true;
        if (n.material.map) n.material.map.anisotropy = 16;
    }
});

renderer.shadowMap.enabled = true;

light.shadow.bias = -0.0001;
light.shadow.mapSize.width = 1024 * 4;
light.shadow.mapSize.height = 1024 * 4;

/* Starts the animation */
function animate() {
    requestAnimationFrame(animate)
    mixer.update(clock.getDelta())
    renderer.render(scene, camera)

    light.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10,
    );
}

animate()

/* Open Door */
function openDoor(clip) {
    leftDoor = mixer.clipAction(clip)
    leftDoor.reset()
    leftDoor.timeScale = 1
    leftDoor.setLoop(THREE.LoopOnce)
    leftDoor.clampWhenFinished = true
    leftDoor.play()
}

/* Close Door */
function closeDoor(clip) {
    leftDoor = mixer.clipAction(clip)
    leftDoor.paused = false
    leftDoor.timeScale = -1
    leftDoor.setLoop(THREE.LoopOnce)
    leftDoor.play()
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