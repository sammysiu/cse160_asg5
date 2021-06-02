const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );

// Creates a rendering context (similar to canvas.getContext(webgl))
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);

// Create camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;
controls.update(); //controls.update() must be called after any manual changes to the camera's transform

// Adds a canvas element with that context to the HTML body
document.body.appendChild(renderer.domElement);

// Creates a cylinder
// const geometry = new THREE.BoxGeometry();
const geometry = new THREE.CylinderGeometry(1, 1, 5, 32 );
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const phongMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00, shininess: 16 } );
const cylinder = new THREE.Mesh(geometry, phongMaterial);

// Examples of transformations
cylinder.position.x = 1;
cylinder.position.y = -1;
cylinder.rotation.z = 45;

scene.add(cylinder);

// White directional light at half intensity shining from the top.
const directionalLight = new THREE.DirectionalLight( 0xffffff, 1.0 );
directionalLight.target =
scene.add(directionalLight);

// Creates a point light source
const light1 = new THREE.PointLight( 0xffffff, 1, 100 );
light1.position.set(-1, -1, -1);
scene.add(light1);

// Creates a point light source
const light2 = new THREE.PointLight( 0x00ff00, 1, 100 );
light2.position.set(1, 1, 1);
scene.add(light2);

time = 0;
function draw() {
    requestAnimationFrame(draw);

    // Examples of animation
    cylinder.scale.y = Math.sin(time);
    time += 0.01;

    renderer.render(scene, camera);
}
draw();
