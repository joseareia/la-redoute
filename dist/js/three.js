/* General config variables */
let camera, scene, canvas, renderer, controls, controlsTrack, clock, mixer;

/* Animation variables */
var doorAnimation;
var statusLeftDoor = false;
var statusRightDoor = false;
var statusUpperDoor = false;
var statusLeg = false;

init();
animate();

function init() {
    camera = new THREE.PerspectiveCamera(70, 1280 / 960, 0.1, 500);
    camera.position.set( -3.75, 4, 13.75 );
    camera.lookAt( 0, 0, 0 );

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    canvas = document.getElementById( 'product3DCanvas' );

    new THREE.GLTFLoader()
        .setPath( '3d-model/' )
        .load( 'workBenchM.gltf', function ( gltf ) {
            gltfScene = gltf.scene;

            scene.add( gltfScene );

            clipLeftDoor = THREE.AnimationClip.findByName( gltf.animations, 'leftDoor' );
            clipRightDoor = THREE.AnimationClip.findByName( gltf.animations, 'rightDoor' );
            clipUpperDoor = THREE.AnimationClip.findByName( gltf.animations, 'upperDoor' );
            clipUpperDoorLeg = THREE.AnimationClip.findByName( gltf.animations, 'upperDoorLeg' );

            stoneBench = $(gltfScene.children).filter(function() {
                return this.name == "stoneBench";
            });

            wood =  $(gltfScene.children).filter(function() {
                return this.name != "stoneBench";
            });
        }
    );

    /* Import textures */
    const loaderTexture = new THREE.TextureLoader().setPath( '3d-model/materials/' );

    t_marble1 = loaderTexture.load( 'marble1.jpg' );
    t_marble2 = loaderTexture.load( 'marble2.png' );
    t_marble3 = loaderTexture.load( 'marble3.png' );

    t_wood1 = loaderTexture.load( 'wood1.png' );
    t_wood2 = loaderTexture.load( 'wood2.png' );
    t_wood3 = loaderTexture.load( 'wood3.png' );

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
    controls.enableDamping = true;
    controls.screenSpacePanning = true;

    controls.enableZoom = false;

    controls.rotateSpeed = 0.5;

    controls.minDistance = 10;
    controls.maxDistance = 20;

    controls.target.set( 0, 0.35, 0 );

    controlsTrack = new THREE.TrackballControls( camera, renderer.domElement );
    controlsTrack.noZoom = false;
    controlsTrack.noRotate = true;
    controlsTrack.noPan = true;

    controlsTrack.zoomSpeed = 0.4;

    controlsTrack.minDistance = 10;
    controlsTrack.maxDistance = 20;

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

    let target = controls.target;
    controls.update();
    controlsTrack.target.set( target.x, target.y, target.z );
    controlsTrack.update();

    render();
}

function render() {
    renderer.render( scene, camera );
}

/* Open Door */
function openDoor(clip) {
    doorAnimation = mixer.clipAction( clip );
    doorAnimation.reset();
    doorAnimation.timeScale = 1;
    doorAnimation.setLoop( THREE.LoopOnce );
    doorAnimation.clampWhenFinished = true;
    doorAnimation.play();
}

/* Close Door */
function closeDoor(clip) {
    doorAnimation = mixer.clipAction( clip );
    doorAnimation.paused = false;
    doorAnimation.timeScale = -1;
    doorAnimation.setLoop( THREE.LoopOnce );
    doorAnimation.play();
}

$("li[color='m-claro']").click(function() {
    t_marble1 = prepareTexture( t_marble1 );
    stoneBench[0].material.map = t_marble1;
    changeActive( $( this ) );
});

$("li[color='m-escuro']").click(function() {
    t_marble2 = prepareTexture( t_marble2 );
    stoneBench[0].material.map = t_marble2;
    changeActive( $( this ) );
});

$("li[color='m-veryEscuro']").click(function() {
    t_marble3 = prepareTexture( t_marble3 );
    stoneBench[0].material.map = t_marble3;
    changeActive( $( this ) );
});

$("li[color='c-escuro']").click(function() {
    t_wood1 = prepareTexture( t_wood1 );
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood1;
    }
    changeActive( $( this ) );
});

$("li[color='c-claro']").click(function() {
    t_wood2 = prepareTexture( t_wood2 );
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood2;
    }
    changeActive( $( this ) );
});

$("li[color='c-medio']").click(function() {
    t_wood3 = prepareTexture( t_wood3 );
    for (var i = 0; i < wood.length; i++) {
        wood[i].material.map = t_wood3;
    }
    changeActive( $( this ) );
});

function prepareTexture( texture ) {
    texture.encoding = THREE.sRGBEncoding;
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.flipY = false;
    return texture;
}

function changeActive( e ) {
    $(".options-list").find("li.li-active").removeClass("li-active");
    $( e ).addClass("li-active");
}

/* Animation to open/close left door */
$("#leftDoor").click(function() {
    if (!statusLeftDoor) {
        openDoor(clipLeftDoor);
        statusLeftDoor = true;
    } else {
        closeDoor(clipLeftDoor);
        statusLeftDoor = false;
    }
    if (this.innerHTML=="Porta esquerda - Abrir") this.innerHTML = "Porta esquerda - Fechar";
    else this.innerHTML = "Porta esquerda - Abrir";
});

/* Animation to open/close right door */
$("#rightDoor").click(function() {
    if (!statusRightDoor) {
        openDoor(clipRightDoor);
        statusRightDoor = true;
    } else {
        closeDoor(clipRightDoor);
        statusRightDoor = false;
    }
    if (this.innerHTML=="Porta direita - Abrir") this.innerHTML = "Porta direita - Fechar";
    else this.innerHTML = "Porta direita - Abrir";
});
/* Animation to open/close both doors */
$("#bothDoors").click(function() {
    if (!statusRightDoor && !statusLeftDoor) {
        openDoor(clipRightDoor);
        openDoor(clipLeftDoor);
        statusRightDoor = true;
        statusLeftDoor = true;
    } else {
        closeDoor(clipRightDoor);
        closeDoor(clipLeftDoor);
        statusRightDoor = false;
        statusLeftDoor = false;
    }

    var btnLeftDoor = document.getElementById("leftDoor")
    var btnRightDoor = document.getElementById("rightDoor")
    if (this.innerHTML=="Ambas Portas - Fechar"){
        this.innerHTML = "Ambas Portas - Abrir";
        btnLeftDoor.innerHTML = "Porta esquerda - Abrir"
        btnRightDoor.innerHTML = "Porta direita - Abrir"
    }
    else
    {
        this.innerHTML = "Ambas Portas - Fechar";
        btnLeftDoor.innerHTML = "Porta esquerda - Fechar"
        btnRightDoor.innerHTML = "Porta direita - Fechar"
    }
});

/* Animation to open/close upper door and leg */
$("#upperDoor").click(function() {
    if (!statusUpperDoor && !statusLeg) {
        openDoor(clipUpperDoor);
        openDoor(clipUpperDoorLeg);
        statusUpperDoor = true;
        statusLeg = true;
    } else {
        closeDoor(clipUpperDoorLeg);
        closeDoor(clipUpperDoor);
        statusUpperDoor = false;
        statusLeg = false;
    }
    if (this.innerHTML=="Apoio de Cima - Fechar") this.innerHTML = "Apoio de Cima - Abrir";
    else this.innerHTML = "Apoio de Cima - Fechar";
});

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
