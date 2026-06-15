import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let scene, camera, renderer, controls, currentModel;

function init() {
    // 1. Cena
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    // 2. Câmera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    // 3. Renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // 4. Controles (Mouse)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // 5. Luzes
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    // 6. Evento de Resize
    window.addEventListener('resize', onWindowResize);

    // 7. Evento de Input
    document.getElementById('file-input').addEventListener('change', handleFileSelect);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    document.getElementById('file-name').textContent = file.name;

    const reader = new FileReader();
    const extension = file.name.split('.').pop().toLowerCase();

    reader.onload = function (e) {
        if (currentModel) scene.remove(currentModel);

        try {
            if (extension === 'obj') {
                const loader = new OBJLoader();
                currentModel = loader.parse(e.target.result);
                ajustarModelo(currentModel);
            } else if (extension === 'gltf' || extension === 'glb') {
                const loader = new GLTFLoader();
                loader.parse(e.target.result, '', function (gltf) {
                    currentModel = gltf.scene;
                    ajustarModelo(currentModel);
                }, function (error) {
                    console.error('Erro ao carregar glTF/GLB:', error);
                });
            }
        } catch (error) {
            console.error('Erro ao processar o modelo:', error);
            alert('Erro ao processar o arquivo. Verifique se ele está em um formato válido.');
        }
    };

    if (extension === 'obj') {
        reader.readAsText(file); // OBJ é texto
    } else {
        reader.readAsArrayBuffer(file); // GLTF/GLB são binários
    }
}

function ajustarModelo(model) {
    // Calcula a caixa delimitadora (bounding box) para centralizar e ajustar a escala do modelo
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    // Centraliza o modelo
    model.position.x = -center.x;
    model.position.y = -center.y;
    model.position.z = -center.z;

    // Ajusta a escala para enquadrar perfeitamente na tela
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 3 / maxDim;
    model.scale.set(scale, scale, scale);

    scene.add(model);
    
    // Reseta a posição da câmera para focar no novo modelo
    camera.position.set(0, 0, 5);
    controls.target.set(0, 0, 0);
}

init();
