/* 
ASG 5
Andy Choi
Sammy Siu
6/6/21
Adapted from Music Visualizer by Prakhar Bhardwaj and Lab5 by TA Lucas
*/

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

/* Adapted from Music Visualizer by Prakhar Bhardwaj */
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
        cylinder.scale.y = Math.sin(lowerAvgFr);
        time += 0.01;

        makeRough(cylinder, modulate(Math.pow(lowerMaxFr, 0.8), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));
    
        renderer.render(scene, camera);
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
    draw();
    audio.play();
}
