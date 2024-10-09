import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

export function setupScene() {
    const scene = new THREE.Scene();

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000,
    );
    camera.position.set(5, 3, -5);

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1); // Black background with full opacity
    document.body.appendChild(renderer.domElement);

    // Orbit Controls for better camera movement
    const controls = new OrbitControls(camera, renderer.domElement);

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5).normalize();
    scene.add(directionalLight);

    return { scene, camera, controls, renderer };
}
