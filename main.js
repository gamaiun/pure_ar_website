// Access MindAR from the global scope
const { ImageSystem: MindARThree } = window.MINDAR || {};

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

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

function calculateOffset(userLat, userLon, targetLat, targetLon) {
  console.log("Calculating offset:", {
    userLat,
    userLon,
    targetLat,
    targetLon,
  });
  const R = 6371000; // Earth's radius in meters
  const dLat = toRadians(targetLat - userLat);
  const dLon = toRadians(targetLon - userLon);
  const latAvg = toRadians((userLat + targetLat) / 2);
  const x = R * dLon * Math.cos(latAvg); // East-west offset
  const z = -R * dLat; // North-south offset
  return { x: isNaN(x) ? 0 : x, z: isNaN(z) ? 0 : z };
}

window.onload = () => {
  console.log("Script started");
  const scene = document.querySelector("a-scene");
  const modelEntity = document.querySelector("#object");
  const camera = document.querySelector("a-camera");
  const loadingDiv = document.querySelector("#loading");

  const { gpsLat, gpsLon, scale, objectId, firebaseId } = getQueryParams();
  if (!gpsLat || !gpsLon) {
    console.error("Missing gpsLat or gpsLon.");
    loadingDiv.textContent = "Error: Missing GPS.";
    return;
  }

  console.log(
    `Target: Lat ${gpsLat}, Lon ${gpsLon}, Scale ${scale}, ObjectId ${objectId}, FirebaseId ${firebaseId}`
  );

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
  modelEntity.setAttribute(
    "gltf-model",
    modelMap[objectId] || modelMap["default"]
  );
  modelEntity.setAttribute("scale", `${scale} ${scale} ${scale}`);

  // Use MindAR's ImageSystem (adjusted for non-marker AR)
  const arSystem = new MindARThree({
    container: document.body,
    imageTargetSrc: null, // No marker for location-based AR
  });
  arSystem.start();

  scene.addEventListener("loaded", () => {
    console.log("Scene loaded");

    console.log("Starting geolocation");
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

          const offset = calculateOffset(
            initialUserLat,
            initialUserLon,
            gpsLat,
            gpsLon
          );
          console.log(
            `Initial Offset: x=${offset.x.toFixed(2)}m, z=${offset.z.toFixed(
              2
            )}m`
          );

          if (!modelEntity.getAttribute("data-anchored")) {
            scene.object3D.add(modelEntity.object3D);
            const worldPos = new THREE.Vector3(offset.x, 0.5, offset.z);
            modelEntity.object3D.position.copy(worldPos);
            modelEntity.object3D.updateMatrixWorld(true);
            modelEntity.setAttribute("data-anchored", "true");
            console.log(
              `Anchored at: x=${worldPos.x.toFixed(2)}m, z=${worldPos.z.toFixed(
                2
              )}m`
            );
          }

          initialPositionSet = true;
          scene.classList.add("ready");
          loadingDiv.style.display = "none";
        }

        // Update camera position to align with user movement
        const offset = calculateOffset(userLat, userLon, gpsLat, gpsLon);
        camera.object3D.position.set(offset.x, 1.6, offset.z);
        camera.object3D.updateMatrixWorld(true);
        console.log(
          `Camera Position: x=${offset.x.toFixed(2)}m, z=${offset.z.toFixed(
            2
          )}m`
        );
      },
      (error) => {
        console.error("GPS Error:", error.message);
        loadingDiv.textContent = "GPS Error: " + error.message;
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    modelEntity.addEventListener("model-loaded", () => {
      console.log("Model loaded");
    });

    modelEntity.addEventListener("model-error", (event) => {
      console.error("Model failed to load:", event.detail);
      loadingDiv.textContent = "Error loading model.";
    });
  });
};
