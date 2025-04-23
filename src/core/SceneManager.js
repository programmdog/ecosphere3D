import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

class SceneManager {
    constructor(canvasContainer) {
        this.canvasContainer = canvasContainer;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.animationFrameId = null;
        this.meshMap = new Map(); // Map organism ID to Mesh

        this._init();
    }

    _init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87ceeb); // Sky blue background
        this.scene.fog = new THREE.Fog(0x87ceeb, 10, 100);

        // Camera
        const aspect = this.canvasContainer.clientWidth / this.canvasContainer.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(10, 10, 10);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.canvasContainer.clientWidth, this.canvasContainer.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.canvasContainer.appendChild(this.renderer.domElement);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7.5);
        directionalLight.castShadow = true;
        // Configure shadow properties if needed
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        this.scene.add(directionalLight);

        // Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.maxPolarAngle = Math.PI / 2; // Prevent looking below ground

        // Ground Plane (Example)
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide }); // Forest green
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Resize listener
        window.addEventListener('resize', this._onWindowResize.bind(this));

        // Start rendering
        this.startRendering();
    }

    _onWindowResize() {
        const width = this.canvasContainer.clientWidth;
        const height = this.canvasContainer.clientHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
    }

    _renderLoop() {
        this.animationFrameId = requestAnimationFrame(this._renderLoop.bind(this));

        this.controls.update(); // Only required if controls.enableDamping or controls.autoRotate are set to true
        this.renderer.render(this.scene, this.camera);
    }

    startRendering() {
        if (!this.animationFrameId) {
            this._renderLoop();
        }
    }

    stopRendering() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
    }

    addMesh(organism) {
        // Placeholder: Create a simple mesh based on organism type
        let geometry, material;
        const size = organism.size || 1; // Assume size property exists

        switch (organism.type) {
            case 'plant':
                geometry = new THREE.ConeGeometry(size * 0.5, size, 8);
                material = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Green
                break;
            case 'herbivore':
                geometry = new THREE.BoxGeometry(size, size, size * 1.5);
                material = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Blue
                break;
            case 'carnivore':
                geometry = new THREE.SphereGeometry(size * 0.7, 16, 16);
                material = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Red
                break;
            default:
                geometry = new THREE.SphereGeometry(size * 0.5, 8, 8);
                material = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Grey
        }

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.copy(organism.position);
        mesh.castShadow = true;
        mesh.userData.organismId = organism.id; // Link mesh back to organism

        this.scene.add(mesh);
        this.meshMap.set(organism.id, mesh);
    }

    removeMesh(organismId) {
        const mesh = this.meshMap.get(organismId);
        if (mesh) {
            this.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            this.meshMap.delete(organismId);
        }
    }

    updateObjectPosition(organismId, position) {
        const mesh = this.meshMap.get(organismId);
        if (mesh) {
            mesh.position.copy(position);
        }
    }

    updateObjectScale(organismId, scale) {
        const mesh = this.meshMap.get(organismId);
        if (mesh) {
            mesh.scale.set(scale, scale, scale); // Assuming uniform scaling
        }
    }

    // Add methods for updating other visual properties (color, rotation etc.) as needed

    cleanup() {
        this.stopRendering();
        window.removeEventListener('resize', this._onWindowResize.bind(this));

        // Dispose scene objects
        this.scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                if (object.material) {
                    // If material is an array, dispose each element
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });

        // Dispose renderer
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement && this.renderer.domElement.parentNode) {
                this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
            }
        }

        // Clear map
        this.meshMap.clear();

        // Nullify references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.canvasContainer = null;

        console.log('SceneManager cleaned up.');
    }
}

export default SceneManager;