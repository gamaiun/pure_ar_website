import * as THREE from "three";
import * as Cesium from "cesium";

// Set Cesium Ion access token (optional; replace with your token or remove if not needed)
Cesium.Ion.defaultAccessToken = "your-cesium-ion-token-here";

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006;
const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326;
const scale = parseFloat(urlParams.get("scale")) || 0.5;
const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq";

// Set up Three.js
const threeScene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  10000 // Increased far plane for real-world distances
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

// Create a simple cube
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cube = new THREE.Mesh(geometry, material);
cube.scale.set(scale, scale, scale);
threeScene.add(cube);

// Cesium setup: Fixed world position of the cube
const targetPosition = Cesium.Cartesian3.fromDegrees(gpsLon, gpsLat, 0); // Cube’s fixed geo-location

// Device state
let devicePosition = null; // Cesium Cartesian3
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };

// Update device position with geolocation
navigator.geolocation.watchPosition(
  (position) => {
    devicePosition = Cesium.Cartesian3.fromDegrees(
      position.coords.longitude,
      position.coords.latitude,
      0
    );

    // Update cube position relative to device
    updateCubePosition();
  },
  (error) => {
    console.error("Geolocation error:", error);
  },
  { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
);

// Set up camera feed
const video = document.createElement("video");
video.style.position = "absolute";
video.style.top = "0";
video.style.left = "0";
video.style.width = "100%";
video.style.height = "100%";
video.style.objectFit = "cover";
video.autoplay = true;
document.getElementById("arContainer").prepend(video);

navigator.mediaDevices
  .getUserMedia({ video: { facingMode: "environment" } })
  .then((stream) => {
    video.srcObject = stream;
  })
  .catch((error) => {
    console.error("Error accessing camera:", error);
  });

// Device orientation for AR view
window.addEventListener("deviceorientation", (event) => {
  if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
    deviceOrientation = {
      alpha: event.alpha || 0, // Compass heading (yaw)
      beta: event.beta || 0, // Pitch
      gamma: event.gamma || 0, // Roll
    };
    updateCameraOrientation();
  }
});

// Request device orientation permission (iOS 13+)
if (typeof DeviceOrientationEvent.requestPermission === "function") {
  DeviceOrientationEvent.requestPermission()
    .then((permissionState) => {
      if (permissionState === "granted") {
        console.log("Device orientation permission granted");
      } else {
        console.error("Device orientation permission denied");
      }
    })
    .catch((error) => {
      console.error("Error requesting orientation permission:", error);
    });
}

// Function to update cube position relative to device
function updateCubePosition() {
  if (!devicePosition) return;

  // Local East-North-Up (ENU) frame at device position
  const transform = Cesium.Transforms.eastNorthUpToFixedFrame(devicePosition);
  const inverseTransform = Cesium.Matrix4.inverse(
    transform,
    new Cesium.Matrix4()
  );

  // Cube’s position in local ENU coordinates
  const relativePosition = Cesium.Matrix4.multiplyByPoint(
    inverseTransform,
    targetPosition,
    new Cesium.Cartesian3()
  );

  // Set cube position in Three.js (x = east, y = up, z = north)
  cube.position.set(
    relativePosition.x,
    relativePosition.y,
    -relativePosition.z
  );
}

// Function to update camera orientation
function updateCameraOrientation() {
  const alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha); // Yaw
  const beta = THREE.MathUtils.degToRad(deviceOrientation.beta); // Pitch
  const gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma); // Roll

  // Create quaternion from device orientation (ENU to Three.js coordinates)
  const quaternion = new THREE.Quaternion();
  quaternion.setFromEuler(new THREE.Euler(beta, gamma, -alpha, "YXZ"));

  // Apply to camera (device at origin)
  threeCamera.quaternion.copy(quaternion);
  threeCamera.position.set(0, 0, 0); // Camera at device location
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  threeRenderer.render(threeScene, threeCamera);
}

window.addEventListener("resize", () => {
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
});

animate();
