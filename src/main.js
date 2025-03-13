// import * as THREE from "three";

// // Parse URL parameters
// const urlParams = new URLSearchParams(window.location.search);
// const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006;
// const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326;
// const scale = parseFloat(urlParams.get("scale")) || 0.5;
// const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq";

// // Set up Three.js for rendering the AR view
// const threeScene = new THREE.Scene();
// const threeCamera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// threeCamera.position.set(0, 0, 5); // Set initial camera position
// const threeRenderer = new THREE.WebGLRenderer({ alpha: true });
// threeRenderer.setSize(window.innerWidth, window.innerHeight);
// threeRenderer.domElement.style.position = "absolute";
// threeRenderer.domElement.style.top = "0px";
// document.getElementById("arContainer").appendChild(threeRenderer.domElement);

// // Add basic lighting
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
// threeScene.add(ambientLight);
// const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
// directionalLight.position.set(0, 1, 1);
// threeScene.add(directionalLight);

// // Create a simple cube
// const geometry = new THREE.BoxGeometry(1, 1, 1);
// const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
// const cube = new THREE.Mesh(geometry, material);
// cube.scale.set(scale, scale, scale);

// // Simple GPS to world-space conversion
// const latToMeters = (lat) => lat * 111320;
// const lonToMeters = (lon, lat) =>
//   lon * 111320 * Math.cos((lat * Math.PI) / 180);

// const modelLat = gpsLat;
// const modelLon = gpsLon;
// let deviceLat, deviceLon;

// navigator.geolocation.getCurrentPosition(
//   (position) => {
//     deviceLat = position.coords.latitude;
//     deviceLon = position.coords.longitude;
//     const deltaLat = latToMeters(modelLat - deviceLat);
//     const deltaLon = lonToMeters(modelLon - deviceLon, deviceLat);
//     cube.position.set(deltaLon, 0, -deltaLat);
//   },
//   (error) => {
//     console.error("Geolocation error:", error);
//   },
//   { enableHighAccuracy: true }
// );

// threeScene.add(cube);

// // Device orientation for AR view
// let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
// window.addEventListener("deviceorientation", (event) => {
//   if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
//     deviceOrientation = {
//       alpha: event.alpha || 0,
//       beta: event.beta || 0,
//       gamma: event.gamma || 0,
//     };
//   }
// });

// // Request device orientation permission (iOS 13+)
// if (typeof DeviceOrientationEvent.requestPermission === "function") {
//   DeviceOrientationEvent.requestPermission()
//     .then((permissionState) => {
//       if (permissionState === "granted") {
//         console.log("Device orientation permission granted");
//       } else {
//         console.error("Device orientation permission denied");
//       }
//     })
//     .catch((error) => {
//       console.error("Error requesting orientation permission:", error);
//     });
// }

// // Animation loop
// function animate() {
//   requestAnimationFrame(animate);

//   if (
//     deviceOrientation.alpha ||
//     deviceOrientation.beta ||
//     deviceOrientation.gamma
//   ) {
//     const alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha);
//     const beta = THREE.MathUtils.degToRad(deviceOrientation.beta);
//     const gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma);
//     threeCamera.rotation.set(beta, gamma, -alpha, "YXZ");
//   }

//   threeRenderer.render(threeScene, threeCamera);
// }

// window.addEventListener("resize", () => {
//   threeRenderer.setSize(window.innerWidth, window.innerHeight);
//   threeCamera.aspect = window.innerWidth / window.innerHeight;
//   threeCamera.updateProjectionMatrix();
// });

// animate();
import * as THREE from "three";

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006;
const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326;
const scale = parseFloat(urlParams.get("scale")) || 0.5;
const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq";

// Set up Three.js for rendering the AR view
const threeScene = new THREE.Scene();
const threeCamera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
threeCamera.position.set(0, 0, 5); // Initial camera position
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
cube.position.set(0, 0, -5); // Place cube in front of camera initially
threeScene.add(cube);

// Simple GPS to world-space conversion
const latToMeters = (lat) => lat * 111320;
const lonToMeters = (lon, lat) =>
  lon * 111320 * Math.cos((lat * Math.PI) / 180);

const modelLat = gpsLat;
const modelLon = gpsLon;
let deviceLat, deviceLon;

// Request geolocation
navigator.geolocation.getCurrentPosition(
  (position) => {
    deviceLat = position.coords.latitude;
    deviceLon = position.coords.longitude;
    const deltaLat = latToMeters(modelLat - deviceLat);
    const deltaLon = lonToMeters(modelLon - deviceLon, deviceLat);
    cube.position.set(deltaLon, 0, -deltaLat);
    console.log("GPS position updated:", cube.position);
  },
  (error) => {
    console.error("Geolocation error:", error);
    alert("Geolocation permission denied. Using default position.");
  },
  { enableHighAccuracy: true, timeout: 10000 }
);

// Device orientation for AR view
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
let orientationPermissionGranted = false;

window.addEventListener(
  "deviceorientation",
  (event) => {
    if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
      deviceOrientation = {
        alpha: event.alpha || 0,
        beta: event.beta || 0,
        gamma: event.gamma || 0,
      };
      orientationPermissionGranted = true;
      console.log("Orientation updated:", deviceOrientation);
    }
  },
  false
);

// Request device orientation permission (iOS 13+)
function requestOrientationPermission() {
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    DeviceOrientationEvent.requestPermission()
      .then((permissionState) => {
        if (permissionState === "granted") {
          console.log("Device orientation permission granted");
          orientationPermissionGranted = true;
          // Trigger orientation event
          window.dispatchEvent(new Event("deviceorientation"));
        } else {
          console.error("Device orientation permission denied");
          alert(
            "Device orientation permission denied. Please enable motion access."
          );
        }
      })
      .catch((error) => {
        console.error("Error requesting orientation permission:", error);
        alert("Error requesting orientation: " + error.message);
      });
  } else {
    console.log(
      "Device orientation API supported, no permission prompt needed."
    );
    orientationPermissionGranted = true; // Assume granted on non-iOS or older devices
  }
}

// Trigger permission request on user interaction (e.g., page load or click)
document.addEventListener(
  "click",
  () => {
    if (!orientationPermissionGranted) {
      requestOrientationPermission();
    }
  },
  { once: true }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (
    orientationPermissionGranted &&
    (deviceOrientation.alpha ||
      deviceOrientation.beta ||
      deviceOrientation.gamma)
  ) {
    const alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha);
    const beta = THREE.MathUtils.degToRad(deviceOrientation.beta);
    const gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma);
    threeCamera.rotation.set(beta, gamma, -alpha, "YXZ");
    console.log("Camera rotated:", { alpha, beta, gamma });
  }

  threeRenderer.render(threeScene, threeCamera);
}

window.addEventListener("resize", () => {
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
});

animate();
