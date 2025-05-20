import * as api from './API_Const.js';
import * as invite from './SessionInvite.js'
import * as ws from './WebSockert.js';
import * as NavSec from './NavigationSections.js';
import * as BABYLON from '../../node_modules/@babylonjs/core/index.js';



export function Start()
{
	NavSec.BarMain.Sections_Hide();
	NavSec.BarMain.Hide();
	(document.getElementById("game-section") as HTMLElement).style.display = "block";
}
export function End()
{
	NavSec.BarMain.Sections_Hide();
	NavSec.BarMain.Show();
	invite.Invite_Set(-1);
	(document.getElementById("game-section") as HTMLElement).style.display = "none";
}



const canvas = document.getElementById("game-canvas") as HTMLCanvasElement;

const engine = new BABYLON.Engine(canvas);
var ball: BABYLON.Mesh;
var wall0: BABYLON.Mesh;
var wall1: BABYLON.Mesh;
var wall2: BABYLON.Mesh;
var wall3: BABYLON.Mesh;
var paddleL: BABYLON.Mesh;
var paddleR: BABYLON.Mesh;

const createScene = function()
{
	const scene = new BABYLON.Scene(engine);

	scene.createDefaultCameraOrLight(true, false, false);

	ball = BABYLON.MeshBuilder.CreateBox("ball");
	wall0 = BABYLON.MeshBuilder.CreateBox("wall0");
	wall1 = BABYLON.MeshBuilder.CreateBox("wall1");
	wall2 = BABYLON.MeshBuilder.CreateBox("wall2");
	wall3 = BABYLON.MeshBuilder.CreateBox("wall3");
	paddleL = BABYLON.MeshBuilder.CreateBox("paddleL");
	paddleR = BABYLON.MeshBuilder.CreateBox("paddleR");

	ball.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall0.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall1.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall2.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	wall3.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	paddleL.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);
	paddleR.scaling = new BABYLON.Vector3(0.01, 0.01, 0.01);

	return scene;
}

function BoxToScale(box: any)
{
	return new BABYLON.Vector3(
		box.max.x - box.min.x,
		box.max.y - box.min.y,
		0.01
	);
}
function BoxToPos(box: any)
{
	return new BABYLON.Vector3(
		(box.max.x + box.min.x) * 0.5,
		(box.max.y + box.min.y) * 0.5,
		0.0
	);
}



export function DataChange(str: string)
{
	var full_data = JSON.parse(str);

	if (full_data.name == api.SIMULATION_BALL)
	{
		var data = full_data.data;
		ball.scaling = BoxToScale(data.box);
		ball.position = BoxToPos(data.box);
	}
	else if (full_data.name == api.SIMULATION_WALL0)
	{
		var data = full_data.data;
		wall0.scaling = BoxToScale(data);
		wall0.position = BoxToPos(data);
	}
	else if (full_data.name == api.SIMULATION_WALL1)
	{
		var data = full_data.data;
		wall1.scaling = BoxToScale(data);
		wall1.position = BoxToPos(data);
	}
	else if (full_data.name == api.SIMULATION_WALL2)
	{
		var data = full_data.data;
		wall2.scaling = BoxToScale(data);
		wall2.position = BoxToPos(data);
	}
	else if (full_data.name == api.SIMULATION_WALL3)
	{
		var data = full_data.data;
		wall3.scaling = BoxToScale(data);
		wall3.position = BoxToPos(data);
	}
	else if (full_data.name == api.SIMULATION_PADDLE_L)
	{
		var data = full_data.data;
		paddleL.scaling = BoxToScale(data.box);
		paddleL.position = BoxToPos(data.box);
	}
	else if (full_data.name == api.SIMULATION_PADDLE_R)
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



const scene = createScene();

var InputLUpKeyPressed = false;
var InputLDwKeyPressed = false;
var InputRUpKeyPressed = false;
var InputRDwKeyPressed = false;

function CheckKeyChangedPress(key: string, key_check: string, pressed: boolean, api_press: string)
{
	if (key == key_check)
	{
		if (!pressed)
		{
			ws.WebSocket_Send(api.API_USER_SESSION + api_press);
			return true;
		}
	}
	return pressed;
}
function CheckKeyChangedRelease(key: string, key_check: string, pressed: boolean, api_release: string)
{
	if (key == key_check)
	{
		if (pressed)
		{
			ws.WebSocket_Send(api.API_USER_SESSION + api_release);
			return false;
		}
	}
	return pressed;
}

scene.onKeyboardObservable.add(function(key_info)
{
	if (key_info.type == BABYLON.KeyboardEventTypes.KEYDOWN)
	{
		InputLUpKeyPressed = CheckKeyChangedPress(key_info.event.key, "w", InputLUpKeyPressed, api.USER_INPUT_L_UP_PRESS);
		InputLDwKeyPressed = CheckKeyChangedPress(key_info.event.key, "s", InputLDwKeyPressed, api.USER_INPUT_L_DW_PRESS);
		InputRUpKeyPressed = CheckKeyChangedPress(key_info.event.key, "o", InputRUpKeyPressed, api.USER_INPUT_R_UP_PRESS);
		InputRDwKeyPressed = CheckKeyChangedPress(key_info.event.key, "l", InputRDwKeyPressed, api.USER_INPUT_R_DW_PRESS);
	}
	else if (key_info.type == BABYLON.KeyboardEventTypes.KEYUP)
	{
		InputLUpKeyPressed = CheckKeyChangedRelease(key_info.event.key, "w", InputLUpKeyPressed, api.USER_INPUT_L_UP_RELEASE);
		InputLDwKeyPressed = CheckKeyChangedRelease(key_info.event.key, "s", InputLDwKeyPressed, api.USER_INPUT_L_DW_RELEASE);
		InputRUpKeyPressed = CheckKeyChangedRelease(key_info.event.key, "o", InputRUpKeyPressed, api.USER_INPUT_R_UP_RELEASE);
		InputRDwKeyPressed = CheckKeyChangedRelease(key_info.event.key, "l", InputRDwKeyPressed, api.USER_INPUT_R_DW_RELEASE);
	}
});

engine.runRenderLoop(function ()
{
	scene.render();
});

window.addEventListener('resize', function()
{
	engine.resize();
});


