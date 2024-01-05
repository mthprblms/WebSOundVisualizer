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

    const cubes = []; // Array to store cube objects

    navigator.mediaDevices.getUserMedia({ audio: true })
      .then((stream) => {
        audioSourceNode = audioContext.createMediaStreamSource(stream);
        analyser = audioContext.createAnalyser();
        audioSourceNode.connect(analyser);

        analyser.fftSize = 256;

        // Create multiple cubes and add them to the scene
        for (let i = 0; i < 5; i++) {
          const geometry = new THREE.BoxGeometry();
          const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff, emissive: 0x00ff00 });
          const cube = new THREE.Mesh(geometry, material);

          cube.position.set(Math.random() * 10 - 5, Math.random() * 10 - 5, Math.random() * 10 - 5);
          cubes.push(cube);
          scene.add(cube);
        }

        function animate() {
          requestAnimationFrame(animate);

          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);

          // Update each cube based on frequency data
          cubes.forEach((cube, index) => {
            const scale = 1 + dataArray[index] / 100;
            cube.scale.set(scale, scale, scale);

            cube.rotation.x += 0.005;
            cube.rotation.y += 0.005;

            cube.material.emissive.setRGB(dataArray[index] / 255, dataArray[(index + 50) % 256] / 255, dataArray[(index + 100) % 256] / 255);

            // Collision logic
            cubes.forEach((otherCube, otherIndex) => {
              if (index !== otherIndex) {
                const distance = cube.position.distanceTo(otherCube.position);
                if (distance < 1) {
                  // Bounce off each other
                  cube.position.x += Math.random() * 0.1 - 0.05;
                  cube.position.y += Math.random() * 0.1 - 0.05;
                  cube.position.z += Math.random() * 0.1 - 0.05;
                }
              }
            });
          });

          renderer.render(scene, camera);
        }

        camera.position.z = 15;

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