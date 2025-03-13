// import * as THREE from "three";

// // Parse URL parameters
// const urlParams = new URLSearchParams(window.location.search);
// const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006;
// const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326;
// const scale = parseFloat(urlParams.get("scale")) || 0.5;
// const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq";

// // Set up Three.js
// const threeScene = new THREE.Scene();
// const threeCamera = new THREE.PerspectiveCamera(
//   75,
//   window.innerWidth / window.innerHeight,
//   0.1,
//   1000
// );
// threeCamera.position.set(0, 0, 5); // Initial camera position
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
// threeScene.add(cube);

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

// // Set up camera feed
// const video = document.createElement("video");
// video.style.position = "absolute";
// video.style.top = "0";
// video.style.left = "0";
// video.style.width = "100%";
// video.style.height = "100%";
// video.style.objectFit = "cover";
// video.autoplay = true;
// document.getElementById("arContainer").prepend(video);

// navigator.mediaDevices
//   .getUserMedia({ video: { facingMode: "environment" } })
//   .then((stream) => {
//     video.srcObject = stream;
//   })
//   .catch((error) => {
//     console.error("Error accessing camera:", error);
//   });

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
import * as Cesium from "cesium";

// Set Cesium Ion access token (optional, for Cesium services; get one from cesium.com if needed)
Cesium.Ion.defaultAccessToken = "your-cesium-ion-token-here"; // Replace or remove if not using Ion assets

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
  1000
);
threeCamera.position.set(0, 0, 5); // Initial position, will be updated by Cesium
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

// Cesium setup for geospatial positioning
const targetPosition = Cesium.Cartesian3.fromDegrees(gpsLon, gpsLat, 0); // Cube's position in world space

// Convert device position to Cesium coordinates and set cube position
navigator.geolocation.watchPosition(
  (position) => {
    const deviceLat = position.coords.latitude;
    const deviceLon = position.coords.longitude;
    const devicePosition = Cesium.Cartesian3.fromDegrees(
      deviceLon,
      deviceLat,
      0
    );

    // Calculate the relative position of the cube from the device
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(devicePosition);
    const inverseTransform = Cesium.Matrix4.inverse(
      transform,
      new Cesium.Matrix4()
    );
    const relativePosition = Cesium.Matrix4.multiplyByPoint(
      inverseTransform,
      targetPosition,
      new Cesium.Cartesian3()
    );

    // Set cube position in Three.js (Cesium uses meters, so no additional conversion needed)
    cube.position.set(
      relativePosition.x,
      relativePosition.y,
      relativePosition.z
    );
  },
  (error) => {
    console.error("Geolocation error:", error);
  },
  { enableHighAccuracy: true }
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
let deviceOrientation = { alpha: 0, beta: 0, gamma: 0 };
window.addEventListener("deviceorientation", (event) => {
  if (event.alpha !== null && event.beta !== null && event.gamma !== null) {
    deviceOrientation = {
      alpha: event.alpha || 0,
      beta: event.beta || 0,
      gamma: event.gamma || 0,
    };
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

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  if (
    deviceOrientation.alpha ||
    deviceOrientation.beta ||
    deviceOrientation.gamma
  ) {
    const alpha = THREE.MathUtils.degToRad(deviceOrientation.alpha); // Yaw
    const beta = THREE.MathUtils.degToRad(deviceOrientation.beta); // Pitch
    const gamma = THREE.MathUtils.degToRad(deviceOrientation.gamma); // Roll
    threeCamera.rotation.set(beta, gamma, -alpha, "YXZ");
  }

  threeRenderer.render(threeScene, threeCamera);
}

window.addEventListener("resize", () => {
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
});

animate();
