// Base code used for particles creation:
// https://threejs.org/examples/webgl_points_waves.html
const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50;

let container;
let camera, scene, renderer;

let particles, count = 0;

let windowHalfX = window.innerWidth / 2;
let windowHalfY = window.innerHeight / 2;

container = document.createElement( 'div' );
document.body.appendChild( container );

camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 3000, 3000, 3000 );

scene = new THREE.Scene();

const numParticles = AMOUNTX * AMOUNTY;

const positions = new Float32Array( numParticles * 3 ); // 3 vertices per particle
const scales = new Float32Array( numParticles );


let i = 0, j = 0;
// Calculate positions and scales of particles
for ( let ix = 0; ix < AMOUNTX; ix ++ ) {

    for ( let iy = 0; iy < AMOUNTY; iy ++ ) {

        positions[ i ] = ix * SEPARATION - ( ( AMOUNTX * SEPARATION ) / 2 ); // x
        positions[ i + 1 ] = 0; // y
        positions[ i + 2 ] = iy * SEPARATION - ( ( AMOUNTY * SEPARATION ) / 2 ); // z

        scales[ j ] = 1;

        i += 3;
        j ++;

    }

}

const particleGeometry = new THREE.BufferGeometry();
particleGeometry.setAttribute( 'position', new THREE.BufferAttribute( positions, 3 ) );
particleGeometry.setAttribute( 'scale', new THREE.BufferAttribute( scales, 1 ) );

const particleMaterial = new THREE.ShaderMaterial( {
    uniforms: {
        color: { value: new THREE.Color( 0x00ead3 ) },
    },
    vertexShader: document.getElementById( 'vertexshader' ).textContent,
    fragmentShader: document.getElementById( 'fragmentshader' ).textContent

} );

particles = new THREE.Points( particleGeometry, particleMaterial );
scene.add( particles );

//

renderer = new THREE.WebGLRenderer( { antialias: true , preserveDrawingBuffer: true } );
renderer.setPixelRatio( window.devicePixelRatio );
renderer.setSize( window.innerWidth, window.innerHeight );
container.appendChild( renderer.domElement );
// const composer = new EffectComposer( renderer );
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.update();
// stats = new Stats();
// container.appendChild( stats.dom );

container.style.touchAction = 'none';


function play() {
    function draw() {
    
        requestAnimationFrame( draw );
    
        moveParticles(particles, count);
    
        renderer.render( scene, camera );
    
        count += 0.1;
        // stats.update();
    
    }
    
    function moveParticles(particles, count) {
        const positions = particles.geometry.attributes.position.array;
        const scales = particles.geometry.attributes.scale.array;
    
        let i = 0, j = 0;
        // Update positions and scales of particles
        for ( let ix = 0; ix < AMOUNTX; ix ++ ) {
    
            for ( let iy = 0; iy < AMOUNTY; iy ++ ) {
    
                positions[ i + 1 ] = ( Math.sin( ( ix + count ) * 0.3 ) * 50 ) +
                                ( Math.sin( ( iy + count ) * 0.5 ) * 50 );
    
                scales[ j ] = ( Math.sin( ( ix + count ) * 0.3 ) + 1 ) * 20 +
                                ( Math.sin( ( iy + count ) * 0.5 ) + 1 ) * 20;
    
                i += 3;
                j ++;
    
            }
    
        }
    
        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;
    }

    draw();
}

play();