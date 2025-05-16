import * as api from './API_Const.js';
import * as invite from './invite.js';
import * as ws from './WebSockert.js';
import * as NavSec from './NavigationSections.js';
import * as BABYLON from '../node_modules/@babylonjs/core/index.js';
export function Start() {
    NavSec.Bar_Main_Hide();
    NavSec.Sections_Main_Hide();
    document.getElementById("game-section").style.display = "block";
}
export function End() {
    NavSec.Sections_Main_Hide();
    NavSec.Bar_Main_Show();
    invite.Invite_Set(-1);
    document.getElementById("game-section").style.display = "none";
}
const canvas = document.getElementById("game-canvas");
const engine = new BABYLON.Engine(canvas);
var ball;
var wall0;
var wall1;
var wall2;
var wall3;
var paddleL;
var paddleR;
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.createDefaultCameraOrLight(true, false, true);
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
};
function BoxToScale(box) {
    return new BABYLON.Vector3(box.max.x - box.min.x, box.max.y - box.min.y, 0.01);
}
function BoxToPos(box) {
    return new BABYLON.Vector3((box.max.x + box.min.x) * 0.5, (box.max.y + box.min.y) * 0.5, 0.0);
}
export function DataChange(str) {
    var full_data = JSON.parse(str);
    if (full_data.name == api.SIMULATION_BALL) {
        var data = full_data.data;
        ball.scaling = BoxToScale(data.box);
        ball.position = BoxToPos(data.box);
    }
    else if (full_data.name == api.SIMULATION_WALL0) {
        var data = full_data.data;
        wall0.scaling = BoxToScale(data);
        wall0.position = BoxToPos(data);
    }
    else if (full_data.name == api.SIMULATION_WALL1) {
        var data = full_data.data;
        wall1.scaling = BoxToScale(data);
        wall1.position = BoxToPos(data);
    }
    else if (full_data.name == api.SIMULATION_WALL2) {
        var data = full_data.data;
        wall2.scaling = BoxToScale(data);
        wall2.position = BoxToPos(data);
    }
    else if (full_data.name == api.SIMULATION_WALL3) {
        var data = full_data.data;
        wall3.scaling = BoxToScale(data);
        wall3.position = BoxToPos(data);
    }
    else if (full_data.name == api.SIMULATION_PADDLE_L) {
        var data = full_data.data;
        paddleL.scaling = BoxToScale(data.box);
        paddleL.position = BoxToPos(data.box);
    }
    else if (full_data.name == api.SIMULATION_PADDLE_R) {
        var data = full_data.data;
        paddleR.scaling = BoxToScale(data.box);
        paddleR.position = BoxToPos(data.box);
    }
    else {
        console.log(full_data);
    }
}
const scene = createScene();
var MoveUpKeyPressed = false;
var MoveDwKeyPressed = false;
function CheckKeyChangedPress(key, key_check, pressed, api_press) {
    if (key == key_check) {
        if (!pressed) {
            ws.WebSocket_Send(api.API_USER_SESSION + api_press);
            return true;
        }
    }
    return pressed;
}
function CheckKeyChangedRelease(key, key_check, pressed, api_release) {
    if (key == key_check) {
        if (pressed) {
            ws.WebSocket_Send(api.API_USER_SESSION + api_release);
            return false;
        }
    }
    return pressed;
}
scene.onKeyboardObservable.add(function (key_info) {
    if (key_info.type == BABYLON.KeyboardEventTypes.KEYDOWN) {
        MoveUpKeyPressed = CheckKeyChangedPress(key_info.event.key, "w", MoveUpKeyPressed, api.USER_INPUT_UP_PRESS);
        MoveDwKeyPressed = CheckKeyChangedPress(key_info.event.key, "s", MoveDwKeyPressed, api.USER_INPUT_DW_PRESS);
    }
    else if (key_info.type == BABYLON.KeyboardEventTypes.KEYUP) {
        MoveUpKeyPressed = CheckKeyChangedRelease(key_info.event.key, "w", MoveUpKeyPressed, api.USER_INPUT_UP_RELEASE);
        MoveDwKeyPressed = CheckKeyChangedRelease(key_info.event.key, "s", MoveDwKeyPressed, api.USER_INPUT_DW_RELEASE);
    }
});
engine.runRenderLoop(function () {
    scene.render();
});
window.addEventListener('resize', function () {
    engine.resize();
});
