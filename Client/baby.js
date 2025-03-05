import * as BABYLON from './node_modules/@babylonjs/core/';

const canvas = document.getElementById('session-canvas');

const engine = new BABYLON.Engine(canvas);
var ball;
var wall0;
var wall1;
var wall2;
var wall3;
var paddleL;
var paddleR;

const createScene = function()
{
	const scene = new BABYLON.Scene(engine);

	scene.createDefaultCameraOrLight(true, false, true);

	ball = new BABYLON.MeshBuilder.CreateBox();
	wall0 = new BABYLON.MeshBuilder.CreateBox();
	wall1 = new BABYLON.MeshBuilder.CreateBox();
	wall2 = new BABYLON.MeshBuilder.CreateBox();
	wall3 = new BABYLON.MeshBuilder.CreateBox();
	paddleL = new BABYLON.MeshBuilder.CreateBox();
	paddleR = new BABYLON.MeshBuilder.CreateBox();

	ball.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall0.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall1.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall2.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall3.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	paddleL.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	paddleR.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);

	return scene;
}

function BoxToScale(box)
{
	return new BABYLON.Vector3(
		box.max.x - box.min.x,
		box.max.y - box.min.y,
		0.1
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

export function SimulationDataChangeFunc(str)
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
	else if (full_data.name == "PaddleL")
	{
		var data = full_data.data;
		paddleL.scaling = BoxToScale(data.box);
		paddleL.position = BoxToPos(data.box);
	}
	else if (full_data.name == "PaddleR")
	{
		var data = full_data.data;
		paddleR.scaling = BoxToScale(data.box);
		paddleR.position = BoxToPos(data.box);
	}
	else
	{
		console.log(full_data);
	}
}
window.SimulationDataChangeFunc = SimulationDataChangeFunc;

const scene = createScene();

var MoveUpKeyPressed = false;
var MoveDwKeyPressed = false;

scene.onKeyboardObservable.add(function(key_info)
{
	if (key_info.type == BABYLON.KeyboardEventTypes.KEYDOWN)
	{
		if (key_info.event.key == "w")
		{
			if (!MoveUpKeyPressed)
			{
				MoveUpKeyPressed = true;
				Websocket_Send("Session-Simulation-Input: UP");
			}
		}
		if (key_info.event.key == "s")
		{
			if (!MoveDwKeyPressed)
			{
				MoveDwKeyPressed = true;
				Websocket_Send("Session-Simulation-Input: DW");
			}
		}
	}
	else if (key_info.type == BABYLON.KeyboardEventTypes.KEYUP)
	{
		if (key_info.event.key == "w")
		{
			if (MoveUpKeyPressed)
			{
				MoveUpKeyPressed = false;
				Websocket_Send("Session-Simulation-Input: !UP");
			}
		}
		if (key_info.event.key == "s")
		{
			if (MoveDwKeyPressed)
			{
				MoveDwKeyPressed = false;
				Websocket_Send("Session-Simulation-Input: !DW");
			}
		}
	}
});

engine.runRenderLoop(function()
{
	scene.render();
});

window.addEventListener('resize', function()
{
	engine.resize();
});
