function getQueryParams() {
  console.log("Parsing query params");
  const params = new URLSearchParams(window.location.search);
  return {
    gpsLat: parseFloat(params.get("gpsLat")),
    gpsLon: parseFloat(params.get("gpsLon")),
    scale: parseFloat(params.get("scale")) || 0.5,
    objectId: params.get("objectId") || "default",
    firebaseId: params.get("firebaseId"),
  };
}

window.onload = () => {
  console.log("Script started");

  // Get query parameters
  const { gpsLat, gpsLon, scale, objectId, firebaseId } = getQueryParams();
  if (!gpsLat || !gpsLon) {
    console.error("Missing gpsLat or gpsLon.");
    document.getElementById("loading").textContent = "Error: Missing GPS.";
    return;
  }

  console.log(
    `Target: Lat ${gpsLat}, Lon ${gpsLon}, Scale ${scale}, ObjectId ${objectId}, FirebaseId ${firebaseId}`
  );

  // Setup video feed for AR background
  const video = document.getElementById("video");
  navigator.mediaDevices
    .getUserMedia({ video: { facingMode: "environment" } })
    .then((stream) => {
      video.srcObject = stream;
      video.play();
    })
    .catch((err) => {
      console.error("Error accessing camera:", err);
      document.getElementById("loading").textContent =
        "Error accessing camera.";
    });

  // Setup Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Create a video texture for the background
  const videoTexture = new THREE.VideoTexture(video);
  videoTexture.minFilter = THREE.LinearFilter;
  const backgroundMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    new THREE.MeshBasicMaterial({ map: videoTexture })
  );
  backgroundMesh.material.depthTest = false;
  backgroundMesh.material.depthWrite = false;
  scene.add(backgroundMesh);

  // Load the 3D model
  const modelMap = {
    "Marker 1":
      "https://firebasestorage.googleapis.com/v0/b/ieye-453408.firebasestorage.app/o/ARObject1.glb?alt=media&token=3e5c3d8a-f4ff-4015-aebe-de9944ff8e65",
    "Marker 2":
      "https://firebasestorage.googleapis.com/v0/b/ieye-453408.firebasestorage.app/o/ARObject1.glb?alt=media&token=3e5c3d8a-f4ff-4015-aebe-de9944ff8e65",
    "Marker 3":
      "https://firebasestorage.googleapis.com/v0/b/ieye-453408.firebasestorage.app/o/ARObject1.glb?alt=media&token=3e5c3d8a-f4ff-4015-aebe-de9944ff8e65",
    default:
      "https://firebasestorage.googleapis.com/v0/b/ieye-453408.firebasestorage.app/o/ARObject1.glb?alt=media&token=3e5c3d8a-f4ff-4015-aebe-de9944ff8e65",
  };
  const modelUrl = modelMap[objectId] || modelMap["default"];
  const loader = new THREE.GLTFLoader();
  let model;
  loader.load(
    modelUrl,
    (gltf) => {
      model = gltf.scene;
      model.scale.set(scale, scale, scale);
      // Anchor the model at the target GPS coordinates (0, 0, 0) in scene
      model.position.set(0, 0.5, 0); // Initial position (will be adjusted by camera)
      scene.add(model);
      console.log("Model loaded");
    },
    undefined,
    (error) => {
      console.error("Model failed to load:", error);
      document.getElementById("loading").textContent = "Error loading model.";
    }
  );

  // Handle device orientation for AR-like experience
  let alpha = 0,
    beta = 0,
    gamma = 0;
  window.addEventListener("deviceorientation", (event) => {
    alpha = event.alpha ? THREE.MathUtils.degToRad(event.alpha) : 0; // Z rotation (compass)
    beta = event.beta ? THREE.MathUtils.degToRad(event.beta) : 0; // X rotation (tilt front-back)
    gamma = event.gamma ? THREE.MathUtils.degToRad(event.gamma) : 0; // Y rotation (tilt left-right)
  });

  // Geo-anchoring with CesiumJS
  let initialPositionSet = false;
  let initialUserLat, initialUserLon;

  navigator.geolocation.watchPosition(
    (position) => {
      const userLat = parseFloat(position.coords.latitude.toFixed(14));
      const userLon = parseFloat(position.coords.longitude.toFixed(14));
      console.log(`User Position: Lat ${userLat}, Lon ${userLon}`);

      if (!initialPositionSet) {
        initialUserLat = userLat;
        initialUserLon = userLon;
        initialPositionSet = true;
        document.getElementById("loading").style.display = "none";
      }

      // Convert GPS coordinates to Cartesian using Cesium
      const ellipsoid = Cesium.Ellipsoid.WGS84;
      const cartographicUser = Cesium.Cartographic.fromDegrees(
        userLon,
        userLat,
        0
      );
      const cartographicTarget = Cesium.Cartographic.fromDegrees(
        gpsLon,
        gpsLat,
        0
      );
      const surfaceUser = ellipsoid.cartographicToCartesian(cartographicUser);
      const surfaceTarget =
        ellipsoid.cartographicToCartesian(cartographicTarget);

      // Calculate the offset for camera positioning
      const userOffset = Cesium.Cartesian3.subtract(
        surfaceUser,
        surfaceTarget,
        new Cesium.Cartesian3()
      );
      const camX = -userOffset.x / 1000; // Convert meters to kilometers for Three.js scale
      const camZ = userOffset.z / 1000; // Invert for Three.js coordinate system
      camera.position.set(camX, 1.6, camZ);

      // Apply device orientation to camera rotation
      camera.rotation.order = "YXZ";
      camera.rotation.set(beta, gamma, -alpha);

      console.log(
        `Camera Position: x=${camX.toFixed(2)}km, z=${camZ.toFixed(2)}km`
      );
    },
    (error) => {
      console.error("GPS Error:", error.message);
      document.getElementById("loading").textContent =
        "GPS Error: " + error.message;
    },
    { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
  );

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    if (model) model.rotation.y += 0.01; // Optional: Rotate model for visibility
    renderer.render(scene, camera);
  }
  animate();

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
};
