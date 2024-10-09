import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { SimplifyModifier } from "three/addons/modifiers/SimplifyModifier.js";

const OFFSET = 2;
const Y_POS = -3;
const OFFSET_DEGREE = 15;

export class ModelManager {
    constructor(scene) {
        this.scene = scene;
        this.models = [];
        this.selectedModel = null; // use for rotation
        this.hightlightedModel = null; // use for indicating selection
        this.loader = new GLTFLoader();
        this.simplifyModifier = new SimplifyModifier();

        this.highDetailModel = null;
        this.lowDetailModel = null;
        this.autoAdding = false;
        this.useLOD = true;

        // Used for model selection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
    }

    loadModel(url, callback) {
        this.loader.load(
            url,
            (gltf) => {
                this.highDetailModel = gltf.scene;
                this.setLODs(callback);
            },
            undefined,
            (error) => {
                console.error("Error loading model:", error);
            },
        );
    }

    setLODs(callback, ratio = 0.8) {
        const sourceMesh = this.highDetailModel.getObjectByProperty("isMesh", true);
        if (!sourceMesh) return;

        const sourceGeometry = sourceMesh.geometry;
        const count = Math.floor(
            sourceGeometry.attributes.position.count * ratio,
        );
        const lowDetailGeometry = this.simplifyModifier.modify(
            sourceGeometry.clone(),
            Math.min(sourceGeometry.attributes.position.count - 3, count),
        );

        this.lowDetailModel = this.highDetailModel.clone();
        this.lowDetailModel.getObjectByProperty("isMesh", true).geometry =
            lowDetailGeometry;

        // Call the provided callback once the LODs are created
        if (callback) callback();
    }

    newInstance(position = new THREE.Vector3(), yDegree = 0, lodDistance = 20) {
        yDegree = yDegree % 360;
        const rad = THREE.MathUtils.degToRad(yDegree);
        if (this.useLOD && this.lowDetailModel) {
            const lod = new THREE.LOD();
            lod.position.copy(position);
            lod.matrix.identity();
            lod.matrixAutoUpdate = false;
            lod.matrix.multiply(new THREE.Matrix4().makeRotationY(rad));
            lod.matrix.setPosition(position);

            lod.addLevel(this.highDetailModel.clone(), 0);
            lod.addLevel(this.lowDetailModel.clone(), lodDistance);

            return lod
        } else if (this.highDetailModel) {
            const model = this.highDetailModel.clone();
            model.position.copy(position);
            model.matrix.identity();
            model.matrixAutoUpdate = false;
            model.matrix.multiply(new THREE.Matrix4().makeRotationY(rad));
            model.matrix.setPosition(position);

            return model
        } else {
            console.error("No model loaded");
            return null;
        }
    }

    popInstances() {
        const model = this.models.pop();
        if (!model) return;

        // remove children if it is a LOD object
        for (let i = model.children.length - 1; i >= 0; i--) {
            model.remove(model.children[i]);
        }
        this.scene.remove(model);

    }

    updateInstances(targetCount, lodDistance) {
        const currentCount = this.models.length;
        for (let i = 0; i < targetCount; i++) {
            // 1. update model
            if (i < currentCount) {
                const model = this.models[i];
                const position = model.position;
                const matrix = model.matrix;
                for (let i = model.children.length - 1; i >= 0; i--) {
                    model.remove(model.children[i]);
                }
                this.scene.remove(model);
                const instance = this.newInstance(position, 0, lodDistance);
                instance.matrix.copy(matrix);
                this.scene.add(instance);
                this.models[i] = instance;

            } else {
                // 2. add instances
                let lastModel = currentCount === 0 ? null : this.models[this.models.length - 1];

                let xVal = lastModel ? lastModel.position.x : 0;
                let zVal = lastModel ? lastModel.position.z : -OFFSET;
                const rotDegree = OFFSET_DEGREE * currentCount;

                let position;
                if (zVal < 99 * OFFSET) {
                    // 100 models per row
                    position = new THREE.Vector3(xVal, Y_POS, zVal + OFFSET);
                } else {
                    position = new THREE.Vector3(xVal - OFFSET, Y_POS, 0);
                }

                const instance = this.newInstance(position, rotDegree);
                this.models.push(instance);
                this.scene.add(instance);
            }
        }
        // 3. remove instances
        for (let i = currentCount; i > targetCount; i--) {
            this.popInstances();
        }
    }

    onMouseSelect(event, camera) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, camera);

        const intersects = this.raycaster.intersectObjects(this.models, true);

        if (intersects.length > 0) {
            // Select the model
            let modelObj = intersects[0].object;

            while (modelObj.parent && !this.models.includes(modelObj)) {
                modelObj = modelObj.parent;
            }

            if (this.models.includes(modelObj)) {
                this.selectedModel = modelObj;
                this.resetHighlight();
                this.applyHighlight(this.selectedModel);
            }
        } else if (this.selectedModel) {
            // Deselect the model
            this.resetHighlight();
            this.selectedModel = null;
        }
    }

    applyHighlight(model) {
        console.log("highlighted");
        this.hightlightedModel = new THREE.Group();
        model.traverse((child) => {
            if (child.isMesh) {
                const highlightMesh = child.clone();
                const highlightMaterial = new THREE.MeshBasicMaterial({
                    color: 0xff0000,
                    wireframe: true,
                    // depthTest: false,
                });
                highlightMesh.material = highlightMaterial;
                highlightMesh.matrixAutoUpdate = false;
                highlightMesh.matrix.copy(child.matrixWorld);
                this.hightlightedModel.add(highlightMesh);
            }
        });

        this.hightlightedModel.matrixAutoUpdate = false;
        this.scene.add(this.hightlightedModel);
    }

    resetHighlight() {
        if (!this.hightlightedModel) return;

        for (let i = this.hightlightedModel.children.length - 1; i >= 0; i--) {
            this.hightlightedModel.remove(this.hightlightedModel.children[i]);
        }
        this.scene.remove(this.hightlightedModel);
        this.hightlightedModel = null;

    }

    rotateModelAxis(value, axis) {
        if (!this.selectedModel) return;

        const rad = THREE.MathUtils.degToRad(value);
        // Reset the model's matrix
        this.selectedModel.matrix.identity();
        this.selectedModel.matrixAutoUpdate = false;
        let rot;
        switch (axis) {
            case "x":
                rot = new THREE.Matrix4().makeRotationX(rad);
                break;
            case "y":
                rot = new THREE.Matrix4().makeRotationY(rad);
                break;
            case "z":
                rot = new THREE.Matrix4().makeRotationZ(rad);
                break;
            default:
                return;
        }

        this.selectedModel.matrix.multiply(rot);
        this.selectedModel.matrix.setPosition(this.selectedModel.position);
        this.resetHighlight();
        this.applyHighlight(this.selectedModel);
    }

}
