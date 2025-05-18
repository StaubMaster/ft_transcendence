class BarNavigationSections {
    constructor(bar_id, ids) {
        this.bar = document.getElementById(bar_id);
        this.selection = [];
        this.sections = [];
        for (let i = 0; i < ids.length; i++) {
            this.selection[i] = document.getElementById(ids[i][0]);
            this.sections[i] = document.getElementById(ids[i][1]);
            this.selection[i].onclick = () => {
                this.Sections_Hide();
                this.UnSelect();
                this.selection[i].className += " font-bold";
                this.sections[i].style.display = "block";
            };
        }
    }
    Show() { this.bar.style.display = "block"; }
    Hide() { this.bar.style.display = "none"; }
    Sections_Hide() {
        for (let i = 0; i < this.sections.length; i++) {
            this.sections[i].style.display = "none";
        }
    }
    UnSelect() {
        for (let i = 0; i < this.selection.length; i++) {
            this.selection[i].className = this.selection[i].className.replace(" font-bold", "");
        }
    }
}
export const BarMain = new BarNavigationSections("main-nav", [
    ["main-nav-tournament", "main-section-tournament"],
    ["main-nav-1v1", "main-section-1v1"],
    ["main-nav-friends", "main-section-friends"],
    ["main-nav-profile", "main-section-profile"],
]);
export const Bar1v1 = new BarNavigationSections("1v1-nav", [
    ["1v1-nav-invite", "1v1-section-invite"],
    ["1v1-nav-search", "1v1-section-search"],
]);
export const BarFriends = new BarNavigationSections("friends-nav", [
    ["friends-nav-requests-recv", "friends-section-requests-recv"],
    ["friends-nav-requests-send", "friends-section-requests-send"],
    ["friends-nav-list", "friends-section-list"],
]);
export const BarProfile = new BarNavigationSections("profile-nav", [
    ["profile-nav-personal", "profile-section-personal"],
    ["profile-nav-statstics", "profile-section-statstics"],
]);
