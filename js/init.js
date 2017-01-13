var audio;
var scene, camera, renderer, controls, stats, directionalLight;
var waterPlane;
var tree = [];
var boxSize = 7000;
var materialArray;
var skyGeometry
$(document).ready(function () {

    scene = new THREE.Scene();

    //////////
    //camera//
    //////////
    var VIEW_ANGLE = 75;
    var WIDTH = window.innerWidth;
    var HEIGHT = window.innerHeight;
    var NEAR = 1;
    var FAR = 100000;
    camera = new THREE.PerspectiveCamera(VIEW_ANGLE, WIDTH / HEIGHT, NEAR, FAR);
    camera.position.set(0, 300, -500);

    ////////////
    //renderer//
    ////////////

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);
    renderer.shadowMapEnabled = true;
    renderer.shadowMapSoft = true;
    renderer.autoClear = true;
    renderer.shadowMapType = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    var geometry = new THREE.BoxGeometry(1, 1, 1);
    var material = new THREE.MeshBasicMaterial({
        color: 0x00ff00
    });

    /////////
    //water//
    /////////
    var worldWidth = 64,
        worldDepth = 64,
        worldHalfWidth = worldWidth / 2,
        worldHalfDepth = worldDepth / 2;

    var geometry = new THREE.PlaneGeometry(boxSize, boxSize, worldWidth - 1, worldDepth - 1);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2)); // Bakes matrix transform directly into vertex coordinates.
    // tạo nước
    var texture = THREE.ImageUtils.loadTexture("img/water.jpg");
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(5, 5);

    waterPlane = new THREE.Mesh(
        geometry,
        new THREE.MeshLambertMaterial({
            color: 0x08316F,
            wireframe: false,
            map: texture
        }));
    // Tạo bóng cho mặt khuất
    waterPlane.castShadow = true;
    waterPlane.receiveShadow = true;
    scene.add(waterPlane);
    
    ////////////
    //mountain//
    ////////////

    // Initialize some principal parameters.
    var worldWidth = 64;
    var smoothinFactor = 150;
    var boundaryHeight = 70;
    var treeNumber = 50;

    var geometry = new THREE.PlaneGeometry(500, 500, worldWidth - 1, worldWidth - 1);
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));

    // Lát cỏ lên mặt
    var grassTex = THREE.ImageUtils.loadTexture('img/grass.jpg');
    grassTex.wrapS = THREE.RepeatWrapping;
    grassTex.wrapT = THREE.RepeatWrapping;
    grassTex.repeat.x = 15;
    grassTex.repeat.y = 15;

    var mountainMaterial = new THREE.MeshLambertMaterial({
        color: 0xA3F8A9,
        wireframe: false,
        side: THREE.DoubleSide,
        map: grassTex
    });
    mountain = new THREE.Mesh(geometry, mountainMaterial);
    generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);

    // Tạo bóng
    mountain.receiveShadow = true;
    mountain.castShadow = true;
    scene.add(mountain);


    //////////
    //skybox//
    //////////

    skyGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

    materialArray = [
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/right.jpg'),
            side: THREE.BackSide
        }), // right
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/left.jpg'),
            side: THREE.BackSide
        }), // left
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/top.jpg'),
            side: THREE.BackSide
        }), // top
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/bottom.jpg'),
            side: THREE.BackSide
        }), // bottom
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/back.jpg'),
            side: THREE.BackSide
        }), // back
                    new THREE.MeshBasicMaterial({
            map: THREE.ImageUtils.loadTexture('img/skyTexture/front.jpg'),
            side: THREE.BackSide
        }) // front
                ];

    skyMaterial = new THREE.MeshFaceMaterial(materialArray);

    var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
    scene.add(skyBox);

    /////////
    //light//
    /////////

    directionalLight = new THREE.DirectionalLight(0xffffff, 6.5);
    directionalLight.position.set(500, 200, 500);

    directionalLight.castShadow = true;
    directionalLight.shadowMapWidth = 2048;
    directionalLight.shadowMapHeight = 2048;
    scene.add(directionalLight);

    ///////
    //fog//
    ///////
    // Tạo sương mù cho scene
    
    scene.fog = new THREE.Fog(0xffffff, 0, boxSize * (3 / 4));

    ////////
    //info//
    ////////
    // Thông tin chương trình
    info = document.createElement('div');
    info.style.position = 'absolute';
    info.style.top = '30px';
    info.style.width = '100%';
    info.style.textAlign = 'center';
    info.style.color = '#E8C346';
    info.style.fontWeight = 'bold';
    info.style.backgroundColor = 'transparent';
    info.style.zIndex = '1';
    info.style.fontFamily = 'Monospace';
    info.innerHTML = "[ MY ISLAND ] < Press 'd': day | 'n': night | 'm' : music (Esc : stop) >";
    document.body.appendChild(info);

    ////////
    //Stat//
    ////////
    // Đo tốc độ khung hình
    stats = new Stats();
    stats.domElement.style.position = 'absolute';
    stats.domElement.style.top = '20px';
    stats.domElement.style.left = '20px';
    document.body.appendChild(stats.domElement);

    ////////////
    //CONTROLS//
    ////////////
    // Thêm các điều khiển vào scene
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.1;
    controls.zoomSpeed = 2.0;
    controls.panSpeed = 0.5;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = 0.1;
    controls.maxDistance = boxSize / 2;
    controls.keys = [16, 17, 18]; // [ rotateKey, zoomKey, panKey ]

    /////////
    //panel//
    /////////

    var gui = new dat.GUI({
        height: 5 * 32 - 1
    });

    var params = {
        TreeNumber: treeNumber,
        Smooth: smoothinFactor,
        Height: boundaryHeight,
        BasicMaterial: false,
        Wireframe: false
    };

    // Add button
    var button = {
        Regenerate: function () {
            generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
        }
    };
    gui.add(button, 'Regenerate');

    gui.add(params, 'TreeNumber').min(0).max(300).step(1).onFinishChange(function () {
        treeNumber = params.TreeNumber;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });

    gui.add(params, 'Wireframe').onFinishChange(function () {

        if (params.Wireframe == true) {
            waterPlane.material.wireframe = true;
            mountain.material.wireframe = true;
            for (var i = 0; i < tree.length; i++) {
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({
                        color: 0x3d2817,
                        wireframe: params.Wireframe
                    }), // brown
                    new THREE.MeshBasicMaterial({
                        color: 0x2d4c1e,
                        wireframe: params.Wireframe
                    }), // green
                ]);;
            }

        } else {
            waterPlane.material.wireframe = false;
            mountain.material.wireframe = false;
            for (var i = 0; i < tree.length; i++) {
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({
                        color: 0x3d2817,
                        wireframe: params.Wireframe
                    }), // brown
                    new THREE.MeshLambertMaterial({
                        color: 0x2d4c1e,
                        wireframe: params.Wireframe
                    }), // green
                ]);;
            }
        }
    });

    gui.add(params, 'BasicMaterial').onFinishChange(function () {

        if (params.BasicMaterial == true) {
            waterPlane.material = new THREE.MeshBasicMaterial({
                color: 0x2B65EC,
                wireframe: params.Wireframe
            });
            mountain.material = new THREE.MeshBasicMaterial({
                color: 0x00ff00,
                wireframe: params.Wireframe,
                side: THREE.DoubleSide
            });
            waterPlane.receiveShadow = false;
            mountain.receiveShadow = false;
            mountain.castShadow = false;

            for (var i = 0; i < tree.length; i++) {
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshBasicMaterial({
                        color: 0x3d2817,
                        wireframe: params.Wireframe
                    }), // brown
                    new THREE.MeshBasicMaterial({
                        color: 0x2d4c1e,
                        wireframe: params.Wireframe
                    }), // green
                ]);;
            }
        } else {

            var texture = THREE.ImageUtils.loadTexture("img/water.jpg");
            texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(5, 5);
            waterPlane.material = new THREE.MeshLambertMaterial({
                color: 0x2B65EC,
                wireframe: params.Wireframe,
                map: texture
            });

            var grassTex = THREE.ImageUtils.loadTexture('img/grass.jpg');
            grassTex.wrapS = THREE.RepeatWrapping;
            grassTex.wrapT = THREE.RepeatWrapping;
            grassTex.repeat.x = 10;
            grassTex.repeat.y = 10;
            mountain.material = new THREE.MeshLambertMaterial({
                color: 0x67B459,
                wireframe: params.Wireframe,
                side: THREE.DoubleSide,
                map: grassTex
            });
            waterPlane.receiveShadow = true;
            mountain.receiveShadow = true;
            //mountain.castShadow = true;

            for (var i = 0; i < tree.length; i++) {
                tree[i].material = new THREE.MeshFaceMaterial([
                    new THREE.MeshLambertMaterial({
                        color: 0x3d2817,
                        wireframe: params.Wireframe
                    }), // brown
                    new THREE.MeshLambertMaterial({
                        color: 0x2d4c1e,
                        wireframe: params.Wireframe
                    }), // green
                ]);;
            }
        }
    });

    gui.add(params, 'Height').min(0).max(300).step(1).onFinishChange(function () {
        boundaryHeight = params.Height;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });

    gui.add(params, 'Smooth').min(0).max(1000).step(1).onFinishChange(function () {
        smoothinFactor = params.Smooth;
        generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber);
    });

    // Tuyết rơi
    var body = [];
    function rain() {
        var geometrySheep = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        var materialSheep = new THREE.MeshBasicMaterial({
            color: 0xF8F9FA//0xffffff
        });
        
        for (var i = 0; i < 500; i++) {
            body[i] = new THREE.Mesh(geometrySheep, materialSheep);
            var randomPosition = Math.ceil(Math.random() * (worldWidth - 1) * (worldWidth - 1));
            body[i].position.x = mountain.geometry.vertices[randomPosition].x + 60;
            body[i].position.y = mountain.geometry.vertices[randomPosition].y + 500;
            body[i].position.z = mountain.geometry.vertices[randomPosition].z;
            body[i].scale.set(0.5, 0.5, 0.5);
            scene.add(body[i]);
        }
    }
    rain();

    
    // Đá
    // đá
    function rock(){
        var geometryRock = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        var geometryRock1 = new THREE.SphereGeometry(3, 50, 50, 0, Math.PI * 2, 0, Math.PI * 2);
        var materialRock = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("img/rock.jpg")});
        var materialRock1 = new THREE.MeshBasicMaterial({map: THREE.ImageUtils.loadTexture("img/rock1.jpg")});
        var rock = new THREE.Mesh(geometryRock, materialRock);
        var rock1 = new THREE.Mesh(geometryRock1, materialRock1);
        rock.position.y += 20;
        rock.scale.set(30,20,20);
        rock.rotation.x += 0.8;
        rock.castShadow = true;
        rock.receiveShadow = true;
        scene.add(rock);

        rock1.position.x = mountain.geometry.vertices[500].x;
        rock1.position.y = mountain.geometry.vertices[500].y;
        rock1.position.z = mountain.geometry.vertices[500].z;
        rock1.scale.set(5,5,5);
        rock1.rotation.x += 0.8; 
        rock1.castShadow = true;
        rock1.receiveShadow = true;
        scene.add(rock1);
    }
    rock();
    ///////////
    //animate//
    ///////////
    var waveCounter = 0;
    var render = function () {

        requestAnimationFrame(render);

        renderer.render(scene, camera);
        controls.update(); //cho cameras

        stats.update(); // Biểu đồ FPS

        wave(worldWidth, worldDepth, waveCounter);
        waveCounter += 0.1;
        
        for (var i = 0; i < 500; i++){
            var tmp = Math.floor(Math.random() * i);
            body[tmp].position.y -= 5;
            if (body[tmp].position.y < 0)
                {
                    body[tmp].position.y += 500;
                }
        }
    };

    // tạo ngựa
    function addHorse(geometry, materials) {
        var material = new THREE.MeshFaceMaterial(materials);
        model = new THREE.Mesh(geometry, material);
        var randomPosition = Math.ceil(Math.random() * (worldWidth - 1) * (worldWidth - 1));
        model.position.x = mountain.geometry.vertices[randomPosition].x;
        model.position.y = mountain.geometry.vertices[randomPosition].y - 1;
        model.position.z = mountain.geometry.vertices[randomPosition].z;
        model.scale.set(0.1, 0.1, 0.1);
        model.castShadow = true;
        model.receiveShadow = true;
        scene.add(model);
    }
    // Tạo cò
    function addStork(geometry, materials) {
        var material = new THREE.MeshFaceMaterial(materials);
        model = new THREE.Mesh(geometry, material);
        var randomPosition = Math.ceil(Math.random() * (worldWidth - 1) * (worldWidth - 1));
        model.position.x = mountain.geometry.vertices[randomPosition].x + 20;
        model.position.y = mountain.geometry.vertices[randomPosition].y + 100;
        model.position.z = mountain.geometry.vertices[randomPosition].z;
        model.scale.set(0.1, 0.1, 0.1);
        model.castShadow = true;
        model.receiveShadow = true;
        scene.add(model);
    }
    
    loader = new THREE.JSONLoader();
    for (var i = 0; i < 10; i++){
    loader.load('./model/horse.js', addHorse);
    }
    for (var i = 0; i < 15; i++){
    loader.load('./model/stork.js', addStork);
    }
    
    render();
    /////////////////////
    // Background music//
    /////////////////////
    // Thêm nhạc nền vào khung cảnh
    audio = document.createElement('audio');
    var source = document.createElement('source');
    source.src = 'music/background.mp3';
    audio.appendChild(source);
    audio.loop = true; // Lặp lại
    //audio.play();

    //Handle
    document.addEventListener('keydown', onPlayMusic, false); // Bật nhạc nền
    document.addEventListener('keydown', onDayNight, false); // Bắt sự kiện Day, Night. 'd' : Day, 'n' : Night
    window.addEventListener('resize', onWindowResize, false); // Khớp kích thước khung hình khi thay đổi kích thước.

});

// Tạo cây
function buildTree() {
    var treeMaterial = new THREE.MeshFaceMaterial([
    new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture("img/wood.jpg")
        }), // thân cây
    new THREE.MeshLambertMaterial({
            map: THREE.ImageUtils.loadTexture("img/leaf.jpg")
        }), // lá cây
  ]);

    // Tạo tán cây
    var c0 = new THREE.Mesh(new THREE.CylinderGeometry(2, 4, 12, 6, 1, true));
    c0.position.y = 6;
    var c1 = new THREE.Mesh(new THREE.CylinderGeometry(0, 10, 14, 8));
    c1.position.y = 18;
    var c2 = new THREE.Mesh(new THREE.CylinderGeometry(0, 9, 13, 8));
    c2.position.y = 25;
    var c3 = new THREE.Mesh(new THREE.CylinderGeometry(0, 8, 12, 8));
    c3.position.y = 32;

    var g = new THREE.Geometry();
    c0.updateMatrix();
    c1.updateMatrix();
    c2.updateMatrix();
    c3.updateMatrix();
    g.merge(c0.geometry, c0.matrix);
    g.merge(c1.geometry, c1.matrix);
    g.merge(c2.geometry, c2.matrix);
    g.merge(c3.geometry, c3.matrix);

    var b = c0.geometry.faces.length;
    for (var i = 0, l = g.faces.length; i < l; i++) {
        g.faces[i].materialIndex = i < b ? 0 : 1;
    }

    var m = new THREE.Mesh(g, treeMaterial);

    m.scale.x = m.scale.z = 3;
    m.scale.y = 5;

    // Tạo bóng cho cây
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
}

// Tạo độ cao cho núi
function generateHeight(worldWidth, smoothinFactor, boundaryHeight, treeNumber) {
    var terrainGeneration = new TerrainBuilder(worldWidth, worldWidth, worldWidth, smoothinFactor, boundaryHeight);
    var terrain = terrainGeneration.diamondSquare();

    mountain.geometry.verticesNeedUpdate = true;
    mountain.geometry.normalsNeedUpdate = true;

    var index = 0;
    for (var i = 0; i < worldWidth; i++) {
        for (var j = 0; j < worldWidth; j++) {
            mountain.geometry.vertices[index].y = terrain[i][j];
            index++;
        }
    }

    //build tree
    if (tree != null) {
        for (var i = 0; i < tree.length; i++) {
            scene.remove(tree[i]);
        }
    }

    for (var i = 0; i < treeNumber; i++) {
        tree[i] = buildTree();
        var randomPosition = Math.ceil(Math.random() * (worldWidth - 1) * (worldWidth - 1));
        tree[i].position.x = mountain.geometry.vertices[randomPosition].x;
        tree[i].position.y = mountain.geometry.vertices[randomPosition].y;
        tree[i].position.z = mountain.geometry.vertices[randomPosition].z;
        tree[i].scale.set(0.5, 0.5, 0.5)
        scene.add(tree[i])
    }
    // Tạo cây lớn
    var bigTree = buildTree();
    bigTree.position.y += 10;
    bigTree.position.x -= 200;
    bigTree.scale.set(2, 4, 2);
    scene.add(bigTree);
}

// Hàm tạo sóng trên mặt biển
function wave(worldWidth, worldDepth, count) {

    waterPlane.updateMatrix();
    var waveHeight = 30;

    waterPlane.geometry.verticesNeedUpdate = true;
    waterPlane.geometry.normalsNeedUpdate = true;

    for (var i = 0; i < worldWidth; i++) {

        for (var j = 0; j < worldDepth; j++) {
            waterPlane.geometry.vertices[i * worldWidth + j].y = (Math.sin((i + count) * 0.5) * waveHeight) + (Math.sin((j + count) * 0.5) * waveHeight);
        }

    }
}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Get key to handle
function onPlayMusic() {
    if (event.keyCode == 77) // m : music
    {
        audio.play();
    } else if (event.keyCode == 27) // esc : turn off music
    {
        audio.pause();
        audio.currentTime = 0;
    }
}

function onDayNight() {
    if (event.keyCode == 68) // d : DAY
    {
        // Remove old sky
        scene.remove(skyBox);
        // Add new sky (night)
        skyGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        materialArray = [
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/right.jpg'),
                side: THREE.BackSide
            }), // right
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/left.jpg'),
                side: THREE.BackSide
            }), // left
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/top.jpg'),
                side: THREE.BackSide
            }), // top
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/bottom.jpg'),
                side: THREE.BackSide
            }), // bottom
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/back.jpg'),
                side: THREE.BackSide
            }), // back
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/front.jpg'),
                side: THREE.BackSide
            }) // front
                ];

        skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(skyBox);
        directionalLight.color.setHex(0xffffff);
        info.innerHTML = "[ MY ISLAND ] - Day - (Press 'd': day | 'n': night | 'm' : music (Esc : stop))";
    } else if (event.keyCode == 78) // n : NIGHT
    {
        // Remove old sky
        scene.remove(skyBox);
        // Add new sky (night)
        skyGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);

        materialArray = [
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/right - Copy.jpg'),
                side: THREE.BackSide
            }), // right
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/left - Copy.jpg'),
                side: THREE.BackSide
            }), // left
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/top - Copy.jpg'),
                side: THREE.BackSide
            }), // top
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/bottom - Copy.jpg'),
                side: THREE.BackSide
            }), // bottom
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/back - Copy.jpg'),
                side: THREE.BackSide
            }), // back
                    new THREE.MeshBasicMaterial({
                map: THREE.ImageUtils.loadTexture('img/skyTexture/front - Copy.jpg'),
                side: THREE.BackSide
            }) // front
                ];

        skyMaterial = new THREE.MeshFaceMaterial(materialArray);

        var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);
        scene.add(skyBox);
        directionalLight.color.setHex(0x222325);
        info.innerHTML = "[ MY ISLAND ] - Night - (Press 'd': day | 'n': night | 'm' : music (Esc : stop))";
    }
}