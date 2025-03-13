import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006;
const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326;
const scale = parseFloat(urlParams.get("scale")) || 0.5;
const objectId = urlParams.get("objectId") || "default";
const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq";

// Set up Three.js for rendering the AR view
const threeScene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const threeRenderer = new THREE.WebGLRenderer({ alpha: true });
threeRenderer.setSize(window.innerWidth, window.innerHeight);
threeRenderer.domElement.style.position = "absolute";
threeRenderer.domElement.style.top = "0px";
document.getElementById("arContainer").appendChild(threeRenderer.domElement);

// Add basic lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
threeScene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
threeScene.add(directionalLight);

// Simple GPS to world-space conversion (approximation)
// We'll place the model relative to the camera based on GPS difference
const latToMeters = (lat) => lat * 111320; // Rough conversion: 1 degree latitude = 111,320 meters
const lonToMeters = (lon, lat) =>
  lon * 111320 * Math.cos((lat * Math.PI) / 180); // Adjust for longitude

// Load the 3D model using GLTFLoader
const loader = new GLTFLoader();
loader.load(
  `/Assets/${objectId}.glb`,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(scale, scale, scale);

    // Position the model based on GPS coordinates (relative to camera)
    const modelLat = gpsLat;
    const modelLon = gpsLon;
    let deviceLat, deviceLon;

    navigator.geolocation.getCurrentPosition((position) => {
      deviceLat = position.coords.latitude;
      deviceLon = position.coords.longitude;

      const deltaLat = latToMeters(modelLat - deviceLat);
      const deltaLon = lonToMeters(modelLon - deviceLon, deviceLat);
      model.position.set(deltaLon, 0, -deltaLat); // Place model in world space
    });

    threeScene.add(model);
  },
  (xhr) => {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  (error) => {
    console.error("Error loading GLTF model:", error);
  }
);

// Device orientation for AR view
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
window.addEventListener("deviceorientation", (event) => {
  deviceOrientation.alpha = event.alpha || 0;
  deviceOrientation.beta = event.beta || 0;
  deviceOrientation.gamma = event.gamma || 0;
});

// Request device orientation permission (iOS 13+)
if (typeof DeviceOrientationEvent.requestPermission === "function") {
  DeviceOrientationEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        console.log("Device orientation permission granted");
      }
    })
    .catch((error) => {
      console.error("Error requesting device orientation permission:", error);
    });
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (deviceOrientation) {
    const alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha);
    const beta = THREE.MathUtils.degToRad(deviceOrientation.beta);
    const gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma);

    threeCamera.rotation.set(beta, gamma, -alpha, "YXZ");
  }

  threeRenderer.render(threeScene, threeCamera);
}

// Handle window resizing
window.addEventListener("resize", () => {
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
});

animate();
