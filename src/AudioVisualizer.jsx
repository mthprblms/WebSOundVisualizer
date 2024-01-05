import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const AudioVisualizer = () => {
  const visualsCanvasRef = useRef(null);
  let analyser;

  useEffect(() => {
    const visualsCanvas = visualsCanvasRef.current;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas: visualsCanvas });
    renderer.setSize(window.innerWidth, window.innerHeight);

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    let audioSourceNode;

    const cubes = [];
    const spheres = [];

    // Create a textured material for the background
    const backgroundGeometry = new THREE.PlaneGeometry(400, 400); // Adjust the size of the plane
    const backgroundTexture = new THREE.TextureLoader().load('geometric.jpg'); // Replace with your texture image
    const backgroundMaterial = new THREE.MeshBasicMaterial({ map: backgroundTexture, side: THREE.DoubleSide });
    const background = new THREE.Mesh(backgroundGeometry, backgroundMaterial);
    scene.add(background);

    // Create multiple cubes and icospheres and add them to the scene
    for (let i = 0; i < 5; i++) {
      const cubeGeometry = new THREE.BoxGeometry();
      const cubeMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x00ff00 });
      const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);

      cube.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10); // Adjust the range of positions
      cubes.push(cube);
      scene.add(cube);

      const sphereGeometry = new THREE.IcosahedronGeometry(1, 3);
      const sphereMaterial = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x00ff00, wireframe: true });
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

      sphere.position.set(Math.random() * 20 - 10, Math.random() * 20 - 10, Math.random() * 20 - 10); // Adjust the range of positions
      spheres.push(sphere);
      scene.add(sphere);
    }

    function animate() {
      requestAnimationFrame(animate);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);

      // Update each cube and icosphere based on frequency data
      cubes.concat(spheres).forEach((object, index) => {
        const scale = 1 + dataArray[index] / 100;
        object.scale.set(scale, scale, scale);

        object.rotation.x += 0.005;
        object.rotation.y += 0.005;

        object.material.emissive.setRGB(dataArray[index] / 255, dataArray[(index + 50) % 256] / 255, dataArray[(index + 100) % 256] / 255);
      });

      // Rotate background
      background.rotation.z += 0.005;

      renderer.render(scene, camera);
    }

    camera.position.z = 30; // Move the camera further back

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioSourceNode = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        audioSourceNode.connect(analyser);

        analyser.fftSize = 256;

        animate();
      })
      .catch((error) => {
        console.error('Error accessing microphone:', error);
      });

    return () => {
      if (audioSourceNode) {
        audioSourceNode.disconnect();
      }
      if (analyser) {
        analyser.disconnect();
      }
    };
  }, []);

  return <canvas ref={visualsCanvasRef}></canvas>;
};

export default AudioVisualizer;