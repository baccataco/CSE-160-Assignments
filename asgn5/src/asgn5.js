import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js';

// --- GLOBAL VARIABLES ---
let scene, camera, renderer, controls;
let duckModel; // The custom 3D model
let raycaster, mouse;
let score = 0;
let isDuckMoving = true;
let duckTargetPosition = new THREE.Vector3();

// Arrays for animation updates
const animatedObjects = []; 
const particles = []; 

// UI Elements
const scoreEl = document.getElementById('score');
const feedbackEl = document.getElementById('feedback-msg');
const loaderEl = document.getElementById('loader');

// --- INITIALIZATION ---
function init() {
    // 1. Scene Setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB); 
    scene.fog = new THREE.Fog(0x87CEEB, 10, 50); 

    // 2. Camera (Perspective)
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    // 3. Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true; 
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05; 

    // 5. Lighting
    setupLighting();

    // 6. Skybox
    setupSkybox();

    // 7. Environment (Ground + 20+ Objects)
    createEnvironment();

    // 8. Custom 3D Model (The Target)
    loadDuckModel();

    // 9. Interaction Setup
    raycaster = new THREE.Raycaster();
    mouse = new THREE.Vector2();
    window.addEventListener('pointerdown', onPointerDown);

    // Handle Resize
    window.addEventListener('resize', onWindowResize);

    // Start Loop
    animate();
}

// --- LIGHTING ---
function setupLighting() {
    // A. Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.0);
    scene.add(ambientLight);

    // B. Directional Light (Sun)
    const dirLight = new THREE.DirectionalLight(0xffdfba, 1.2);
    dirLight.position.set(10, 20, 10);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 15;
    dirLight.shadow.camera.left = -d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = -d;
    scene.add(dirLight);

    // C. Point Lights
    const pointLight1 = new THREE.PointLight(0x3c5aa6, 2, 10); 
    pointLight1.position.set(-5, 2, -5);
    scene.add(pointLight1);

    const sphereSize = 0.2;
    const pointLightHelper = new THREE.Mesh(
        new THREE.SphereGeometry(sphereSize, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x3c5aa6 })
    );
    pointLightHelper.position.copy(pointLight1.position);
    scene.add(pointLightHelper);
    
    animatedObjects.push({
        mesh: pointLightHelper,
        type: 'float',
        speed: 1.5,
        initialY: 2,
        offset: 0
    });

    // D. SpotLight
    const spotLight = new THREE.SpotLight(0xffffff, 5);
    spotLight.position.set(0, 15, 0);
    spotLight.angle = Math.PI / 8;
    spotLight.penumbra = 0.2;
    spotLight.decay = 2;
    spotLight.distance = 50;
    spotLight.castShadow = true;
    scene.add(spotLight);
}

// --- SKYBOX ---
function setupSkybox() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#1E90FF'); 
    gradient.addColorStop(0.5, '#87CEEB'); 
    gradient.addColorStop(1, '#E0F6FF'); 
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 512);
    
    for(let i=0; i<20; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.beginPath();
        ctx.arc(Math.random()*512, Math.random()*256, 20+Math.random()*40, 0, Math.PI*2);
        ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    scene.background = texture;

    
}

// --- PROCEDURAL TEXTURE GENERATOR ---
function createGrassTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const context = canvas.getContext('2d');
    
    context.fillStyle = '#4caf50';
    context.fillRect(0, 0, 512, 512);

    context.fillStyle = '#388e3c';
    for (let i = 0; i < 2000; i++) {
        const x = Math.random() * 512;
        const y = Math.random() * 512;
        const size = Math.random() * 5 + 1;
        context.fillRect(x, y, size, size);
    }
    
    context.strokeStyle = '#2e7d32';
    context.lineWidth = 10;
    context.strokeRect(0, 0, 512, 512);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(20, 20);
    return texture;
}

// --- ENVIRONMENT ---
function createEnvironment() {
    // Ground
    const groundGeometry = new THREE.CircleGeometry(30, 64);
    const groundMaterial = new THREE.MeshStandardMaterial({ 
        map: createGrassTexture(),
        roughness: 0.8 
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);

    const createObject = (geometry, material, x, z, scale) => {
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(x, 0, z);
        mesh.scale.set(scale, scale, scale);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        scene.add(mesh);
        return mesh;
    };

    // TREES
    const trunkGeo = new THREE.CylinderGeometry(0.2, 0.3, 1.5, 8);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const leavesGeo = new THREE.ConeGeometry(1.2, 2.5, 8);
    const leavesMat = new THREE.MeshStandardMaterial({ color: 0x228B22, flatShading: true });

    for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const radius = 8 + Math.random() * 5;
        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius;
        createObject(trunkGeo, trunkMat, x, z, 1);
        const leaves = createObject(leavesGeo, leavesMat, x, z, 1);
        leaves.position.y = 1.5;
        animatedObjects.push({
            mesh: leaves,
            type: 'sway',
            speed: 1 + Math.random(),
            offset: Math.random() * 10
        });
    }

    // ROCKS
    const rockGeo = new THREE.DodecahedronGeometry(0.5, 0);
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x808080, flatShading: true });
    for (let i = 0; i < 6; i++) {
        const x = (Math.random() - 0.5) * 15;
        const z = (Math.random() - 0.5) * 15;
        const rock = createObject(rockGeo, rockMat, x, z, 0.8 + Math.random());
        rock.position.y = 0.3; 
        if(i < 3) {
            animatedObjects.push({
                mesh: rock,
                type: 'float',
                speed: 0.5 + Math.random(),
                initialY: 0.5,
                offset: Math.random() * 100,
                rotation: true
            });
        }
    }

    // CRYSTALS
    const crystalGeo = new THREE.IcosahedronGeometry(0.3, 0);
    const crystalMat = new THREE.MeshStandardMaterial({ 
        color: 0x9400D3, 
        emissive: 0x4b0082,
        emissiveIntensity: 0.5,
        flatShading: true 
    });
    for(let i=0; i<6; i++) {
        const x = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        const crystal = createObject(crystalGeo, crystalMat, x, z, 1);
        crystal.position.y = 1.5; 
        animatedObjects.push({
            mesh: crystal,
            type: 'float',
            speed: 1.5,
            initialY: 1.5,
            offset: Math.random() * 50,
            rotation: true
        });
    }
}

// --- HELPER TO HIDE LOADER ---
function hideLoader() {
    loaderEl.style.opacity = '0';
    setTimeout(() => loaderEl.style.display = 'none', 500);
}

// --- FALLBACK DUCK (IF MODEL FAILS) ---
function createPlaceholderDuck() {
    const geo = new THREE.BoxGeometry(1, 1, 1);
    const mat = new THREE.MeshStandardMaterial({ color: 0xFFD700 }); // Gold color
    duckModel = new THREE.Mesh(geo, mat);
    duckModel.position.y = 0.5;
    duckModel.castShadow = true;
    duckModel.receiveShadow = true;
    scene.add(duckModel);
    pickNewDuckTarget();
    
    feedbackEl.innerText = "Using Placeholder Model";
    feedbackEl.classList.add('show-feedback');
    setTimeout(() => feedbackEl.classList.remove('show-feedback'), 2000);
}

// --- CUSTOM 3D MODEL ---
function loadDuckModel() {
    const loader = new FBXLoader();
    const url = './Psyduck.fbx'; 

    loader.load(url, 
        (object) => {
            duckModel = object;

            // --- AUTO SCALE (Keep your existing scaling code) ---
            const box = new THREE.Box3().setFromObject(duckModel);
            const size = new THREE.Vector3();
            box.getSize(size);
            const targetHeight = 2; 
            const scaleFactor = targetHeight / size.y;
            duckModel.scale.setScalar(scaleFactor);
            box.setFromObject(duckModel);
            const height = box.max.y - box.min.y;
            duckModel.position.y = height / 2; 

            // --- UPDATE THE TRAVERSE LOOP ---
            duckModel.traverse((child) => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    // Fix for missing texture (Yellow fallback)
                    if (!child.material.map) {
                        child.material.color.setHex(0xFFD700); 
                    }

                    // FIX FOR DARKNESS:
                    // Lower roughness makes it less "dull/matte" and more reflective.
                    child.material.roughness = 1.0; 
                    
                    // Adding a tiny bit of metalness helps it catch light highlights.
                    child.material.metalness = 0.0; 
                    
                    // Ensure it reacts to the new settings
                    child.material.needsUpdate = true;
                    
                    // Double sided ensures we don't see inside-out black faces
                    child.material.side = THREE.DoubleSide;
                }
            });

            scene.add(duckModel);
            pickNewDuckTarget();
            hideLoader();
        }, 
        (xhr) => {
            console.log((xhr.loaded / xhr.total * 100) + '% loaded');
        },
        (error) => {
            console.error('An error occurred loading the FBX:', error);
            createPlaceholderDuck(); 
            hideLoader();
        }
    );
}

// --- INTERACTION LOGIC ---
function onPointerDown(event) {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);

    if (duckModel) {
        const intersects = raycaster.intersectObject(duckModel, true);
        if (intersects.length > 0) {
            catchDuck();
        }
    }
}

function catchDuck() {
    score++;
    scoreEl.innerText = score;
    feedbackEl.innerText = "CAUGHT!";
    feedbackEl.classList.add('show-feedback');
    setTimeout(() => feedbackEl.classList.remove('show-feedback'), 1000);
    throwPokeball(duckModel.position.clone());
    createExplosion(duckModel.position);
    duckModel.position.set((Math.random()-0.5)*10, 0, (Math.random()-0.5)*10);
    pickNewDuckTarget();
}

// --- ANIMATIONS ---
function throwPokeball(targetPos) {
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.5), new THREE.MeshStandardMaterial({color: 0xff0000}));
    ball.position.copy(targetPos);
    ball.position.y += 2;
    scene.add(ball);
    animatedObjects.push({
        mesh: ball,
        type: 'capture',
        life: 1.0
    });
}

function createExplosion(pos) {
    const particleCount = 20;
    const geometry = new THREE.BufferGeometry();
    const positions = [];
    const velocities = [];

    for (let i = 0; i < particleCount; i++) {
        positions.push(pos.x, pos.y + 0.5, pos.z);
        velocities.push(
            (Math.random() - 0.5) * 0.5,
            (Math.random() * 0.5),
            (Math.random() - 0.5) * 0.5
        );
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({ color: 0xffff00, size: 0.2 });
    const particleSystem = new THREE.Points(geometry, material);
    scene.add(particleSystem);
    particles.push({ mesh: particleSystem, velocities: velocities, age: 0 });
}

function pickNewDuckTarget() {
    duckTargetPosition.set(
        (Math.random() - 0.5) * 15,
        0,
        (Math.random() - 0.5) * 15
    );
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    const time = performance.now() * 0.001;
    controls.update();

    animatedObjects.forEach((obj, index) => {
        if (obj.type === 'sway') {
            obj.mesh.rotation.z = Math.sin(time * obj.speed + obj.offset) * 0.1;
        } 
        else if (obj.type === 'float') {
            obj.mesh.position.y = obj.initialY + Math.sin(time * obj.speed + obj.offset) * 0.2;
            if (obj.rotation) {
                obj.mesh.rotation.y += 0.02;
                obj.mesh.rotation.x += 0.01;
            }
        }
        else if (obj.type === 'capture') {
            obj.mesh.scale.multiplyScalar(0.9);
            obj.life -= 0.05;
            if(obj.life <= 0) {
                scene.remove(obj.mesh);
                animatedObjects.splice(index, 1);
            }
        }
    });

    if (duckModel && isDuckMoving) {
        const speed = 0.05;
        const direction = new THREE.Vector3().subVectors(duckTargetPosition, duckModel.position);
        if (direction.length() > 0.1) {
            duckModel.lookAt(duckTargetPosition);
            duckModel.position.add(direction.normalize().multiplyScalar(speed));
            duckModel.position.y = Math.abs(Math.sin(time * 10)) * 0.2;
        } else {
            pickNewDuckTarget();
        }
    }

    particles.forEach((p, index) => {
        const positions = p.mesh.geometry.attributes.position.array;
        p.age++;
        for(let i=0; i < p.velocities.length / 3; i++) {
            positions[i*3] += p.velocities[i*3];
            positions[i*3+1] += p.velocities[i*3+1];
            positions[i*3+2] += p.velocities[i*3+2];
            p.velocities[i*3+1] -= 0.02; 
        }
        p.mesh.geometry.attributes.position.needsUpdate = true;
        if (p.age > 60) {
            scene.remove(p.mesh);
            particles.splice(index, 1);
        }
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

init();