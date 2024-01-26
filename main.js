//IMPORT MODULES
import "./style.css";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { STLExporter } from "three/addons/exporters/STLExporter.js";
import GUI from "lil-gui";
import { LoopSubdivision } from "./LoopSubdivision.js";
import { CSG } from "./THREE-CSGMesh/dist/client/CSGMesh.js";

//CONSTANT & VARIABLES

const iterations = 1;

const params = {
  split: true, // optional, default: true
  uvSmooth: true, // optional, default: false
  preserveEdges: true, // optional, default: false
  flatOnly: false, // optional, default: false
  maxTriangles: Infinity, // optional, default: Infinity
};

//-- WINDOW
let width = window.innerWidth;
let height = window.innerHeight;

//-- GUI
var gui;
var widthController;
var heightController;
var depthController;
var formatController;
var diameterController;

//-- GUI PARAMETER

const parameters = {
  width: 0,
  height: 0,
  depth: 0,
  diameter: 0,
  format: "square",
  fileName: "exported_Model",
  Board() {
    createBoard();
  },
  Beam() {
    createBeam();
  },
  Bar() {
    createBar();
  },
  Joint() {
    createJoint();
  },
  delete() {
    deleteTransformedObject();
  },
  export() {
    exportScene();
  },
  move() {
    moveMode();
  },
  rotate() {
    rotateMode();
  },
  Add() {
    addMaterialToLibrary();
  },
};

//-- SCENE VARIABLES
var scene;
var camera;
var renderer;
var container;
var orbit;
var control;
var ambientLight;
var directionalLight;

//-- EXPORTER VARIABLES
const exporterOptions = { binary: true };
var exporter;

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
let jointCounter = 1;
let jointGroup;

//-----------------------------------------------------------------------------------
// LANDING PAGE
//----------------------------------------------------------------------------------

// Create landing page dynamically

const landingPage = document.createElement("div");
landingPage.id = "landing-page";
landingPage.style.position = "absolute";
landingPage.style.top = "0";
landingPage.style.left = "0";
landingPage.style.right = "0";
landingPage.style.bottom = "0";
landingPage.style.display = "flex";
landingPage.style.flexDirection = "column";
landingPage.style.alignItems = "center";
landingPage.style.justifyContent = "center";
landingPage.style.textAlign = "center";
landingPage.style.color = "#333";
landingPage.style.backgroundColor = "white";

const logoEmbed = document.createElement("embed");
logoEmbed.src = "./pubic/logo.svg";
logoEmbed.style.position = "absolute";
logoEmbed.style.top = "calc(5% - 0px)";
logoEmbed.style.left = "calc(5% - 0px)";
logoEmbed.style.width = "50px";
logoEmbed.style.height = "auto";
landingPage.appendChild(logoEmbed);

const logoICD = document.createElement("embed");
logoICD.src = "./pubic/ICD-LOGO.png";
logoICD.style.position = "absolute";
logoICD.style.top = "calc(95% - 0px)";
logoICD.style.left = "calc(1% - 0px)";
logoICD.style.width = "60px";
logoICD.style.height = "auto";
landingPage.appendChild(logoICD);

const title = document.createElement("h1");
title.id = "title";
title.innerText = "ReFurnish3d";
title.style.fontSize = "44px";
title.style.position = "absolute";
title.style.color = "black";
title.style.border = "none";
title.style.borderRadius = "5px";
title.style.top = "calc(5% - 28px)";
title.style.left = "calc(5% + 70px)";
title.style.fontFamily = "Josefin Sans, Arial, sans-serif";


const names = document.createElement("n1");
names.id = "names";
names.innerText = "a project by Lennart Dolderer, Julian Hoch, Elias Röhner, Timo Sawitzky";
names.style.fontSize = "16px";
names.style.position = "absolute";
names.style.color = "#666666";
names.style.border = "none";
names.style.borderRadius = "5px";
names.style.top = "calc(5% + 20px)";
names.style.left = "calc(5% + 330px)";
names.style.fontFamily = "Montserrat, Arial, sans-serif";
names.style.fontWeight = 600;

const uni = document.createElement("u1");
uni.id = "uni";
uni.innerText = "Supervision: Tenure-Track Prof. Dr. Thomas Wortmann  |  Tutors: Zuardin Akbar, Gili Ron  |  WS23/24  |  B.Sc. Architecture and Urban Planning  |  5th semester";
uni.style.fontSize = "12px";
uni.style.position = "absolute";
uni.style.color = "#666666";
uni.style.border = "none";
uni.style.borderRadius = "5px";
uni.style.top = "calc(96% + 0px)";
uni.style.left = "calc(5% + 0px)";
uni.style.fontFamily = "Montserrat, Arial, sans-serif";
uni.style.fontWeight = 500;


// const manual = document.createElement("m1");
// manual.id = "manual";
// manual.innerText = "Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. \n Duis autem vel eum iriure dolor in hendrerit in vulputate velit esse molestie consequat, vel illum dolore eu feugiat nulla facilisis at vero eros et accumsan et iusto odio dignissim qui blandit praesent luptatum zzril delenit augue duis dolore te feugait nulla facilisi. Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat. ";
// manual.style.fontSize = "20px";
// manual.style.position = "absolute";
// manual.style.color = "#666666";
// manual.style.border = "none";
// manual.style.borderRadius = "5px";
// manual.style.top = "calc(40% + 0px)";
// manual.style.left = "calc(5% + 0px)";
// manual.style.width = "calc(90% + 0px)";
// manual.style.fontFamily = "Montserrat, Arial, sans-serif";
// manual.style.fontWeight = 400;

const logoManual = document.createElement("embed");
logoManual.src = "./pubic/manual test.svg";
logoManual.style.position = "absolute";
logoManual.style.top = "calc(40% - 0px)";
logoManual.style.left = "calc(25% - 0px)";
logoManual.style.width = "1000px";
logoManual.style.height = "auto";
landingPage.appendChild(logoManual);


const createProjectButton = document.createElement("button");
createProjectButton.id = "create-project-button";
createProjectButton.innerText = "Refurnish!";
createProjectButton.style.padding = "15px 30px";
createProjectButton.style.fontSize = "18px";
createProjectButton.style.cursor = "pointer";
createProjectButton.style.backgroundColor = "#666666";
createProjectButton.style.color = "white";
createProjectButton.style.border = "none";
createProjectButton.style.borderRadius = "5px";
createProjectButton.style.position = "absolute";
createProjectButton.style.top = "calc(80% + 0px)";
createProjectButton.style.fontFamily = "Montserrat, sans-serif";
createProjectButton.onclick = function(event) {
  event.preventDefault();
  showProject();
}

landingPage.appendChild(title);
landingPage.appendChild(names);
landingPage.appendChild(uni);
// landingPage.appendChild(manual);
landingPage.appendChild(createProjectButton);
document.body.appendChild(landingPage);

const threejsContainer2 = document.createElement("div");
threejsContainer2.id = "threejs-container2";
threejsContainer2.style.display = "none";
threejsContainer2.style.height = "100vh";
document.body.appendChild(threejsContainer2);

const threejsContainer = document.createElement("div");
threejsContainer.id = "threejs-container";
threejsContainer.style.display = "none";
threejsContainer.style.height = "100vh";
document.body.appendChild(threejsContainer);


function showProject() {
  landingPage.style.position = "fixed";
  landingPage.style.width = "100%";
  landingPage.style.height = "100%";
  landingPage.style.overflow = "hidden";
  landingPage.style.display = "none";
  threejsContainer.style.display = "block";
  threejsContainer2.style.display = "block";
  threejsContainer2.appendChild(title);
  threejsContainer2.appendChild(logoEmbed);
  gui.domElement.style.display = "block";
}

//-----------------------------------------------------------------------------------
// MAIN
//-----------------------------------------------------------------------------------
function main() {
 //GUI
 gui = new GUI();


 // Hide the GUI controls initially
 gui.domElement.style.display = 'none';

  //Add Objects
  const addObjectFolder = gui.addFolder("Add Objects");
  formatController= addObjectFolder.add(parameters, "format", ["square", "round"]);
  widthController = addObjectFolder.add(parameters, "width");
  heightController = addObjectFolder.add(parameters, "height");
  depthController = addObjectFolder.add(parameters, "depth");
  diameterController = addObjectFolder.add(parameters, "diameter");

  
  addObjectFolder.add(parameters, "Add");
  const libraryFolder = gui.addFolder("Spare parts library");
 

  //Add Object Settings
  const selectedObjectFolder = gui.addFolder("Selected Object");
  selectedObjectFolder.add(parameters, "move");
  selectedObjectFolder.add(parameters, "rotate");
  
 
  
  selectedObjectFolder.add(parameters, "delete");

  //Add Export
  const exportFolder = gui.addFolder("Export");
  exportFolder.add(parameters, "fileName");
  exportFolder.add(parameters, "export");

  //Add Library
  

  //set Controller Value
  widthController.setValue(null);
  heightController.setValue(null);
  depthController.setValue(null);

  diameterController.show(false);

  formatController.onFinishChange(function(v){
    if(v=="round"){
      widthController.show(false);
      depthController.show(false);
      diameterController.show(true);
    }
    if(v=="square"){
      widthController.show(true);
      depthController.show(true);
      diameterController.show(false);
    }
  });
  
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
  // Create Base Grid
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
  window.addEventListener("keyup", upKey);

  //RAYCASTER
  group = new THREE.Group();
  jointGroup = new THREE.Group();
  scene.add(group);
  scene.add(jointGroup);
  orbit = new OrbitControls(camera, renderer.domElement);
  orbit.minDistance = 2;
  orbit.maxDistance = 1000;

  //Exporter
  exporter = new STLExporter();

  //Transform selected Objects
  widthController.onFinishChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.x =
        parameters.width / transformedObject.geometry.parameters.width;
    }
  });

  heightController.onFinishChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.y =
        parameters.width / transformedObject.geometry.parameters.width;
    }
  });

  depthController.onFinishChange(function (v) {
    if (transformedObject != null) {
      transformedObject.scale.z =
        parameters.width / transformedObject.geometry.parameters.width;
    }
  });

  control = new TransformControls(camera, renderer.domElement);
  //Die folgende Zeile lässt iwie alles ruckeln???

  //control.addEventListener("change", animate);

  control.addEventListener("dragging-changed", function (event) {
    orbit.enabled = !event.value;
  });
  control.setMode("translate");
  control.setTranslationSnap(1);
  control.setSize(1.2);

  //Create export Button
  //createButton("export", "export", 20, exportScene());


  //EXECUTE THE UPDATE
  animate();
}

//-----------------------------------------------------------------------------------
//HELPER FUNCTIONS
//-----------------------------------------------------------------------------------


// Create Grid
function createGrid() {
  scene.add(new THREE.GridHelper(100, 100, 0xd3d3d3, 0xd3d3d3));
  scene.add(new THREE.GridHelper(100, 10, 0x151515, 0x151515));
}

//BOARDS
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

//BEAMS
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

//JOINT SUBDIVISION
//Joint
function createJoint() {
  /* for (let i = 0; i < 3; i++) {
    const geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
    const material = new THREE.MeshPhysicalMaterial();
    material.color = new THREE.Color("#69f");

    const joint = new THREE.Mesh(geometry, material);
    if (i == 0) {
      joint.position.set(10, 2, 0);
      joint.rotation.set(90 * (Math.PI / 180), 0, 90 * (Math.PI / 180));
    }
    if (i == 1) {
      joint.position.set(0, 12, 0);
    }
    if (i == 2) {
      joint.position.set(0, 2, 10);
      joint.rotation.x = 90 * (Math.PI / 180);
    }
    joint.name = "joint " + jointCounter;
    jointCounter++;
    sceneObjects.push(joint);

    scene.add(joint);
    group.add(joint);
    animate();
  }

  let bspA = CSG.fromMesh(joint);
  let bspB = CSG.fromMesh(joint2);

  let bspC = bspA.union(bspB);

  let finalJointMesh = CSG.toMesh(bspC, joint1.matrix, joint1.material);*/

  const tubegeometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const material = new THREE.MeshPhysicalMaterial();
  material.color = new THREE.Color("#69f");

  const Base = new THREE.Mesh(tubegeometry, material);
  Base.position.set(0, 12, 0);
  Base.name = "joint " + jointCounter;
  jointCounter++;

  const tube2Geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const cone = new THREE.Mesh(tube2Geometry, material);
  cone.position.set(10, 2, 0);
  cone.rotation.z = 90 * (Math.PI / 180);
  cone.name = "joint " + jointCounter;
  jointCounter++;

  const tube3Geometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const spacer = new THREE.Mesh(tube3Geometry, material);
  spacer.position.set(0, 2, 10);
  spacer.rotation.x = 90 * (Math.PI / 180);
  spacer.name = "joint " + jointCounter;
  jointCounter++;

  Base.updateMatrix();
  cone.updateMatrix();
  spacer.updateMatrix();

  let bspA = CSG.fromMesh(Base);
  let bspB = CSG.fromMesh(cone);
  let bspC = CSG.fromMesh(spacer);

  bspA = bspA.union(bspB);
  bspA = bspA.union(bspC);

  let FinalJoint = CSG.toMesh(bspA, Base.matrix, Base.material);

  const geometry = LoopSubdivision.modify(
    FinalJoint.geometry,
    iterations,
    params
  );
  let FinalJointmesh = new THREE.Mesh(geometry, material);
  sceneObjects.push(FinalJointmesh);
  group.add(FinalJointmesh);
  scene.add(FinalJointmesh);

  animate();
}

//JOINT
/*
function createJoint() {
  const originalGeometry = new THREE.CylinderGeometry(2, 2, 20, 32);
  const morphTarget1 = new THREE.BoxGeometry(2, 2, 20, 32);
  geometry.morphAttributes.position[0] = new THREE.Float32BufferAttribute(
    spherePositions,
    3
  );
  originalGeometry.morphTargets = [
    { name: "target1", vertices: morphTarget1.vertices },
  ];
  const material = new THREE.MeshBasicMaterial({
    color: 0x00ff00,
  });
  const mesh = new THREE.Mesh(originalGeometry, material);
  scene.add(mesh);
  mesh.morphTargetInfluences[0] = 0.5;
}
*/
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

//KEY PRESSED
function onKey() {
  if (event.key === "Escape") {
    deselectTransformedObject();
  }
  if (event.key === "Backspace") {
    deleteTransformedObject();
  }
  if (event.key === "Shift") {
    control.setRotationSnap(THREE.MathUtils.degToRad(15));
    control.setTranslationSnap(10);
  }
}

//KEY RELEASED
function upKey() {
  if (event.key === "Shift") {
    control.setRotationSnap(false);
    control.setTranslationSnap(1);
  }
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

function moveMode() {
  control.setMode("translate");
}

function rotateMode() {
  control.setMode("rotate");
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

function addMaterialToLibrary() {}

//ANIMATE AND RENDER
function animate() {
  requestAnimationFrame(animate);

  orbit.update();

  renderer.render(scene, camera);
}
//-----------------------------------------------------------------------------------
// EXECUTE MAIN
//-----------------------------------------------------------------------------------


main();
