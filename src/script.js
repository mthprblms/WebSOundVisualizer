document.addEventListener('DOMContentLoaded', function () {
    const visualsCanvas = document.getElementById('visuals');
  
    // Set up Three.js scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: visualsCanvas });
    renderer.setSize(window.innerWidth, window.innerHeight);
  
    // Create a geometry (e.g., a cube)
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);
  
    // Set up Web Audio API
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let analyser;
  
    // Get user's microphone input
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        const source = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        analyser.fftSize = 256;
  
        // Animation loop
        function animate() {
          requestAnimationFrame(animate);
  
          // Get frequency data
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);
  
          // Use dataArray for visual effects (e.g., update cube position)
          cube.position.y = dataArray[100] / 20;
  
          // Render the scene
          renderer.render(scene, camera);
        }
  
        // Set up camera position
        camera.position.z = 5;
  
        // Add cube to the scene
        scene.add(cube);
  
        // Start the animation loop
        animate();
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });
  });