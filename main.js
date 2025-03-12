import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';
import { GLTFLoader } from 'https://cdn.jsdelivr.net/npm/three@0.158.0/examples/jsm/loaders/GLTFLoader.js';
import * as Cesium from 'https://cesium.com/downloads/cesiumjs/releases/1.125/Build/Cesium/Cesium.js';

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
      document.getElementById("loading").textContent = "Error accessing camera.";
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
    "Marker 1": "https://firebasestorage.googleapis.com/v0/b/ieye-453408.firebasestorage.app/o/ARObject1.glb?alt=media&token=3e5c3d8a-f4ff-4015-aebe-d