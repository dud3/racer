function roadBuilder(config = {
  containerId: 'container',
  initCamera: 'topdown',
  visible: {
    cars: true,
    grid: true
  }
}) {
  // Container

  const root = this

  var container = document.getElementById(config.containerId);

  this.initCamera = config.initCamera || 'topdown'

  // Scene

  var scene = new THREE.Scene();

  // ...

  let FOV
  let FAR
  let NEAR = 400

  // Mobile camera
  if (container.clientWidth <= 768) {
    FOV = 50
    FAR = 1200
    // 769px - 1080px screen width camera
  } else if (container.clientWidth >= 769 && container.clientWidth <= 1080) {
    FOV = 50
    FAR = 1475
    // > 1080px screen width res camera
  } else {
    FOV = 40
    FAR = 1800
  }

  console.log(FOV, NEAR, FAR, container.clientWidth/container.clientHeight)

  // Top-down camera

  var camera = new THREE.PerspectiveCamera(FOV, container.clientWidth  / container.clientHeight, 35, 38);

  // 500 -> 20
  // 25 - 1
  camera.position.set(0, 36, 0);

  // Chase camera

  var chaseCamera = new THREE.PerspectiveCamera(FOV, container.clientWidth/container.clientHeight, 3, 6);

  //  65, container.clientWidth   / container.clientHeight, 0.01, 200
  // chaseCamera.aspect = container.innerWidth/container.innerHeight;
  // chaseCamera.updateProjectionMatrix();

  var currentCamera = camera;

  // Renderer

  let pixelRatio = window.devicePixelRatio
  let AA = true
  if (pixelRatio > 1) {
    AA = false
  }

  var renderer = new THREE.WebGLRenderer( { antialias: AA, powerPreference: "high-performance" } );
  renderer.setSize( container.clientWidth , container.clientHeight );
  renderer.setClearColor(0x4576BA, 0.4);

  // renderer.setSize(container.offsetWidth, container.offsetHeight);

  container.appendChild( renderer.domElement );

  var labelRenderer = new THREE.CSS2DRenderer();
  labelRenderer.setSize(container.clientWidth, container.clientHeight);
  labelRenderer.domElement.style.position = 'absolute';
  labelRenderer.domElement.style.top = container.getBoundingClientRect().top + 'px';
  labelRenderer.domElement.style.left = container.getBoundingClientRect().left + 'px';
  labelRenderer.domElement.id = 'label-renderer-' + config.containerId;
  document.body.appendChild(labelRenderer.domElement);

  // Controlls

  var controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableZoom = true;
  controls.enableRotate = false;
  controls.enablePan = false;

  var clock = new THREE.Clock();
  var light = new THREE.AmbientLight(0xffffff);

  // Lights

  scene.add(light);

  directionalLight = new THREE.DirectionalLight(0xffffff, 100);
  directionalLight.position.set(0,200,0);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  light4 = new THREE.PointLight(0xffffff, 80);
  scene.add(light4);

  // Objects

  // Grid

  var gridHelper = new THREE.GridHelper(30, 30, 0x6C329F, 0x6C329F);
  gridHelper.visible = config.visible.grid;
  scene.add(gridHelper);

  // Road

  const loader = new THREE.OBJLoader();
  var curvePoints =  [
    0, 0, 10,
    10, 0, 10,
    14, 0, 2,
    10, 0, -4,
    2, 0,  8,
    -7, 0, -5,
    -8, 0, -9,
    -14, 0, -7,
    -13, 0, -2,
    -14, 0,  3,
    -11, 0, 10,
    0, 0, 10
  ];
  var lengthSegments = 600;
  var trackDistances = [ -0.6, -0.5, 0, 0.02, 0.5, 0.52, 1.02, 1.04, 1.54, 1.64 ];

  var gRoad = new THREE.BufferGeometry();
  gRoad.createRoad = THREEg.createRoad;
  gRoad.createRoad( curvePoints, lengthSegments, trackDistances );
  // gRoad.createRoad( ); // all parameters default

  tex = new THREE.TextureLoader().load('./animation/stride.png');
  tex.wrapS = THREE.RepeatWrapping;
  tex.repeat.set(lengthSegments * 2);

  var material = [
      new THREE.MeshBasicMaterial( { color: 0x385b8d, side: THREE.DoubleSide, wireframe: false } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: false } ),
      // new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: false } ),
      // // new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
      // new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide } ),
      // // new THREE.MeshBasicMaterial( { map: tex, side: THREE.DoubleSide } ),
      new THREE.MeshBasicMaterial( { color: 0x000000, side: THREE.DoubleSide, wireframe: false } ),
      new THREE.MeshBasicMaterial( { color: 0x385b8d, side: THREE.DoubleSide, wireframe: false } ),
  ];

  var mesh = new THREE.Mesh(gRoad, material);
  scene.add(mesh);

  // ---

  var h = 0.08;

  var gTngt = new THREE.BufferGeometry( ); // tangent
  gTngt.positions = new Float32Array( 6 );
  gTngt.addAttribute( 'position', new THREE.BufferAttribute( gTngt.positions, 3 ).setDynamic( true ) );
  lineTngt = new THREE.Line( gTngt, new THREE.LineBasicMaterial( { color: 0x00ffff, side: THREE.DoubleSide } ) );
  scene.add( lineTngt );

  var gNorm = new THREE.BufferGeometry( ); // normal
  gNorm.positions = new Float32Array( 6 );
  gNorm.addAttribute( 'position', new THREE.BufferAttribute( gNorm.positions, 3 ).setDynamic( true ) );
  lineNorm = new THREE.Line( gNorm, new THREE.LineBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide } ) );
  scene.add( lineNorm );

  var gBino = new THREE.BufferGeometry( ); // binormal
  gBino.positions = new Float32Array( 6 );
  gBino.addAttribute( 'position', new THREE.BufferAttribute( gBino.positions, 3 ).setDynamic( true ) );
  lineBino = new THREE.Line( gBino, new THREE.LineBasicMaterial( { color: 0x0000ff, side: THREE.DoubleSide } ) );
  scene.add( lineBino );

  // Cars

  function car (id = 0, distance = 0) {
    this.id = id;
    this.distance = distance;
    this.mesh = null;
    this.follower = {};
    this.activeCamera = false;
    this.increment = 1;
    this.trackid = Math.floor(Math.random() * trackDistances.length);
  }

  function carsManager () {
    this.cars = [];
  }
  carsManager.prototype.add = function(id = 0, distance = 0) {
    const e = new car(id, distance);

     e.follower = new THREE.Mesh(
      new THREE.BoxBufferGeometry( 0.1, h * 0.2 , 0.1 ),
      new THREE.MeshBasicMaterial( { color: 0xff0000, side: THREE.DoubleSide, wireframe: true } )
    );
    // e.follower.visible = false;
    scene.add(e.follower);

    const gltdLoader = new THREE.GLTFLoader().setPath('./animation/vehicle/');

    gltdLoader.load('/scene.gltf', function(gltf) {
      let car = gltf.scene
      car.scale.set(0.0005, 0.0005, 0.0005);
      car.cid = id;

      car.traverse((node) => {
        if (!node.isMesh) return;
        // node.material.wireframe = true;
        // console.log(e.id, node.name)
        if (node.name == "Cube001_Material001_0") {
          // node.material.wireframe = true;
          node.material.color.r = Math.floor(Math.random() * 32);
          node.material.color.g = Math.floor(Math.random() * 32);
          node.material.color.b = Math.floor(Math.random() * 32);
        }
      });

      const moonDiv = document.createElement('div');
        moonDiv.className = 'label';
        moonDiv.textContent = e.id;
        // moonDiv.style.marginTop = '-1em';
        const moonLabel = new THREE.CSS2DObject(moonDiv);
        moonLabel.position.set(0, 0, 0);
        car.add(moonLabel);

      e.mesh = car;
      e.mesh.visible = config.visible.cars;
      scene.add(car);
    });

    this.cars.push(e);
  }
  carsManager.prototype.remove = function(id) {
    for (var i = 0; i < this.cars.length; i++) {
      if (this.cars[i].id == id) {
        scene.remove(this.cars[i].mesh);
        scene.remove(this.cars[i].follower);
        this.cars.splice(i, 1)
      }
    }
  }

  var theCarsManager = new carsManager();

  var sysIdx = 8;

  var t1 = 0;
  var t2;

  //............................

  function resizeRendererToDisplaySize(renderer) {
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
      renderer.setSize(width, height, false);
    }
    return needResize;
  }

  function animate() {
      t2 = clock.getElapsedTime();
      requestAnimationFrame(animate);

      if (resizeRendererToDisplaySize(renderer)) {
        const canvas = renderer.domElement;
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
      }

      if (root.initCamera == 'chase') { currentCamera = chaseCamera; }

      renderer.render(scene, currentCamera);
      labelRenderer.render(scene, currentCamera);

      if (t2 - t1 > 0.02) {

          // other: take tangent, binormal for calculation

          theCarsManager.cars.map(car => {
            if (car.mesh) {
              let rindex = car.distance % gRoad.points.length;

              let x = gRoad.points[ rindex ].x + gRoad.n[ rindex ].x * trackDistances[car.trackid] * 0.6;
              let y = gRoad.points[ rindex ].y + h;
              let z = gRoad.points[ rindex ].z + gRoad.n[ rindex ].z * trackDistances[car.trackid] * 0.6;

              car.follower.position.set(x, y, z);
              car.follower.rotation.y = 1.57 + Math.atan2( -gRoad.t[ rindex ].z, gRoad.t[ rindex ].x );

              car.mesh.position.set( x, y, z );
              car.mesh.rotation.y = 1.57 + Math.atan2( -gRoad.t[ rindex ].z, gRoad.t[ rindex ].x );

              car.distance += car.increment;
            }
          });

          gTngt.positions[0] = gRoad.points[ sysIdx ].x;  // tangent
          gTngt.positions[1] = gRoad.points[ sysIdx ].y;
          gTngt.positions[2] = gRoad.points[ sysIdx ].z;

          gTngt.positions[3] = gRoad.points[ sysIdx ].x + gRoad.t[ sysIdx ].x;
          gTngt.positions[4] = gRoad.points[ sysIdx ].y + gRoad.t[ sysIdx ].y;
          gTngt.positions[5] = gRoad.points[ sysIdx ].z + gRoad.t[ sysIdx ].z;

          gTngt.attributes.position.needsUpdate = true;

          gNorm.positions[0] = gRoad.points[ sysIdx ].x; // normal
          gNorm.positions[1] = gRoad.points[ sysIdx ].y;
          gNorm.positions[2] = gRoad.points[ sysIdx ].z;

          gNorm.positions[3] = gRoad.points[ sysIdx ].x + gRoad.n[ sysIdx ].x;
          gNorm.positions[4] = gRoad.points[ sysIdx ].y + gRoad.n[ sysIdx ].y;
          gNorm.positions[5] = gRoad.points[ sysIdx ].z + gRoad.n[ sysIdx ].z;

          gNorm.attributes.position.needsUpdate = true;

          gBino.positions[0] = gRoad.points[ sysIdx ].x; // binormal
          gBino.positions[1] = gRoad.points[ sysIdx ].y;
          gBino.positions[2] = gRoad.points[ sysIdx ].z;

          gBino.positions[3] = gRoad.points[ sysIdx ].x + gRoad.b[ sysIdx ].x;
          gBino.positions[4] = gRoad.points[ sysIdx ].y + gRoad.b[ sysIdx ].y;
          gBino.positions[ 5 ] = gRoad.points[ sysIdx ].z + gRoad.b[ sysIdx ].z;

          gBino.attributes.position.needsUpdate = true;

          sysIdx ++;
          if ( sysIdx === gRoad.points.length ) sysIdx = 0

          // Chase camera

          const activeCamera = theCarsManager.cars.find(c => c.activeCamera);

          if (activeCamera) {
            if (activeCamera.mesh) {
              var relativeCameraOffset = new THREE.Vector3(3, 3, 0); // THREE.Vector3(0, 0.2, -0.2);
              var cameraOffset = relativeCameraOffset.applyMatrix4( activeCamera.follower.matrixWorld );

              chaseCamera.position.x = relativeCameraOffset.x;
              chaseCamera.position.y = relativeCameraOffset.y;
              chaseCamera.position.z = relativeCameraOffset.z;

              chaseCamera.lookAt(activeCamera.follower.position);
            }
          }

          t1 = t2;
      }

      controls.update();
  }

  animate();

  // Global

  return {
    scene,
    camera,
    chaseCamera,
    currentCamera,
    gridHelper,
    car,
    theCarsManager
  }
};
