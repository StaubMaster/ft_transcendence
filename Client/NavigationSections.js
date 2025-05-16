function Selections_Hide(name) {
    let sections = document.getElementsByName(name);
    for (let i = 0; i < sections.length; i++) {
        sections[i].style.display = "none";
    }
}
function Bar_UnSelect(name) {
    const navs = document.getElementsByName(name);
    for (let i = 0; i < navs.length; i++) {
        navs[i].className = navs[i].className.replace(" font-bold", "");
    }
}
const bar_main = document.getElementById("main-nav");
export function Sections_Main_Hide() { Selections_Hide("main-section"); }
export function Bar_Main_Show() { Bar_Main_UnSelect(); bar_main.style.display = "block"; }
export function Bar_Main_Hide() { Bar_Main_UnSelect(); bar_main.style.display = "none"; }
export function Bar_Main_UnSelect() { Bar_UnSelect("main-nav-elem"); }
function Bar_Main_Select(nav, section) {
    Sections_Main_Hide();
    Bar_Main_UnSelect();
    nav.className += " font-bold";
    section.style.display = "block";
}
const nav_main_tournament = document.getElementById("main-nav-tournament");
const nav_main_1v1 = document.getElementById("main-nav-1v1");
const nav_main_friends = document.getElementById("main-nav-friends");
const nav_main_profile = document.getElementById("main-nav-profile");
const section_main_tournament = document.getElementById("main-section-tournament");
const section_main_1v1 = document.getElementById("main-section-1v1");
const section_main_friends = document.getElementById("main-section-friends");
const section_main_profile = document.getElementById("main-section-profile");
nav_main_tournament.onclick = function () { Bar_Main_Select(nav_main_tournament, section_main_tournament); };
nav_main_1v1.onclick = function () { Bar_Main_Select(nav_main_1v1, section_main_1v1); };
nav_main_friends.onclick = function () { Bar_Main_Select(nav_main_friends, section_main_friends); };
nav_main_profile.onclick = function () { Bar_Main_Select(nav_main_profile, section_main_profile); };
const bar_1v1 = document.getElementById("1v1-nav");
export function Sections_1v1_Hide() { Selections_Hide("1v1-section"); }
export function Bar_1v1_Show() { bar_1v1.style.display = "block"; }
export function Bar_1v1_Hide() { bar_1v1.style.display = "none"; }
export function Bar_1v1_UnSelect() { Bar_UnSelect("1v1-nav-elem"); }
function Bar_1v1_Select(nav, section) {
    Sections_1v1_Hide();
    Bar_1v1_UnSelect();
    nav.className += " font-bold";
    section.style.display = "block";
}
const nav_1v1_invite = document.getElementById("1v1-nav-invite");
const nav_1v1_data = document.getElementById("1v1-nav-data");
const section_1v1_invite = document.getElementById("1v1-section-invite");
const section_1v1_data = document.getElementById("1v1-section-data");
nav_1v1_invite.onclick = function () { Bar_1v1_Select(nav_1v1_invite, section_1v1_invite); };
nav_1v1_data.onclick = function () { Bar_1v1_Select(nav_1v1_data, section_1v1_data); };
