//IMPORT MODULES
import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import GUI from 'lil-gui';

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI PARAMETERS
var gui;
const parameters = {
  Board() { createBoard()},
  Beam() { createBeam()},
  Bar() { createBar()},
  test() { hi() },
}


function hi(){
  alert( 'Booom, das funktioniert schonmal!' );
}

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var control;
var ambientLight;
var directionalLight;

//-- GEOMETRY PARAMETERS
//Create an empty array for storing all the cubes
let sceneObjects = [];

let boardCounter = 1;
let beamCounter = 1;
let barCounter = 1;

function main(){
  //GUI
  gui = new GUI;
  gui.add(parameters, 'test');
  //Add Objects
  const addObjectFolder = gui.addFolder('Add Objects');
  addObjectFolder.add(parameters, 'Board');
  addObjectFolder.add(parameters, 'Beam');
  addObjectFolder.add(parameters, 'Bar');
  
  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 1000);
  camera.position.set(200, 100, 170)

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight( 0xffffff, 1);
  directionalLight.position.set(2,5,5);
  directionalLight.target.position.set(-1,-1,0);
  scene.add( directionalLight );
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION
  // Initiate first cubes
  createGrid();

  //RESPONSIVE WINDOW
  window.addEventListener('resize', handleResize);
 
  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setSize( window.innerWidth, window.innerHeight );
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector('#threejs-container');
  container.append(renderer.domElement);
  
  //CREATE MOUSE CONTROL
  control = new OrbitControls( camera, renderer.domElement );

  //EXECUTE THE UPDATE
  animate();
}
 
//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------
//GEOMETRY FUNCTIONS


// Create Grid
function createGrid(){
  scene.add( new THREE.GridHelper( 100, 100, 0xd3d3d3 , 0xd3d3d3 ) );
  scene.add( new THREE.GridHelper( 100, 10, 0x151515 , 0x151515 ) );
}

//BOARDS
//create Boards
function createBoard(){
  const geometry = new THREE.BoxGeometry(40, 2, 40);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color(0x7BAFD4);

  const board = new THREE.Mesh(geometry, material);
  board.position.set(0, 1, 0);
  board.name = "board " + boardCounter;
  boardCounter ++;
  sceneObjects.push(board);

  scene.add(board);
  animate();
}

//Transform Boards
function transformBoard(){

}


//Beams
//create Beams
function createBeam(){
  const geometry = new THREE.BoxGeometry(40, 2, 2);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color(0x7BAFD4);

  const beam = new THREE.Mesh(geometry, material);
  beam.position.set(0, 1, 0);
  beam.name = "beam " + beamCounter;
  beamCounter ++;
  sceneObjects.push(beam);

  scene.add(beam);
  animate();
}

//Transform Beams
function transformBeam(){

}


//BARS
//create Bars
function createBar(){
  const geometry = new THREE.CylinderGeometry( 1, 1, 40, 32 );
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color(0x7BAFD4);

  const bar = new THREE.Mesh(geometry, material);
  bar.position.set(0, 1, 0);
  bar.rotation.set(90 * (Math.PI/180), 0, 90 * (Math.PI/180));
  bar.name = "bar " + beamCounter;
  barCounter ++;
  sceneObjects.push(bar);

  scene.add(bar);
  animate();
}

//Transform Bars
function transformBar(){

}


//Remove 3D Objects and clean the caches
function removeObject(sceneObject){
  if (!(sceneObject instanceof THREE.Object3D)) return;

  //Remove the geometry to free GPU resources
  if(sceneObject.geometry) sceneObject.geometry.dispose();

  //Remove the material to free GPU resources
  if(sceneObject.material){
    if (sceneObject.material instanceof Array) {
      sceneObject.material.forEach(material => material.dispose());
    } else {
        sceneObject.material.dispose();
    }
  }

  //Remove object from scene
  sceneObject.removeFromParent();
}

//Remove the cubes
function removeCubes(){

}

//RESPONSIVE
function handleResize() {
  width = window.innerWidth;
  height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.render(scene, camera);
}


//ANIMATE AND RENDER
function animate() {
	requestAnimationFrame( animate );
 
  control.update();
 
	renderer.render( scene, camera );
}
//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();