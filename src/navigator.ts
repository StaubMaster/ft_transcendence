
export function MainNavigator_Show()
{
	let nav: HTMLElement | null = document.getElementById("main-nav");
	if (nav)
	{
		nav.style.display = "block";
	}
}
export function MainNavigator_Hide()
{
	let nav: HTMLElement | null = document.getElementById("main-nav");
	if (nav)
	{
		nav.style.display = "none";
	}
}






export function MainNavigator_Select(event: Event, sectionName: string)
{
	if (event.target instanceof HTMLElement)
	{
		let elems = document.getElementsByName("main-nav-elem");
		for (let i = 0; i < elems.length; i++)
		{
			elems[i].className = elems[i].className.replace(" font-bold", "");
		}

		let elem: HTMLElement = event.target;
		elem.className += " font-bold";

		let section: HTMLElement | null = document.getElementById(sectionName)
		if (section)
		{
			MainSections_Select(section);
		}
	}
}
export function MainSections_Select(elem :HTMLElement)
{
	let elems = document.getElementsByName("main-section");
	for (let i = 0; i < elems.length; i++)
	{
		elems[i].style.display = "none";
	}
	elem.style.display = "block";
}



