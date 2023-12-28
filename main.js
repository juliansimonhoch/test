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
  addBoard() { createBoard()},
  addBeam() { createBeam()},
  addBar() { createBar()},
  test() { hi() },
}


function hi(){
  alert( 'heyo' );
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
let sceneCubes = [];
let resX = parameters.resolutionX;
let rotX = parameters.rotationX;

function main(){
  //GUI
  gui = new GUI;
  gui.add(parameters, 'test');

  const addObjectFolder = gui.addFolder('Add Objects');
  addObjectFolder.add(parameters, 'addBoard');
  addObjectFolder.add(parameters, 'addBeam');
  addObjectFolder.add(parameters, 'addBar');
  
  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera( 15, width / height, 0.1, 100);
  camera.position.set(10, 10, 10)

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
// Create Cubes
function createGrid(){
  scene.add( new THREE.GridHelper( 5, 10, 0x888888, 0x444444 ) );
}

//BOARDS
//create Boards
function createBoard(){
  for(let i=0; i<5; i++){
    const geometry = new THREE.BoxGeometry(0.1, 1,1);
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color(0xffffff);
    material.color.setRGB(0,0,Math.random());

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i*0.1, 0, 0);
    cube.name = "cube " + i;
    sceneCubes.push(cube);

    scene.add(cube);
  }
  animate();
}

//Transform Boards
function transformBoard(){
  sceneCubes.forEach((element, index)=>{
    let scene_cube = scene.getObjectByName(element.name);
    let radian_rot = (index*(rotX/resX)) * (Math.PI/180);
    scene_cube.rotation.set(radian_rot, 0, 0)
    rotX = parameters.rotationX;
  })
}


//Beams
//create Beams
function createBeam(){
  for(let i=0; i<resX; i++){
    const geometry = new THREE.BoxGeometry(0.1, 1,1);
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color(0xffffff);
    material.color.setRGB(0,0,Math.random());

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i*0.1, 0, 0);
    cube.name = "cube " + i;
    sceneCubes.push(cube);

    scene.add(cube);
  }
}

//Transform Beams
function transformBeam(){
  sceneCubes.forEach((element, index)=>{
    let scene_cube = scene.getObjectByName(element.name);
    let radian_rot = (index*(rotX/resX)) * (Math.PI/180);
    scene_cube.rotation.set(radian_rot, 0, 0)
    rotX = parameters.rotationX;
  })
}


//BARS
//create Bars
function createBar(){
  for(let i=0; i<resX; i++){
    const geometry = new THREE.BoxGeometry(0.1, 1,1);
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color(0xffffff);
    material.color.setRGB(0,0,Math.random());

    const cube = new THREE.Mesh(geometry, material);
    cube.position.set(i*0.1, 0, 0);
    cube.name = "cube " + i;
    sceneCubes.push(cube);

    scene.add(cube);
  }
}

//Transform Bars
function transformBar(){
  sceneCubes.forEach((element, index)=>{
    let scene_cube = scene.getObjectByName(element.name);
    let radian_rot = (index*(rotX/resX)) * (Math.PI/180);
    scene_cube.rotation.set(radian_rot, 0, 0)
    rotX = parameters.rotationX;
  })
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
  resX = parameters.resolutionX;
  rotX = parameters.rotationX;

  sceneCubes.forEach(element =>{
    let scene_cube = scene.getObjectByName(element.name);
    removeObject(scene_cube);
  })

  sceneCubes = [];
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

  if(resX != parameters.resolutionX){
    removeCubes();
    createCubes();
    rotateCubes();
  }

  if (rotX != parameters.rotationX){
    rotateCubes();
  }
 
	renderer.render( scene, camera );
}
//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------


//-----------------------------------------------------------------------------------
// EXECUTE MAIN 
//-----------------------------------------------------------------------------------

main();