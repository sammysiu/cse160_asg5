/* 
ASG 5
Andy Choi
Sammy Siu
6/6/21
Adapted from Music Visualizer by Prakhar Bhardwaj and Lab5 by TA Lucas
*/

// Base code used for particles creation:
// https://threejs.org/examples/webgl_points_waves.html
const SEPARATION = 100, AMOUNTX = 50, AMOUNTY = 50, SCALE = 10;

/* Copied from Music Visualizer by Prakhar Bhardwaj */
//initialise simplex noise instance
var noise = new SimplexNoise();
var file = document.getElementById("audioFile");
var audio = document.getElementById("audio");
var fileLabel = document.querySelector("label.file");

document.onload = function(e) {
    console.log(e);
    audio.play();
    play();
}

file.onchange = function() {
    fileLabel.classList.add('normal');
    audio.classList.add('active');
    var files = this.files;

    // get the audio file form the possible array of files, the user uploaded
    audio.src = URL.createObjectURL(files[0]);
    // load the file, and then play it - all using HTML5 audio element's API
    audio.load();
    audio.play();
    play();
}

//some helper functions here
function fractionate(val, minVal, maxVal) {
    return (val - minVal)/(maxVal - minVal);
}

function modulate(val, minVal, maxVal, outMin, outMax) {
    var fr = fractionate(val, minVal, maxVal);
    var delta = outMax - outMin;
    return outMin + (fr * delta);
}

function avg(arr){
    var total = arr.reduce(function(sum, b) { return sum + b; });
    return (total / arr.length);
}

function max(arr){
    return arr.reduce(function(a, b){ return Math.max(a, b); })
}
/************************************************/



const scene = new THREE.Scene();

// const camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
// const camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0.1, 1000 );
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 1, 10000 );
camera.position.set( 3000, 3000, 3000 );

// Creates a rendering context (similar to canvas.getContext(webgl))
const renderer = new THREE.WebGLRenderer();
// renderer = new THREE.WebGLRenderer( { antialias: true , preserveDrawingBuffer: true } );
renderer.setSize(window.innerWidth, window.innerHeight);

// const composer = new EffectComposer( renderer );

// Create camera controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
camera.position.z = 10;
controls.update(); //controls.update() must be called after any manual changes to the camera's transform

// stats = new Stats();

// Adds a canvas element with that context to the HTML body
document.body.appendChild(renderer.domElement);



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

// Creates particles
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
const particles = new THREE.Points( particleGeometry, particleMaterial );
scene.add( particles );



// Creates a cylinder
// const geometry = new THREE.BoxGeometry();
const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 5, 32);
// const material = new THREE.MeshBasicMaterial( { color: 0xff0000 } );
const phongMaterial = new THREE.MeshPhongMaterial( { color: 0xffff00, shininess: 16 } );
const cylinder = new THREE.Mesh(cylinderGeometry, phongMaterial);

// Examples of transformations
cylinder.position.x = 0;
cylinder.position.y = 0;
cylinder.position.z = 100;

cylinder.rotation.x = 0;
cylinder.rotation.y = 90;
cylinder.rotation.z = 0;

cylinder.scale.x = SCALE;
cylinder.scale.y = SCALE;
cylinder.scale.z = SCALE;

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
count = 0;

function play() {
    /*
    Enter WebAudio API
    */
    var context = new AudioContext();   // create context
    var src = context.createMediaElementSource(audio);  //create src inside ctx
    var analyser = context.createAnalyser();    //create analyser in ctx
    src.connect(analyser);  //connect analyser node to the src
    analyser.connect(context.destination);  // connect the destination node to the analyser
    analyser.fftSize = 512;
    var bufferLength = analyser.frequencyBinCount;
    var dataArray = new Uint8Array(bufferLength);

    function draw() {
        requestAnimationFrame(draw);

        analyser.getByteFrequencyData(dataArray);
        // slice the array into two halves
        var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
        var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

        var overallAvg = avg(dataArray);
        // do some basic reductions/normalisations
        var lowerMax = max(lowerHalfArray);
        var lowerAvg = avg(lowerHalfArray);
        var upperMax = max(upperHalfArray);
        var upperAvg = avg(upperHalfArray);

        var lowerMaxFr = lowerMax / lowerHalfArray.length;
        var lowerAvgFr = lowerAvg / lowerHalfArray.length;
        var upperMaxFr = upperMax / upperHalfArray.length;
        var upperAvgFr = upperAvg / upperHalfArray.length;
        /************************************************/
    
        // Examples of animation
        cylinder.scale.y = Math.sin(lowerAvgFr) * SCALE;
        //cylinder.geometry.attributes.scale.needsUpdate = true;
        time += 0.01;

        makeRough(cylinder, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

        moveParticles(particles, count);
        
        count += 0.1;
    
        renderer.render(scene, camera);
        // stats.update();
    }
    
    /* Adapted from Music Visualizer by Prakhar Bhardwaj */
    function makeRough(mesh, bassFr, treFr) {
        for (let i = 0; i < mesh.geometry.attributes.position.array.length; i += 3) {
            let x = mesh.geometry.attributes.position.array[i];
            let y = mesh.geometry.attributes.position.array[i + 1];
            let z = mesh.geometry.attributes.position.array[i + 2];
    
            let vertex = new THREE.Vector3(x, y, z);
    
            let offset = (mesh.geometry.parameters.radiusTop);
            let amp = 1;
            let time = window.performance.now();
            vertex.normalize();
            let rf = 0.00001;
            let distance = (offset + bassFr ) + noise.noise3D(x + time * rf * 7, y + time * rf * 8, z + time * rf * 9) * amp * treFr;
    
            vertex.multiplyScalar(distance);
    
            mesh.geometry.attributes.position.array[i] = vertex.x;
            mesh.geometry.attributes.position.array[i + 1] = vertex.y;
            mesh.geometry.attributes.position.array[i + 2] = vertex.z;
    
        }
        mesh.geometry.attributes.position.needsUpdate = true;
        mesh.geometry.attributes.normal.needsUpdate = true;
        mesh.geometry.computeVertexNormals();
        // mesh.geometry.computeFaceNormals();
    }
    /************************************************/
    
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
    audio.play();
}
