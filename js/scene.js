/**
 * scene.js - Cinematic Three.js Environment
 * Implements the "Mathematical Void" background and 3D visual effects.
 */

let scene, camera, renderer, particles, mathForm;

function initScene() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    renderer = new THREE.WebGLRenderer({
        canvas: document.getElementById('bg-canvas'),
        antialias: true,
        alpha: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // 1. Ambient Particle Field
    const particleCount = 1500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 100;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMaterial = new THREE.PointsMaterial({
        size: 0.15,
        color: 0xffffff,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
    });

    particles = new THREE.Points(geometry, particleMaterial);
    scene.add(particles);

    // 2. Central Abstract Math Form (Torus Knot for complexity)
    const knotGeo = new THREE.TorusKnotGeometry(10, 3, 100, 16);
    const knotMat = new THREE.MeshPhongMaterial({
        color: 0x00d2ff,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
        emissive: 0x00d2ff,
        emissiveIntensity: 0.5
    });

    mathForm = new THREE.Mesh(knotGeo, knotMat);
    mathForm.position.z = -20;
    scene.add(mathForm);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 2);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x9d00ff, 5, 50);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    camera.position.z = 30;

    window.addEventListener('resize', onWindowResize, false);
    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);

    // Slow drift for particles
    particles.rotation.y += 0.0005;
    particles.rotation.x += 0.0002;

    // Rotate central math form
    mathForm.rotation.x += 0.002;
    mathForm.rotation.y += 0.003;

    // Subtle pulse
    const scale = 1 + Math.sin(Date.now() * 0.001) * 0.05;
    mathForm.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}

// Initialize once DOM is ready
document.addEventListener('DOMContentLoaded', initScene);
