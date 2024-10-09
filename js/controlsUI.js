export const UI_ELEMENTS_IDS = {
    CONTROLS_DIV: "controls",
    CAMERA_POS: "cameraPosition",
    INSTANCE_COUNT: "instanceCount",
    USE_LOD_MODEL: "useLODModel",
    LOD_RATIO: "lodRatio",
    LOD_RATIO_VALUE: "lodRatioValue",
    LOD_DISTANCE: "lodDistance",
    LOD_DISTANCE_VALUE: "lodDistanceValue",
    NUM_DUCKS: "numDucks",
    AUTO_ADD_BTN: "autoAddButton",
    ROTATION_DIV: "rotation",
    ROTATE_X: "rotateX",
    ROTATE_Y: "rotateY",
    ROTATE_Z: "rotateZ",
};

export function setupControls(camera, modelManager) {
    const controlsDiv = document.getElementById(UI_ELEMENTS_IDS.CONTROLS_DIV);
    const cameraPos = document.getElementById(UI_ELEMENTS_IDS.CAMERA_POS);
    const instanceCount = document.getElementById(UI_ELEMENTS_IDS.INSTANCE_COUNT);
    const useLODModel = document.getElementById(UI_ELEMENTS_IDS.USE_LOD_MODEL);
    const lodRatio = document.getElementById(UI_ELEMENTS_IDS.LOD_RATIO);
    const lodRatioValue = document.getElementById(
        UI_ELEMENTS_IDS.LOD_RATIO_VALUE,
    );
    const lodDistance = document.getElementById(UI_ELEMENTS_IDS.LOD_DISTANCE);
    const lodDistanceValue = document.getElementById(
        UI_ELEMENTS_IDS.LOD_DISTANCE_VALUE,
    );
    const numDucks = document.getElementById(UI_ELEMENTS_IDS.NUM_DUCKS);
    const autoAddBtn = document.getElementById(UI_ELEMENTS_IDS.AUTO_ADD_BTN);
    const rotationDiv = document.getElementById(UI_ELEMENTS_IDS.ROTATION_DIV);
    const rotateX = document.getElementById(UI_ELEMENTS_IDS.ROTATE_X);
    const rotateY = document.getElementById(UI_ELEMENTS_IDS.ROTATE_Y);
    const rotateZ = document.getElementById(UI_ELEMENTS_IDS.ROTATE_Z);

    cameraPos.addEventListener("input", () => {
        cameraPos.textContent =
            "Camera Pos: " + camera.position.toArray().join(", ");
    });

    useLODModel.addEventListener("change", (event) => {
        modelManager.useLOD = event.target.checked;
        modelManager.updateInstances(modelManager.models.length, lodDistance.value);

        document.getElementById(UI_ELEMENTS_IDS.LOD_RATIO).disabled =
            !event.target.checked;
        document.getElementById(UI_ELEMENTS_IDS.LOD_DISTANCE).disabled =
            !event.target.checked;
    });

    lodRatio.addEventListener("input", (event) => {
        modelManager.setLODs(null, parseFloat(event.target.value));
        modelManager.updateInstances(modelManager.models.length, lodDistance.value);
        lodRatioValue.textContent = (event.target.value * 100).toFixed(0) + "%";
    });

    lodDistance.addEventListener("input", () => {
        modelManager.updateInstances(modelManager.models.length, lodDistance.value);
        lodDistanceValue.textContent = lodDistance.value;
    });

    numDucks.addEventListener("input", (event) => {
        modelManager.updateInstances(
            parseInt(event.target.value),
            lodDistance.value,
        );
        instanceCount.textContent = event.target.value;
        numDucks.value = Math.max(1, modelManager.models.length);
    });

    autoAddBtn.addEventListener("click", () => {
        modelManager.autoAdding = !modelManager.autoAdding;
        autoAddBtn.innerText = modelManager.autoAdding ? "Stop" : "Start";
    });

    rotateX.addEventListener("input", (event) => {
        modelManager.rotateModelAxis(event.target.value, "x");
    });

    rotateY.addEventListener("input", (event) => {
        modelManager.rotateModelAxis(event.target.value, "y");
    });

    rotateZ.addEventListener("input", (event) => {
        modelManager.rotateModelAxis(event.target.value, "z");
    });

    window.addEventListener(
        "click",
        (event) => {
            // Ignore clicks on Settings div
            if (
                controlsDiv.contains(event.target) ||
                rotationDiv.contains(event.target)
            )
                return;

            modelManager.onMouseSelect(event, camera);
            rotationDiv.style.display = modelManager.selectedModel ? "block" : "none";
        },
        false,
    );
}
