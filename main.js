//IMPORT MODULES
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import GUI, { Controller } from "lil-gui";

//CONSTANT & VARIABLES
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI PARAMETERS
var gui;
var widthController;
var heightController;
var depthController;
const parameters = {
  Board() {
    createBoard();
  },
  Beam() {
    createBeam();
  },
  Bar() {
    createBar();
  },
  delete() {
    deleteTransformedObject();
  },
  test() {
    hi();
  },
  export() {
    exportScene();
  },
  width: 0,
  height: 0,
  depth: 0,
  fileName: "exported_Model",
};

function hi() {
  //alert("Out of sight, out of mind");
  console.log(camera.position);
}

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var orbit;
var control;
var ambientLight;
var directionalLight;
var exporter;

//-- EXPORTER VARIABLES
const exporterOptions = { binary: true };

//-- RAYCASTER VARIABLES
let group;
let selectedObject = null;
const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
var transformedObject = null;

//-- GEOMETRY PARAMETERS
//Create an empty array for storing all the cubes
let sceneObjects = [];

let boardCounter = 1;
let beamCounter = 1;
let barCounter = 1;

function main() {
  //GUI
  gui = new GUI();
  gui.add(parameters, "test");
  //Add Objects
  const addObjectFolder = gui.addFolder("Add Objects");
  addObjectFolder.add(parameters, "Board");
  addObjectFolder.add(parameters, "Beam");
  addObjectFolder.add(parameters, "Bar");
  //Add Object Settings
  const selectedObjectFolder = gui.addFolder("Selected Object");
  widthController = selectedObjectFolder.add(parameters, "width");
  heightController = selectedObjectFolder.add(parameters, "height");
  depthController = selectedObjectFolder.add(parameters, "depth");
  selectedObjectFolder.add(parameters, "delete");

  //Add Export
  const exportFolder = gui.addFolder("Export");
  exportFolder.add(parameters, "fileName");
  exportFolder.add(parameters, "export");

  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);

  //CREATE SCENE AND CAMERA
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(15, width / height, 0.1, 2000);
  camera.position.set(200, 100, 170);

  //LIGHTINGS
  ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(2, 5, 5);
  directionalLight.target.position.set(-1, -1, 0);
  scene.add(directionalLight);
  scene.add(directionalLight.target);

  //GEOMETRY INITIATION
  // Initiate first cubes
  createGrid();

  //CREATE A RENDERER
  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container = document.querySelector("#threejs-container");
  let canvas = renderer.domElement;
  container.append(renderer.domElement);

  //RESPONSIVE WINDOW
  window.addEventListener("resize", handleResize);
  document.addEventListener("pointermove", onPointerMove);
  canvas.addEventListener("click", onClick);
  window.addEventListener("keydown", onKey);

  //RAYCASTER
  group = new THREE.Group();
  scene.add(group);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 2;
  orbit.maxDistance = 1000;

  //Exporter
  exporter = new STLExporter();

  //Transform selected Objects
  widthController.onChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.x = scaleFactor(
        parameters.width,
        transformedObject.geometry.parameters.width
      );
    }
  });

  heightController.onChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.y = scaleFactor(
        parameters.height,
        transformedObject.geometry.parameters.height
      );
    }
  });

  depthController.onChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.z = scaleFactor(
        parameters.depth,
        transformedObject.geometry.parameters.depth
      );
    }
  });

  control = new TransformControls(camera, renderer.domElement);
  control.addEventListener("change", animate);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  control.setMode("translate");
  control.setTranslationSnap(1);
  control.setSize(1.2);

  //EXECUTE THE UPDATE
  //animate();
}

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------
//GEOMETRY FUNCTIONS

// Create Grid
function createGrid() {
  scene.add(new THREE.GridHelper(100, 100, 0xd3d3d3, 0xd3d3d3));
  scene.add(new THREE.GridHelper(100, 10, 0x151515, 0x151515));
}

//BOARDS
//create Boards
function createBoard() {
  const geometry = new THREE.BoxGeometry(40, 2, 40);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const board = new THREE.Mesh(geometry, material);
  board.position.set(0, 1, 0);
  board.name = "board " + boardCounter;
  boardCounter++;
  sceneObjects.push(board);

  scene.add(board);
  group.add(board);
  animate();
}

//Beams
//create Beams
function createBeam() {
  const geometry = new THREE.BoxGeometry(40, 2, 2);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const beam = new THREE.Mesh(geometry, material);
  beam.position.set(0, 1, 0);
  beam.name = "beam " + beamCounter;
  beamCounter++;
  sceneObjects.push(beam);

  scene.add(beam);
  group.add(beam);
  animate();
}

//BARS
//create Bars
function createBar() {
  const geometry = new THREE.CylinderGeometry(1, 1, 40, 32);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const bar = new THREE.Mesh(geometry, material);
  bar.position.set(0, 1, 0);
  bar.rotation.set(90 * (Math.PI / 180), 0, 90 * (Math.PI / 180));
  bar.name = "bar " + beamCounter;
  barCounter++;
  sceneObjects.push(bar);

  scene.add(bar);
  group.add(bar);
  animate();
}

//Remove 3D Objects and clean the caches
function removeObject(sceneObject) {
  if (!(sceneObject instanceof THREE.Object3D)) return;

  //Remove the geometry to free GPU resources
  if (sceneObject.geometry) sceneObject.geometry.dispose();

  //Remove the material to free GPU resources
  if (sceneObject.material) {
    if (sceneObject.material instanceof Array) {
      sceneObject.material.forEach((material) => material.dispose());
    } else {
      sceneObject.material.dispose();
    }
  }

  //Remove object from scene
  sceneObject.removeFromParent();
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

//RAYCAST
function onPointerMove(event) {
  if (selectedObject) {
    if (selectedObject !== transformedObject) {
      selectedObject.material.color.set("#69f");
    }
    selectedObject = null;
  }

  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObject(group, true);

  if (intersects.length > 0) {
    const res = intersects.filter(function (res) {
      return res && res.object;
    })[0];

    if (res && res.object) {
      selectedObject = res.object;
      if (selectedObject !== transformedObject) {
        selectedObject.material.color.set("#f00");
      }
    }
  }
}

//CLICK

function onClick() {
  if (selectedObject) {
    transformedObject = selectedObject;
    transformedObject.material.color.set("#ff0");
    parameters.width = transformedObject.geometry.parameters.width;
    parameters.height = transformedObject.geometry.parameters.height;
    parameters.depth = transformedObject.geometry.parameters.depth;
    widthController.updateDisplay();
    heightController.updateDisplay();
    depthController.updateDisplay();
    control.attach(transformedObject);
    scene.add(control);
  } else if (transformedObject) {
    deselectTransformedObject();
  }
}

function onKey() {
  if (event.key === "Escape" || event.keyCode === 27) {
    deselectTransformedObject();
  }
  if (event.key === "Backspace" || event.keyCode === 8) {
    deleteTransformedObject();
  }
}

function scaleFactor(newValue, oldValue) {
  return newValue / oldValue;
}

function deleteTransformedObject() {
  removeObject(transformedObject);
  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);
  scene.remove(control);
}

function deselectTransformedObject() {
  transformedObject.material.color.set("#69f");
  transformedObject = null;
  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);
  scene.remove(control);
}

function exportScene() {
  //Started Troubleshooting Alignment

  /*const quaternion = new THREE.Quaternion().setFromEuler(
    new THREE.Euler(-Math.PI / 2, 0, 0)
  );
  scene.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.applyQuaternion(quaternion);
    }
  });
  */
  const download = exporter.parse(scene, exporterOptions);
  const blob = new Blob([download], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = parameters.fileName + ".stl";
  link.click();
  return;
}

//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame(animate);

  orbit.update();

  renderer.render(scene, camera);
}
//-----------------------------------------------------------------------------------
// CLASS
//-----------------------------------------------------------------------------------

//-----------------------------------------------------------------------------------
// EXECUTE MAIN
//-----------------------------------------------------------------------------------

main();
