import { setupScene } from "./sceneSetup.js";
import { ModelManager } from "./modelManager.js";
import { setupControls, UI_ELEMENTS_IDS } from "./controlsUI.js";
import { ViewportGizmo } from "./viewportGizmo.js";

// Memory Panel
const statsMemory = new Stats();
statsMemory.showPanel(2); // Memory
statsMemory.dom.style.cssText = "position:absolute;top:0px;right:160px;";
document.body.appendChild(statsMemory.dom);

// FPS Panel
const statsFPS = new Stats();
statsFPS.showPanel(0); // FPS
statsFPS.dom.style.cssText = "position:absolute;top:0px;right:80px;";
document.body.appendChild(statsFPS.dom);

// MS Panel
const statsMS = new Stats();
statsMS.showPanel(1); // MS
statsMS.dom.style.cssText = "position:absolute;top:0px;right:0px;";
document.body.appendChild(statsMS.dom);

// Initialize the scene, camera, and renderer
const { scene, camera, controls, renderer } = setupScene();

camera.position.x = 5;
camera.position.y = 3;
camera.position.z = -5;

// Create a viewport gizmo instance
const viewportGizmo = new ViewportGizmo(renderer);

// Create a model loader instance and load the model
const modelManager = new ModelManager(scene);
modelManager.loadModel("gltf_duck/Duck.gltf", () => {
    // Add instances after loading, or set up scene-specific logic here
    modelManager.updateInstances(1);
});

// Set up controls
setupControls(camera, modelManager);

let prevTime = performance.now();
let fps = 0;
const fpsHistory = [];
const fpsHistorySize = 10;

// Start the render loop
function animate() {
    // stats begin
    statsFPS.begin();
    statsMS.begin();
    statsMemory.begin();

    // Calculate FPS for auto-adding models
    const currentTime = performance.now();
    const deltaTime = currentTime - prevTime;
    fps = 1000 / deltaTime;
    prevTime = currentTime;

    fpsHistory.push(fps);
    if (fpsHistory.length > fpsHistorySize) {
        fpsHistory.shift();
    }
    const avgFPS =
        fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length;

    if (modelManager.autoAdding && avgFPS > 50) {
        const lodDistance = document.getElementById(UI_ELEMENTS_IDS.LOD_DISTANCE).value;
        modelManager.updateInstances(modelManager.models.length + 10, lodDistance);
        document.getElementById(UI_ELEMENTS_IDS.INSTANCE_COUNT).textContent =
            modelManager.models.length;
        document.getElementById(UI_ELEMENTS_IDS.NUM_DUCKS).value =
            modelManager.models.length;
    }

    controls.update();

    // Render the main scene
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissor(0, 0, window.innerWidth, window.innerHeight);
    renderer.setScissorTest(false);
    renderer.render(scene, camera);

    // Render the viewport gizmo
    viewportGizmo.render(camera, controls);

    // stats end
    statsFPS.end();
    statsMS.end();
    statsMemory.end();

    requestAnimationFrame(animate);
}

animate();

// Handle window resize
window.addEventListener("resize", function() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
