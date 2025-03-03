import * as BABYLON from './node_modules/@babylonjs/core/';

const canvas = document.getElementById('session-canvas');

const engine = new BABYLON.Engine(canvas);
var box;
var ball;
var wall0;
var wall1;
var wall2;
var wall3;

const createScene = function()
{
	const scene = new BABYLON.Scene(engine);

	scene.createDefaultCameraOrLight(true, false, true);

	box = new BABYLON.MeshBuilder.CreateBox();
	box.position.x = 3;

	ball = new BABYLON.MeshBuilder.CreateBox();
	wall0 = new BABYLON.MeshBuilder.CreateBox();
	wall1 = new BABYLON.MeshBuilder.CreateBox();
	wall2 = new BABYLON.MeshBuilder.CreateBox();
	wall3 = new BABYLON.MeshBuilder.CreateBox();

	return scene;
}

function BoxToScale(box)
{
	return new BABYLON.Vector3(
		box.max.x - box.min.x,
		box.max.y - box.min.y,
		0.01
	);
}
function BoxToPos(box)
{
	return new BABYLON.Vector3(
		(box.max.x + box.min.x) * 0.5,
		(box.max.y + box.min.y) * 0.5,
		0.0
	);
}

export function SessionDataChangeFunc(str)
{
	//console.log("'" + str + "'");
	var full_data = JSON.parse(str);

	if (full_data.name == "Ball")
	{
		var data = full_data.data;
		ball.scaling = BoxToScale(data.box);
		ball.position = BoxToPos(data.box);
	}
	else if (full_data.name == "Wall0")
	{
		var data = full_data.data;
		wall0.scaling = BoxToScale(data);
		wall0.position = BoxToPos(data);
	}
	else if (full_data.name == "Wall1")
	{
		var data = full_data.data;
		wall1.scaling = BoxToScale(data);
		wall1.position = BoxToPos(data);
	}
	else if (full_data.name == "Wall2")
	{
		var data = full_data.data;
		wall2.scaling = BoxToScale(data);
		wall2.position = BoxToPos(data);
	}
	else if (full_data.name == "Wall3")
	{
		var data = full_data.data;
		wall3.scaling = BoxToScale(data);
		wall3.position = BoxToPos(data);
	}
	else
	{
		console.log(full_data);
	}
}
window.SessionDataChangeFunc = SessionDataChangeFunc;


const scene = createScene();

engine.runRenderLoop(function()
{
	scene.render();
});

