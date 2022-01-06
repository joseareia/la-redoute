/* General config variables */
let camera, scene, canvas, renderer, controls, controlsTrack, clock, mixer;

/* Animation variables */
var doorAnimation;
var statusLeftDoor = false;
var statusRightDoor = false;
var statusUpperDoor = false;
var statusLeg = false;

/* Light Intensity */
var pl_left, pl_right, pl_left_inv, pl_right_inv, pl_inside;
var lightPointsArr = [];

/* Array that contains all the pickable meshes in the scene */
var pickableMeshes = [];

var hT, hH, wH, wS, triggerBool = false;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(60, 1.475, 0.1, 200);
    camera.position.set(-3.75, 4, 11.75);
    camera.lookAt(0, 0, 0);

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xffffff);

    canvas = document.getElementById('product3DCanvas');

    new THREE.GLTFLoader()
        .setPath('3d-model/')
        .load('workBenchM.gltf', function(gltf) {
            gltfScene = gltf.scene;

            scene.add(gltfScene);

            clipLeftDoor = THREE.AnimationClip.findByName(gltf.animations, 'leftDoor');
            clipRightDoor = THREE.AnimationClip.findByName(gltf.animations, 'rightDoor');
            clipUpperDoor = THREE.AnimationClip.findByName(gltf.animations, 'upperDoor');
            clipUpperDoorLeg = THREE.AnimationClip.findByName(gltf.animations, 'upperDoorLeg');

            stoneBench = $(gltfScene.children).filter(function() {
                return this.name == "stoneBench";
            });

            wood = $(gltfScene.children).filter(function() {
                return this.name != "stoneBench";
            });

            gltfScene.traverse((node) => {
                if (node instanceof THREE.Mesh && node.name != "workBench") {
                    pickableMeshes.push(node);
                }
            });

            stoneBench[0].needsUpdate = true;
            for (var i = 0; i < wood.length; i++) {
                wood[i].needsUpdate = true;
            }
        });

    /* Import textures */
    const loaderTexture = new THREE.TextureLoader().setPath('3d-model/materials/');

    t_marble1 = loaderTexture.load('marble1.jpg');
    t_marble2 = loaderTexture.load('marble2.png');
    t_marble3 = loaderTexture.load('marble3.png');

    t_wood1 = loaderTexture.load('wood1.png');
    t_wood2 = loaderTexture.load('wood2.png');
    t_wood3 = loaderTexture.load('wood3.png');

    renderer = new THREE.WebGLRenderer({
        canvas: product3DCanvas,
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(800, 600);
    renderer.setViewport(0, 30, 800, 600);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.shadowMap.enabled = true;

    clock = new THREE.Clock();
    mixer = new THREE.AnimationMixer(scene);

    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.screenSpacePanning = true;

    controls.enableZoom = false;

    controls.rotateSpeed = 0.5;

    controls.minDistance = 10;
    controls.maxDistance = 20;

    controlsTrack = new THREE.TrackballControls(camera, renderer.domElement);
    controlsTrack.noZoom = false;
    controlsTrack.noRotate = true;
    controlsTrack.noPan = true;

    controlsTrack.zoomSpeed = 0.4;

    controlsTrack.minDistance = 10;
    controlsTrack.maxDistance = 20;

    controls.addEventListener('change', render);

    /* Scene Lighting */
    pl_left = new THREE.PointLight(0xE6E6DF, 5.0, 28, 2);
    pl_right = new THREE.PointLight(0xE6E6DF, 5.0, 28, 2);
    pl_left_inv = new THREE.PointLight(0xd4d4cf, 5.0, 28, 2);
    pl_right_inv = new THREE.PointLight(0xd4d4cf, 5.0, 28, 2);
    pl_inside = new THREE.PointLight(0xd4d4cf);

    lightPointsArr.push(pl_left, pl_right, pl_left_inv, pl_right_inv, pl_inside);

    pl_left.position.set(-7, 14, 9);
    pl_right.position.set(7, 14, 9);
    pl_left_inv.position.set(-15, 5, -15);
    pl_right_inv.position.set(15, 5, -15);
    pl_inside.position.set(0, 0, 0);

    for (var i = 0; i < lightPointsArr.length; i++) {
        if (i == lightPointsArr.length - 1) {
            lightPointsArr[i].intensity = 5 - 4.7;
        } else {
            lightPointsArr[i].intensity = 5;
        }
    }

    scene.add(pl_left, pl_right, pl_left_inv, pl_right_inv, pl_inside);

    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();

    window.onclick = function(e) {
        let canvasBounds = canvas.getBoundingClientRect();
        mouse.x = ((e.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
        mouse.y = -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
        getObjects();
    }

    // window.addEventListener("mousemove", function(e) {
    //     let canvasBounds = canvas.getBoundingClientRect();
    //     mouse.x = ((e.clientX - canvasBounds.left) / (canvasBounds.right - canvasBounds.left)) * 2 - 1;
    //     mouse.y = -((event.clientY - canvasBounds.top) / (canvasBounds.bottom - canvasBounds.top)) * 2 + 1;
    //     hoverObjects();
    // });
}

function sliderLight(val) {
    for (var i = 0; i < lightPointsArr.length; i++) {
        if (i == lightPointsArr.length - 1) {
            if (val - 4.7 < 0) {
                lightPointsArr[i].intensity = 0;
            } else {
                lightPointsArr[i].intensity = val - 4.7;
            }
        } else {
            lightPointsArr[i].intensity = val;
        }
    }
}

function animate() {
    requestAnimationFrame(animate);

    mixer.update(clock.getDelta());

    let target = controls.target;
    controls.update();
    controlsTrack.target.set(target.x, target.y, target.z);
    controlsTrack.update();

    render();
}

function render() {
    renderer.render(scene, camera);
}

/* Animate object on click */
function getObjects() {
    raycaster.setFromCamera(mouse, camera);
    const intersectedObjects = raycaster.intersectObjects(pickableMeshes, false);
    if (intersectedObjects.length > 0) {
        if (intersectedObjects[0].object.name == "door") {
            if (!statusLeftDoor) {
                openDoor(clipLeftDoor);
                statusLeftDoor = true;
                document.getElementById("leftDoor").checked = true;
            } else {
                closeDoor(clipLeftDoor);
                statusLeftDoor = false;
                document.getElementById("leftDoor").checked = false;

            }
        }

        if (intersectedObjects[0].object.name == "door1") {
            if (!statusRightDoor) {
                openDoor(clipRightDoor);
                statusRightDoor = true;
                document.getElementById("rightDoor").checked = true;
            } else {
                closeDoor(clipRightDoor);
                statusRightDoor = false;
                document.getElementById("rightDoor").checked = false;
            }
        }

        if (intersectedObjects[0].object.name == "benchExtend") {
            if (!statusUpperDoor && !statusLeg) {
                openDoor(clipUpperDoor);
                openDoor(clipUpperDoorLeg);
                statusUpperDoor = true;
                statusLeg = true;
                document.getElementById("upperDoor").checked = true;
            } else {
                closeDoor(clipUpperDoorLeg);
                closeDoor(clipUpperDoor);
                statusUpperDoor = false;
                statusLeg = false;
                document.getElementById("upperDoor").checked = false;
            }
        }
    }
}

function hoverObjects() {
    raycaster.setFromCamera(mouse, camera);
    const intersectedObjects = raycaster.intersectObjects(pickableMeshes, false);
    if (intersectedObjects.length > 0) {
        var pickedObject = intersectedObjects[0].object;
        if (pickedObject.name == "stoneBench") {
            $('#pHere').removeClass("d-none");
        }
    } else {
        $('#pHere').addClass("d-none");
    }
}

/* Change texture of the objects */
$("li[color='m-claro']").click(function() {
    t_marble1 = prepareTexture(t_marble1);
    stoneBench[0].material.map = t_marble1;
    changeActive($(this));
});

$("li[color='m-escuro']").click(function() {
    t_marble2 = prepareTexture(t_marble2);
    stoneBench[0].material.map = t_marble2;
    changeActive($(this));
});

$("li[color='m-veryEscuro']").click(function() {
    t_marble3 = prepareTexture(t_marble3);
    stoneBench[0].material.map = t_marble3;
    changeActive($(this));
});

$("li[color='c-escuro']").click(function() {
    t_wood1 = prepareTexture(t_wood1);
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood1;
    }
    changeActive($(this));
});

$("li[color='c-claro']").click(function() {
    t_wood2 = prepareTexture(t_wood2);
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood2;
    }
    changeActive($(this));
});

$("li[color='c-medio']").click(function() {
    t_wood3 = prepareTexture(t_wood3);
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood3;
    }
    changeActive($(this));
});

function prepareTexture(texture) {
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    return texture;
}

function changeActive(e) {
    $(".options-list").find("li.li-active").removeClass("li-active");
    $(e).addClass("li-active");
}

/* Open Door */
function openDoor(clip) {
    doorAnimation = mixer.clipAction(clip);
    doorAnimation.reset();
    doorAnimation.timeScale = 1;
    doorAnimation.setLoop(THREE.LoopOnce);
    doorAnimation.clampWhenFinished = true;
    doorAnimation.play();
}

/* Close Door */
function closeDoor(clip) {
    doorAnimation = mixer.clipAction(clip);
    doorAnimation.paused = false;
    doorAnimation.timeScale = -1;
    doorAnimation.setLoop(THREE.LoopOnce);
    doorAnimation.play();
}

/* Animation to open/close left door */
$("#leftDoor").click(function() {
    if (!statusLeftDoor) {
        openDoor(clipLeftDoor);
        statusLeftDoor = true;
        document.getElementById("leftDoor").checked = true;
    } else {
        closeDoor(clipLeftDoor);
        statusLeftDoor = false;
        document.getElementById("leftDoor").checked = false;
    }
});

/* Animation to open/close right door */
$("#rightDoor").click(function() {
    if (!statusRightDoor) {
        openDoor(clipRightDoor);
        statusRightDoor = true;
        document.getElementById("rightDoor").checked = true;
    } else {
        closeDoor(clipRightDoor);
        statusRightDoor = false;
        document.getElementById("rightDoor").checked = false;
    }
});
/* Animation to open/close both doors */
$("#bothDoors").click(function() {
    if (!statusRightDoor && !statusLeftDoor) {
        openDoor(clipRightDoor);
        openDoor(clipLeftDoor);
        statusRightDoor = true;
        statusLeftDoor = true;
        document.getElementById("bothDoors").checked = true;
        document.getElementById("leftDoor").checked = true;
        document.getElementById("rightDoor").checked = true;
    } else {
        closeDoor(clipRightDoor);
        closeDoor(clipLeftDoor);
        statusRightDoor = false;
        statusLeftDoor = false;
        document.getElementById("bothDoors").checked = false;
        document.getElementById("leftDoor").checked = false;
        document.getElementById("rightDoor").checked = false;
    }
});

/* Animation to open/close upper door and leg */
$("#upperDoor").click(function() {
    if (!statusUpperDoor && !statusLeg) {
        openDoor(clipUpperDoor);
        openDoor(clipUpperDoorLeg);
        statusUpperDoor = true;
        statusLeg = true;
        document.getElementById("upperDoor").checked = true;
    } else {
        closeDoor(clipUpperDoorLeg);
        closeDoor(clipUpperDoor);
        statusUpperDoor = false;
        statusLeg = false;
        document.getElementById("upperDoor").checked = false;
    }
});

/* Scroll modal */
$(window).scroll(function() {
    hT = $('#product3DCanvas').offset().top;
    hH = $('#product3DCanvas').outerHeight();
    wH = $(window).height();
    wS = $(this).scrollTop();
    if (wS > (hT + hH - wH) && (hT > wS) && (wS + wH > hT + hH) && !triggerBool) {
        $(".btn.btn-primary.btnTriggerModal").click();
        triggerBool = true;
    }
});

/* Gets the image uploaded */
var image_input = document.querySelector("#image_input")
image_input.addEventListener("change", function() {
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
    loaderBackground.load(uploaded_image, function(texture) {
        scene.background = texture;
    })
}

/* Make Object Bigger/Smaller */
var lastVal = 1;
function sliderScale(val) {
    if (lastVal > val)
        scene.scale.multiplyScalar(0.9);
    else
        scene.scale.multiplyScalar(1.1);
    lastVal = val;
}

/* Move Object Diagonal Top Left */
document.getElementById('diagonalTopLeft').onclick = function () {
    scene.translateX(-1);
    scene.translateY(1);
}

/* Move Object Diagonal Top Right */
document.getElementById('diagonalTopRight').onclick = function () {
    scene.translateX(1);
    scene.translateY(1);
}

/* Move Object Diagonal Bottom Left */
document.getElementById('diagonalBottomLeft').onclick = function () {
    scene.translateX(-1);
    scene.translateY(-1);
}

/* Move Object Diagonal Bottom Right */
document.getElementById('diagonalBottomRight').onclick = function () {
    scene.translateX(1);
    scene.translateY(-1);
}

/* Move Object Up */
document.getElementById('up').onclick = function() {
    scene.translateY(1);
}

/* Move Object Down */
document.getElementById('down').onclick = function() {
    scene.translateY(-1);
}

/* Move Object Right */
document.getElementById('right').onclick = function() {
    scene.translateX(1);
}

/* Move Object Left */
document.getElementById('left').onclick = function() {
    scene.translateX(-1);
}

/* Move Object Left */
document.getElementById('front').onclick = function() {
    scene.translateZ(1);
}

/* Move Object Right */
document.getElementById('back').onclick = function() {
    scene.translateZ(-1);
}

// /* Hand gestures */
// const modelParams = {
//     flipHorizontal: false,
//     outputStride: 16,
//     imageScaleFactor: 1,
//     maxNumBoxes: 20,
//     iouThreshold: 0.2,
//     scoreThreshold: 0.7,
//     modelType: "ssd320fpnlite",
//     modelSize: "large",
//     bboxLineWidth: "2",
//     fontSize: 17,
// }
//
// const video = document.querySelector('#video');
//
// let model;
//
// navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia;
//
// handTrack.startVideo(video).then(status => {
//     if (status) {
//         navigator.getUserMedia({ video: {} }, stream => {
//                 video.sourceObject = stream;
//                 setInterval(runDetection, 1000);
//             },
//             err => console.log(err)
//         );
//     }
// });
//
// function runDetection() {
//     model.detect(video).then(predictions => {
//         console.log(predictions);
//         predictions.forEach((p) => {
//             if (p.label == "closed") {
//                 scene.translateZ(1);
//             }
//
//             if (p.label == "open") {
//                 scene.translateY(-1);
//             }
//
//             if (p.label == "point") {
//                 scene.translateY(1);
//             }
//         });
//     });
// }
//
// handTrack.load(modelParams).then(lmodel => {
//     model = lmodel;
// });
