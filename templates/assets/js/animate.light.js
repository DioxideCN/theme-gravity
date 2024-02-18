var container, vertexShader, fragmentShader, camera, scene, renderer, uniforms;
container = document.getElementById('hero-light--container');
vertexShader = document.getElementById('vertexShader');
fragmentShader = document.getElementById('fragmentShader');

if (vertexShader && fragmentShader) {
    init();
    animate();
}

function init() {
    camera = new THREE.Camera();
    camera.position.z = 1;
    scene = new THREE.Scene();
    var geometry = new THREE.PlaneBufferGeometry(2, 2);
    uniforms = {
        time: {type: "f", value: 1.0},
        resolution: {type: "v2", value: new THREE.Vector2()}
    };
    var material = new THREE.ShaderMaterial( {
        uniforms: uniforms,
        vertexShader: vertexShader.textContent,
        fragmentShader: fragmentShader.textContent
    });
    var mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    onWindowResize();
    window.addEventListener('resize', onWindowResize, false);
}
function onWindowResize(event) {
    renderer.setSize(window.innerWidth, window.innerHeight);
    uniforms.resolution.value.x = renderer.domElement.width;
    uniforms.resolution.value.y = renderer.domElement.height;
}
function animate() {
    requestAnimationFrame(animate);
    render();
}
function render() {
    uniforms.time.value += 0.05;
    renderer.render(scene, camera);
}