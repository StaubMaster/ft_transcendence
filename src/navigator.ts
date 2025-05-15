
export function Navigator_Main_Show()
{
	let nav: HTMLElement | null = document.getElementById("main-nav");
	if (nav)
	{
		nav.style.display = "block";
	}
}
export function Navigator_Main_Hide()
{
	let nav: HTMLElement | null = document.getElementById("main-nav");
	if (nav)
	{
		nav.style.display = "none";
	}
	Navigator_Main_UnSelect();
}



export function Navigator_Main_UnSelect()
{
	Navigator_1v1_UnSelect();

	let navs = document.getElementsByName("main-nav-elem");
	for (let i = 0; i < navs.length; i++)
	{
		navs[i].className = navs[i].className.replace(" font-bold", "");
	}

	let sections = document.getElementsByName("main-section");
	for (let i = 0; i < sections.length; i++)
	{
		sections[i].style.display = "none";
	}
}
function Navigator_Main_Select(navName: string, sectionName: string)
{
	Navigator_Main_UnSelect();

	let nav = document.getElementById(navName) as HTMLElement;
	let section = document.getElementById(sectionName) as HTMLElement;

	nav.className += " font-bold";
	section.style.display = "block";
}



export function Navigator_Main_Tournament()
{
	Navigator_Main_Select("main-nav-tournament", "main-section-tournament");
}
export function Navigator_Main_1v1()
{
	Navigator_Main_Select("main-nav-1v1", "main-section-1v1");
}
export function Navigator_Main_Friends()
{
	Navigator_Main_Select("main-nav-friends", "main-section-friends");
}
export function Navigator_Main_Profile()
{
	Navigator_Main_Select("main-nav-profile", "main-section-profile");
}

(document.getElementById("main-nav-tournament") as HTMLButtonElement).onclick = Navigator_Main_Tournament;
(document.getElementById("main-nav-1v1") as HTMLButtonElement).onclick = Navigator_Main_1v1;
(document.getElementById("main-nav-friends") as HTMLButtonElement).onclick = Navigator_Main_Friends;
(document.getElementById("main-nav-profile") as HTMLButtonElement).onclick = Navigator_Main_Profile;







export function Navigator_1v1_Show()
{
	//let nav: HTMLElement | null = document.getElementById("1v1-nav");
	//if (nav)
	//{
	//	nav.style.display = "block";
	//}
}
export function Navigator_1v1_Hide()
{
	//let nav: HTMLElement | null = document.getElementById("1v1-nav");
	//if (nav)
	//{
	//	nav.style.display = "none";
	//}
	Navigator_Main_UnSelect();
}



export function Navigator_1v1_UnSelect()
{
	let navs = document.getElementsByName("1v1-nav-elem");
	for (let i = 0; i < navs.length; i++)
	{
		navs[i].className = navs[i].className.replace(" font-bold", "");
	}

	let sections = document.getElementsByName("1v1-section");
	for (let i = 0; i < sections.length; i++)
	{
		sections[i].style.display = "none";
	}
}
function Navigator_1v1_Select(navName: string, sectionName: string)
{
	Navigator_1v1_UnSelect();

	let nav = document.getElementById(navName) as HTMLElement;
	let section = document.getElementById(sectionName) as HTMLElement;

	nav.className += " font-bold";
	section.style.display = "block";
}



export function Navigator_1v1_Invite()
{
	Navigator_1v1_Select("1v1-nav-invite", "1v1-section-invite");
}
export function Navigator_1v1_Data()
{
	Navigator_1v1_Select("1v1-nav-data", "1v1-section-data");
}

(document.getElementById("1v1-nav-invite") as HTMLButtonElement).onclick = Navigator_1v1_Invite;
(document.getElementById("1v1-nav-data") as HTMLButtonElement).onclick = Navigator_1v1_Data;
