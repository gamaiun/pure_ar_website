// Import Three.js and GLTFLoader
import * as THREE from "./lib/three.module.js";
import { GLTFLoader } from "./lib/GLTFLoader.js";

// Parse URL parameters
const urlParams = new URLSearchParams(window.location.search);
const gpsLat = parseFloat(urlParams.get("gpsLat")) || 33.203299110093006; // Default latitude
const gpsLon = parseFloat(urlParams.get("gpsLon")) || 35.575139969587326; // Default longitude
const scale = parseFloat(urlParams.get("scale")) || 0.5; // Default scale
const objectId = urlParams.get("objectId") || "default"; // Default objectId
const firebaseId = urlParams.get("firebaseId") || "zX3IjNqgbMZC9THW5twq"; // Default firebaseId

// Configure CesiumJS base URL for assets
Cesium.buildModuleUrl.setBaseUrl("/lib/"); // Adjust if necessary based on your CesiumJS setup

// Set up Cesium viewer without terrain, imagery, or UI
const viewer = new Cesium.Viewer("arContainer", {
  scene3DOnly: true, // Use 3D mode only
  terrainProvider: new Cesium.EllipsoidTerrainProvider(), // Basic ellipsoid (no terrain data)
  imageryProvider: false, // Disable imagery (no maps)
  baseLayerPicker: false,
  geocoder: false,
  homeButton: false,
  sceneModePicker: false,
  navigationHelpButton: false,
  animation: false,
  timeline: false,
  fullscreenButton: false,
  infoBox: false, // Disable info box to prevent loading InfoBoxDescription.css
  selectionIndicator: false, // Disable selection indicator
  skyBox: false, // Disable skybox
  skyAtmosphere: false, // Disable atmosphere
  requestRenderMode: true, // Optimize rendering
  maximumRenderTimeChange: Infinity, // Prevent unnecessary renders
});

// Hide the Cesium globe (we only need Cesium for GPS calculations)
viewer.scene.globe.show = false;

// Disable CesiumJS features that might try to load additional resources
viewer.scene.requestRenderMode = true;
viewer.scene.maximumRenderTimeChange = Infinity;

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

// Add basic lighting to the Three.js scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
threeScene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 1, 1);
threeScene.add(directionalLight);

// Load the 3D model using GLTFLoader
const loader = new GLTFLoader();
loader.load(
  `Assets/${objectId}.gltf`,
  (gltf) => {
    const model = gltf.scene;
    model.scale.set(scale, scale, scale); // Apply the scale from URL params

    // Convert GPS coordinates to Cartesian coordinates using Cesium
    const position = Cesium.Cartesian3.fromDegrees(gpsLon, gpsLat, 0); // Place at ground level
    const transform = Cesium.Transforms.eastNorthUpToFixedFrame(position);
    model.userData.cesiumTransform = transform;

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
  deviceOrientation.alpha = event.alpha || 0; // Heading (degrees)
  deviceOrientation.beta = event.beta || 0; // Tilt front-to-back (degrees)
  deviceOrientation.gamma = event.gamma || 0; // Tilt side-to-side (degrees)
});

// Request device orientation permission (iOS 13+ requirement)
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

// Get device GPS location (for relative positioning)
let devicePosition = null;
navigator.geolocation.watchPosition(
  (position) => {
    devicePosition = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      altitude: position.coords.altitude || 0,
    };
  },
  (error) => {
    console.error("Error getting device location:", error);
  },
  { enableHighAccuracy: true }
);

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  // Update camera based on device orientation
  if (deviceOrientation) {
    const alpha = Cesium.Math.toRadians(deviceOrientation.alpha); // Heading
    const beta = Cesium.Math.toRadians(deviceOrientation.beta); // Tilt
    const gamma = Cesium.Math.toRadians(deviceOrientation.gamma); // Roll

    // Update Three.js camera orientation
    threeCamera.rotation.set(beta, gamma, -alpha, "YXZ");
  }

  // Update object position relative to device location
  if (devicePosition) {
    const deviceCart = Cesium.Cartesian3.fromDegrees(
      devicePosition.longitude,
      devicePosition.latitude,
      devicePosition.altitude
    );
    threeCamera.position.copy(deviceCart);

    threeScene.children.forEach((child) => {
      if (child.userData.cesiumTransform) {
        const transform = child.userData.cesiumTransform;
        child.matrixAutoUpdate = false;
        child.matrix.fromArray(transform);
      }
    });
  }

  // Render the Three.js scene
  threeRenderer.render(threeScene, threeCamera);
}

// Handle window resizing
window.addEventListener("resize", () => {
  threeRenderer.setSize(window.innerWidth, window.innerHeight);
  threeCamera.aspect = window.innerWidth / window.innerHeight;
  threeCamera.updateProjectionMatrix();
});

// Start the animation loop
animate();
