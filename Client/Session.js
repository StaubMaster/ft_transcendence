import * as nav from './navigator.js';
import * as invite from './invite.js';
export function Start() {
    nav.Navigator_Main_Hide();
    nav.Navigator_1v1_Hide();
    document.getElementById("game-section").style.display = "block";
}
export function End() {
    nav.Navigator_Main_Show();
    invite.Invite_Set(-1);
    document.getElementById("game-section").style.display = "none";
}
