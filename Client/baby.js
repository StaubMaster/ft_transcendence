import * as BABYLON from './node_modules/@babylonjs/core/';

const canvas = document.getElementById('session-canvas');

const engine = new BABYLON.Engine(canvas);
var box;
var ball;

const createScene = function()
{
	const scene = new BABYLON.Scene(engine);

	scene.createDefaultCameraOrLight(true, false, true);

	box = new BABYLON.MeshBuilder.CreateBox();
	box.position.x = 3;

	ball = new BABYLON.MeshBuilder.CreateBox();

	return scene;
}

export function BallFunc(str)
{
	//console.log("'" + str + "'");
	var data = JSON.parse(str);

	//console.log(data);
	//console.log("scaleX: " + (data.box.max[0] - data.box.min[0]));
	//console.log("scaleY: " + (data.box.max[1] - data.box.min[1]));
	//console.log("posX: " + (data.box.max[0] + data.box.min[0]) * 0.5);
	//console.log("posY: " + (data.box.max[1] + data.box.min[1]) * 0.5);

	ball.scaling.x = data.box.max[0] - data.box.min[0];
	ball.scaling.y = data.box.max[1] - data.box.min[1];
	ball.scaling.z = ball.scaling.x;

	ball.position.x = (data.box.max[0] + data.box.min[0]) * 0.5;
	ball.position.y = (data.box.max[1] + data.box.min[1]) * 0.5;
}
window.BallFunc = BallFunc;


const scene = createScene();

engine.runRenderLoop(function()
{
	scene.render();
});

