import * as THREE from "three";

const gizmoSize = 100; // Size in pixels
const gizmoMargin = 10; // Margin from the edges

export class ViewportGizmo {
    constructor(renderer) {
        this.renderer = renderer;
        this.gizmoScene = new THREE.Scene();

        // Create and add the GizmoHelper to the gizmo scene
        this.axesHelper = new THREE.AxesHelper(gizmoSize);
        this.gizmoScene.add(this.axesHelper);

        // Create a secondary camera for the gizmo scene
        this.gizmoCamera = new THREE.PerspectiveCamera(
            50, // Field of view
            1, // Aspect ratio (square)
            0.1,
            1000,
        );
    }

    render(mainCamera, mainControls) {
        // Set viewport and scissor for the gizmo
        this.renderer.setViewport(
            window.innerWidth - gizmoSize - gizmoMargin,
            gizmoMargin,
            gizmoSize,
            gizmoSize,
        );
        this.renderer.setScissor(
            window.innerWidth - gizmoSize - gizmoMargin,
            gizmoMargin,
            gizmoSize,
            gizmoSize,
        );
        this.renderer.setScissorTest(true);
        this.renderer.setClearColor(0x000000, 1); // Set background color and opacity
        this.renderer.clearDepth(); // Clear depth buffer

        // Update the gizmoCamera to match the orientation of the main camera
        this.gizmoCamera.position.copy(mainCamera.position);
        this.gizmoCamera.position.sub(mainControls.target); // Offset by the target if using OrbitControls
        this.gizmoCamera.position.setLength(200); // Distance from the center
        this.gizmoCamera.lookAt(this.gizmoScene.position);
        this.gizmoCamera.up.copy(mainCamera.up);

        // Render the gizmo scene using its own camera
        this.renderer.render(this.gizmoScene, this.gizmoCamera);

        // Reset scissor test after rendering the gizmo
        this.renderer.setScissorTest(false);
    }
}
